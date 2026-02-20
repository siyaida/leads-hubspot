from typing import Optional
from pydantic import BaseModel


class PipelineRunRequest(BaseModel):
    query: str
    sender_context: Optional[str] = ""


class PipelineStatusResponse(BaseModel):
    session_id: str
    status: str
    result_count: int
    message: str = ""
