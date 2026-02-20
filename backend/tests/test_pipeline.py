"""Tests for the pipeline endpoints (/api/pipeline)."""

import uuid

import pytest


# ── POST /api/pipeline/run ──────────────────────────────────────────────────


def test_pipeline_run_creates_session(client, auth_headers):
    """POST /api/pipeline/run should create a session and return 202."""
    payload = {
        "query": "Find marketing managers in Dubai",
        "sender_context": "We are an AI consulting firm",
    }
    response = client.post("/api/pipeline/run", json=payload, headers=auth_headers)
    # 202 Accepted (background task launched)
    assert response.status_code == 202

    data = response.json()
    assert "id" in data
    assert data["raw_query"] == "Find marketing managers in Dubai"
    assert data["status"] == "pending"
    assert "user_id" in data
    assert "created_at" in data


def test_pipeline_run_empty_query(client, auth_headers):
    """POST /api/pipeline/run with empty query should return 400."""
    payload = {"query": "   "}
    response = client.post("/api/pipeline/run", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_pipeline_run_unauthenticated(client):
    """POST /api/pipeline/run without auth should return 401."""
    payload = {"query": "Find developers"}
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 401


# ── GET /api/pipeline/{session_id}/status ───────────────────────────────────


def test_pipeline_status_returns_info(client, auth_headers, test_session_with_leads):
    """GET /api/pipeline/{session_id}/status should return session status."""
    session = test_session_with_leads["session"]

    response = client.get(
        f"/api/pipeline/{session.id}/status", headers=auth_headers
    )
    assert response.status_code == 200

    data = response.json()
    assert data["session_id"] == session.id
    assert data["status"] == "completed"
    assert data["result_count"] == 2
    assert "message" in data
    assert "completed" in data["message"].lower()


def test_pipeline_status_nonexistent_session(client, auth_headers):
    """GET /api/pipeline/{nonexistent}/status should return 404."""
    fake_session_id = str(uuid.uuid4())
    response = client.get(
        f"/api/pipeline/{fake_session_id}/status", headers=auth_headers
    )
    assert response.status_code == 404


def test_pipeline_status_unauthenticated(client, test_session_with_leads):
    """GET /api/pipeline/{session_id}/status without auth should return 401."""
    session = test_session_with_leads["session"]
    response = client.get(f"/api/pipeline/{session.id}/status")
    assert response.status_code == 401
