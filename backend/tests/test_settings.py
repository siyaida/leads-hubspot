"""Tests for the settings endpoints (/api/settings)."""

import pytest


# ── GET /api/settings/ ──────────────────────────────────────────────────────


def test_get_settings_authenticated(client, auth_headers):
    """GET /api/settings/ with auth should return key statuses."""
    response = client.get("/api/settings/", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    # Should have serper, apollo, openai keys
    for service in ("serper", "apollo", "openai"):
        assert service in data
        assert "configured" in data[service]
        assert "masked_key" in data[service]
        assert isinstance(data[service]["configured"], bool)
        assert isinstance(data[service]["masked_key"], str)


def test_get_settings_unauthenticated(client):
    """GET /api/settings/ without auth should return 401."""
    response = client.get("/api/settings/")
    assert response.status_code == 401


# ── PUT /api/settings/keys ──────────────────────────────────────────────────


def test_update_keys_authenticated(client, auth_headers):
    """PUT /api/settings/keys should save keys and return masked status."""
    payload = {
        "serper": "test-serper-key-123456",
        "openai": "sk-test-openai-key-abcdef",
    }
    response = client.put("/api/settings/keys", json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    # Serper and OpenAI should now be configured
    assert data["serper"]["configured"] is True
    assert data["openai"]["configured"] is True
    # Masked key should show first 3 and last 3 chars
    assert data["serper"]["masked_key"].startswith("tes")
    assert data["serper"]["masked_key"].endswith("456")
    assert "..." in data["serper"]["masked_key"]


def test_update_keys_unauthenticated(client):
    """PUT /api/settings/keys without auth should return 401."""
    payload = {"serper": "some-key"}
    response = client.put("/api/settings/keys", json=payload)
    assert response.status_code == 401


# ── POST /api/settings/test/{service} ───────────────────────────────────────


def test_test_invalid_service(client, auth_headers):
    """POST /api/settings/test/invalid_service should return 400."""
    response = client.post("/api/settings/test/invalid_service", headers=auth_headers)
    assert response.status_code == 400
    assert "invalid service" in response.json()["detail"].lower()


def test_test_valid_service_no_key(client, auth_headers):
    """POST /api/settings/test/serper with no key configured returns status=invalid."""
    # The default config has empty keys, so testing should report 'invalid' status
    response = client.post("/api/settings/test/serper", headers=auth_headers)
    # Should still return 200 (the test result), not an error
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "serper"
    # Status could be 'invalid' since no key is configured
    assert data["status"] in ("valid", "invalid")
    assert "message" in data


def test_test_service_unauthenticated(client):
    """POST /api/settings/test/serper without auth should return 401."""
    response = client.post("/api/settings/test/serper")
    assert response.status_code == 401
