from typing import Optional, Dict
from pydantic import BaseModel


class ApiKeyUpdate(BaseModel):
    serper: Optional[str] = None
    apollo: Optional[str] = None
    openai: Optional[str] = None


class ApiKeyStatus(BaseModel):
    configured: bool
    masked_key: str


class ApiKeyTestResponse(BaseModel):
    service: str
    status: str  # "valid" or "invalid"
    message: str


class SettingsResponse(BaseModel):
    serper: ApiKeyStatus
    apollo: ApiKeyStatus
    openai: ApiKeyStatus
