import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.search_session import SearchSession
from app.models.search_result import SearchResult
from app.models.lead import Lead
from app.services import llm_service, serper_service, apollo_service, scraper_service

logger = logging.getLogger(__name__)


def _update_session_status(db: Session, session_id: str, status: str, result_count: Optional[int] = None) -> None:
    """Update the session status and optionally the result count."""
    session = db.query(SearchSession).filter(SearchSession.id == session_id).first()
    if session:
        session.status = status
        session.updated_at = datetime.now(timezone.utc)
        if result_count is not None:
            session.result_count = result_count
        db.commit()


async def run_pipeline(
    session_id: str,
    query: str,
    sender_context: str,
    db: Session,
    settings: Settings,
) -> None:
    """Orchestrate the full lead generation pipeline.

    Steps:
    1. Parse the natural language query with LLM
    2. Search Google via Serper
    3. Scrape discovered URLs for context
    4. Enrich contacts with Apollo
    5. Generate personalized emails with LLM
    """
    try:
        # ---- Step 1: Parse query ----
        _update_session_status(db, session_id, "searching")
        logger.info(f"[{session_id}] Step 1: Parsing query...")

        parsed = await llm_service.parse_query(query)

        # Store parsed query in session
        session = db.query(SearchSession).filter(SearchSession.id == session_id).first()
        if session:
            session.parsed_query = json.dumps(parsed)
            db.commit()

        search_queries = parsed.get("search_queries", [query])
        if not search_queries:
            search_queries = [query]

        # ---- Step 2: Serper search ----
        logger.info(f"[{session_id}] Step 2: Searching with {len(search_queries)} queries...")

        search_results = await serper_service.search(search_queries)

        # Filter out error entries
        valid_results = [r for r in search_results if "error" not in r]
        if not valid_results:
            _update_session_status(db, session_id, "failed")
            logger.error(f"[{session_id}] No search results found")
            return

        # Store search results in DB
        db_results = []
        for item in valid_results:
            sr = SearchResult(
                session_id=session_id,
                title=item.get("title", ""),
                url=item.get("url", ""),
                snippet=item.get("snippet", ""),
                domain=item.get("domain", ""),
                position=item.get("position"),
                raw_data=json.dumps(item.get("raw_data", {})),
            )
            db.add(sr)
            db_results.append(sr)
        db.commit()

        _update_session_status(db, session_id, "enriching", result_count=len(db_results))
        logger.info(f"[{session_id}] Found {len(db_results)} search results")

        # ---- Step 3: Scrape URLs for context ----
        logger.info(f"[{session_id}] Step 3: Scraping URLs for context...")

        urls_to_scrape = [r.url for r in db_results if r.url][:15]  # Limit to 15
        scraped_data = await scraper_service.scrape_many(urls_to_scrape)

        # Build a map of url -> scraped content
        scraped_map = {}
        for sd in scraped_data:
            url = sd.get("url", "")
            if url and not sd.get("error"):
                context_parts = []
                if sd.get("title"):
                    context_parts.append(sd["title"])
                if sd.get("meta_description"):
                    context_parts.append(sd["meta_description"])
                if sd.get("text_content"):
                    context_parts.append(sd["text_content"][:500])
                scraped_map[url] = " | ".join(context_parts)

        # ---- Step 4: Apollo enrichment ----
        logger.info(f"[{session_id}] Step 4: Enriching with Apollo...")

        # Get unique domains from search results
        unique_domains = list(set(r.domain for r in db_results if r.domain))[:10]
        title_keywords = parsed.get("job_titles", [])
        seniority = parsed.get("seniority_levels", [])

        all_leads_data = []
        for domain in unique_domains:
            try:
                people = await apollo_service.search_people(
                    domain=domain,
                    title_keywords=title_keywords if title_keywords else None,
                    seniority=seniority if seniority else None,
                )
                # Filter out error entries
                valid_people = [p for p in people if "error" not in p]

                # Find the search result for this domain to link to it
                matching_result = next(
                    (r for r in db_results if r.domain == domain), None
                )
                result_id = matching_result.id if matching_result else None
                url_for_domain = matching_result.url if matching_result else ""

                for person in valid_people:
                    person["_search_result_id"] = result_id
                    person["_scraped_context"] = scraped_map.get(url_for_domain, "")
                    all_leads_data.append(person)
            except Exception as e:
                logger.error(f"[{session_id}] Apollo error for domain {domain}: {e}")
                continue

        # If Apollo returned no people, create leads from search results directly
        if not all_leads_data:
            logger.info(f"[{session_id}] No Apollo results, creating leads from search results")
            for sr in db_results:
                lead = Lead(
                    session_id=session_id,
                    search_result_id=sr.id,
                    company_name=sr.title or "",
                    company_domain=sr.domain or "",
                    scraped_context=scraped_map.get(sr.url, ""),
                )
                db.add(lead)
            db.commit()
        else:
            # Store leads in DB
            for person in all_leads_data:
                lead = Lead(
                    session_id=session_id,
                    search_result_id=person.get("_search_result_id"),
                    first_name=person.get("first_name", ""),
                    last_name=person.get("last_name", ""),
                    email=person.get("email", ""),
                    email_status=person.get("email_status", ""),
                    phone=person.get("phone", ""),
                    job_title=person.get("title", ""),
                    headline=person.get("headline", ""),
                    linkedin_url=person.get("linkedin_url", ""),
                    city=person.get("city", ""),
                    state=person.get("state", ""),
                    country=person.get("country", ""),
                    company_name=person.get("organization_name", ""),
                    company_domain=person.get("organization_domain", ""),
                    company_industry=person.get("organization_industry", ""),
                    company_size=person.get("organization_size", ""),
                    company_linkedin_url=person.get("organization_linkedin_url", ""),
                    scraped_context=person.get("_scraped_context", ""),
                )
                db.add(lead)
            db.commit()

        # ---- Step 5: Generate emails ----
        _update_session_status(db, session_id, "generating")
        logger.info(f"[{session_id}] Step 5: Generating personalized emails...")

        leads = (
            db.query(Lead)
            .filter(Lead.session_id == session_id, Lead.is_selected == True)
            .all()
        )

        for lead in leads:
            try:
                lead_data = {
                    "first_name": lead.first_name,
                    "last_name": lead.last_name,
                    "job_title": lead.job_title,
                    "company_name": lead.company_name,
                    "company_industry": lead.company_industry,
                    "city": lead.city,
                    "state": lead.state,
                    "country": lead.country,
                    "linkedin_url": lead.linkedin_url,
                    "scraped_context": lead.scraped_context,
                }
                email_result = await llm_service.generate_email(
                    lead_data, sender_context, query
                )
                if "error" not in email_result:
                    lead.personalized_email = email_result.get("body", "")
                    lead.email_subject = email_result.get("subject", "")
                    lead.suggested_approach = email_result.get("suggested_approach", "")
                else:
                    logger.warning(
                        f"[{session_id}] Email generation error for lead {lead.id}: {email_result['error']}"
                    )
            except Exception as e:
                logger.error(f"[{session_id}] Email generation failed for lead {lead.id}: {e}")
                continue

        db.commit()

        # ---- Done ----
        final_count = (
            db.query(Lead).filter(Lead.session_id == session_id).count()
        )
        _update_session_status(db, session_id, "completed", result_count=final_count)
        logger.info(f"[{session_id}] Pipeline completed with {final_count} leads")

    except Exception as e:
        logger.error(f"[{session_id}] Pipeline failed: {e}", exc_info=True)
        _update_session_status(db, session_id, "failed")
