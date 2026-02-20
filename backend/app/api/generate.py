import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.search_session import SearchSession
from app.models.lead import Lead
from app.services import llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("/{session_id}")
async def generate_emails_for_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger email generation for all selected leads in a session."""
    # Verify session belongs to current user
    session = (
        db.query(SearchSession)
        .filter(
            SearchSession.id == session_id,
            SearchSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Get selected leads
    leads = (
        db.query(Lead)
        .filter(Lead.session_id == session_id, Lead.is_selected == True)
        .all()
    )

    if not leads:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No selected leads found for this session",
        )

    success_count = 0
    error_count = 0

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
                lead_data=lead_data,
                sender_context="",
                original_query=session.raw_query,
            )

            if "error" not in email_result:
                lead.personalized_email = email_result.get("body", "")
                lead.email_subject = email_result.get("subject", "")
                lead.suggested_approach = email_result.get("suggested_approach", "")
                success_count += 1
            else:
                logger.warning(f"Email generation error for lead {lead.id}: {email_result['error']}")
                error_count += 1
        except Exception as e:
            logger.error(f"Email generation exception for lead {lead.id}: {e}")
            error_count += 1
            continue

    db.commit()

    return {
        "session_id": session_id,
        "total_leads": len(leads),
        "success_count": success_count,
        "error_count": error_count,
        "message": f"Generated emails for {success_count}/{len(leads)} selected leads.",
    }
