from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LeadResponse(BaseModel):
    id: str
    session_id: str
    search_result_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    email_status: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    headline: Optional[str] = None
    linkedin_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    company_name: Optional[str] = None
    company_domain: Optional[str] = None
    company_industry: Optional[str] = None
    company_size: Optional[str] = None
    company_linkedin_url: Optional[str] = None
    scraped_context: Optional[str] = None
    personalized_email: Optional[str] = None
    email_subject: Optional[str] = None
    suggested_approach: Optional[str] = None
    is_selected: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeadUpdate(BaseModel):
    is_selected: Optional[bool] = None


class EmailUpdate(BaseModel):
    personalized_email: Optional[str] = None
    email_subject: Optional[str] = None
    suggested_approach: Optional[str] = None
