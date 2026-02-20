import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

APOLLO_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/search"


async def search_people(
    domain: str,
    title_keywords: Optional[list[str]] = None,
    seniority: Optional[list[str]] = None,
    api_key_override: Optional[str] = None,
) -> list[dict]:
    """Search for people at a company using the Apollo API."""
    api_key = api_key_override or settings.get_api_key("apollo")
    if not api_key:
        return [
            {
                "error": "Apollo API key is not configured. Please add it in Settings.",
            }
        ]

    payload: dict = {
        "q_organization_domains": domain,
        "page": 1,
        "per_page": 10,
    }

    if title_keywords:
        payload["person_titles"] = title_keywords

    if seniority:
        # Apollo expects: senior, manager, director, vp, c_suite, etc.
        payload["person_seniorities"] = seniority

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                APOLLO_SEARCH_URL,
                json=payload,
                headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

        people = data.get("people", [])
        results = []
        for person in people:
            org = person.get("organization", {}) or {}
            results.append(
                {
                    "first_name": person.get("first_name", ""),
                    "last_name": person.get("last_name", ""),
                    "email": person.get("email", ""),
                    "email_status": person.get("email_status", ""),
                    "phone": _get_phone(person),
                    "title": person.get("title", ""),
                    "headline": person.get("headline", ""),
                    "linkedin_url": person.get("linkedin_url", ""),
                    "city": person.get("city", ""),
                    "state": person.get("state", ""),
                    "country": person.get("country", ""),
                    "organization_name": org.get("name", ""),
                    "organization_domain": org.get("primary_domain", domain),
                    "organization_industry": org.get("industry", ""),
                    "organization_size": _get_company_size(org),
                    "organization_linkedin_url": org.get("linkedin_url", ""),
                }
            )
        return results

    except httpx.HTTPStatusError as e:
        logger.error(f"Apollo API error: {e.response.status_code} - {e.response.text[:300]}")
        return [{"error": f"Apollo API error: {e.response.status_code}"}]
    except Exception as e:
        logger.error(f"Unexpected error in Apollo search: {e}")
        return [{"error": str(e)}]


def _get_phone(person: dict) -> str:
    """Extract best phone number from Apollo person data."""
    phone_numbers = person.get("phone_numbers", [])
    if phone_numbers and isinstance(phone_numbers, list):
        for pn in phone_numbers:
            if isinstance(pn, dict) and pn.get("sanitized_number"):
                return pn["sanitized_number"]
            if isinstance(pn, str):
                return pn
    return person.get("phone", "") or ""


def _get_company_size(org: dict) -> str:
    """Extract company size range from Apollo organization data."""
    if not org:
        return ""
    estimated = org.get("estimated_num_employees")
    if estimated:
        return str(estimated)
    size_range = org.get("employee_count_range", "")
    if size_range:
        return str(size_range)
    return ""


async def test_api_key(api_key: str) -> dict:
    """Test an Apollo API key by making a minimal search request."""
    payload = {
        "q_organization_domains": "apollo.io",
        "page": 1,
        "per_page": 1,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                APOLLO_SEARCH_URL,
                json=payload,
                headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()
            people_count = len(data.get("people", []))
            return {
                "service": "apollo",
                "status": "valid",
                "message": f"API key is valid. Test query returned {people_count} contact(s).",
            }
    except httpx.HTTPStatusError as e:
        return {
            "service": "apollo",
            "status": "invalid",
            "message": f"API key validation failed: HTTP {e.response.status_code} - {e.response.text[:200]}",
        }
    except Exception as e:
        return {
            "service": "apollo",
            "status": "invalid",
            "message": f"API key validation failed: {str(e)}",
        }
