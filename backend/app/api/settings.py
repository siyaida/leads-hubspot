import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.settings import ApiKeyUpdate, ApiKeyTestResponse, SettingsResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/", response_model=SettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
):
    """Return which API keys are configured with masked values."""
    masked = settings.get_all_api_keys_masked()
    return SettingsResponse(
        serper=masked["serper"],
        apollo=masked["apollo"],
        openai=masked["openai"],
    )


@router.put("/keys", response_model=SettingsResponse)
def update_keys(
    payload: ApiKeyUpdate,
    current_user: User = Depends(get_current_user),
):
    """Save new API keys and return updated masked status."""
    if payload.serper is not None:
        settings.set_api_key("serper", payload.serper)
    if payload.apollo is not None:
        settings.set_api_key("apollo", payload.apollo)
    if payload.openai is not None:
        settings.set_api_key("openai", payload.openai)

    masked = settings.get_all_api_keys_masked()
    return SettingsResponse(
        serper=masked["serper"],
        apollo=masked["apollo"],
        openai=masked["openai"],
    )


@router.post("/test/{service}", response_model=ApiKeyTestResponse)
async def test_api_key(
    service: str,
    current_user: User = Depends(get_current_user),
):
    """Test a specific API key by making a real API call."""
    valid_services = ("serper", "apollo", "openai")
    if service not in valid_services:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid service. Must be one of: {', '.join(valid_services)}",
        )

    api_key = settings.get_api_key(service)
    if not api_key:
        return ApiKeyTestResponse(
            service=service,
            status="invalid",
            message=f"{service} API key is not configured.",
        )

    try:
        if service == "serper":
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://google.serper.dev/search",
                    json={"q": "test", "num": 1},
                    headers={
                        "X-API-KEY": api_key,
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
            return ApiKeyTestResponse(
                service=service,
                status="valid",
                message="Serper API key is valid. Test search succeeded.",
            )

        elif service == "apollo":
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.apollo.io/api/v1/mixed_people/search",
                    json={
                        "q_organization_domains": "apollo.io",
                        "page": 1,
                        "per_page": 1,
                    },
                    headers={
                        "X-Api-Key": api_key,
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
            return ApiKeyTestResponse(
                service=service,
                status="valid",
                message="Apollo API key is valid. Test query succeeded.",
            )

        elif service == "openai":
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                    },
                )
                response.raise_for_status()
            return ApiKeyTestResponse(
                service=service,
                status="valid",
                message="OpenAI API key is valid. Models endpoint responded successfully.",
            )

    except httpx.HTTPStatusError as e:
        logger.warning(f"API key test failed for {service}: HTTP {e.response.status_code}")
        return ApiKeyTestResponse(
            service=service,
            status="invalid",
            message=f"API key validation failed: HTTP {e.response.status_code} - {e.response.text[:200]}",
        )
    except Exception as e:
        logger.error(f"API key test error for {service}: {e}")
        return ApiKeyTestResponse(
            service=service,
            status="invalid",
            message=f"API key validation failed: {str(e)}",
        )
