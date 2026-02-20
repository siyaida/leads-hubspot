"""Tests for the leads endpoints (/api/leads)."""

import uuid

import pytest


# ── GET /api/leads/{session_id} ─────────────────────────────────────────────


def test_get_leads_for_session(client, auth_headers, test_session_with_leads):
    """GET /api/leads/{session_id} should return the list of leads."""
    session = test_session_with_leads["session"]
    leads = test_session_with_leads["leads"]

    response = client.get(f"/api/leads/{session.id}", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2

    # Verify lead data is present
    lead_emails = {lead["email"] for lead in data}
    assert "alice@techcorp.com" in lead_emails
    assert "bob@dataio.com" in lead_emails

    # Verify each lead has the expected fields
    for lead in data:
        assert "id" in lead
        assert "session_id" in lead
        assert lead["session_id"] == session.id
        assert "first_name" in lead
        assert "last_name" in lead
        assert "email" in lead
        assert "job_title" in lead
        assert "company_name" in lead
        assert "is_selected" in lead
        assert "created_at" in lead


def test_get_leads_nonexistent_session(client, auth_headers):
    """GET /api/leads/{nonexistent_session_id} should return 404."""
    fake_session_id = str(uuid.uuid4())
    response = client.get(f"/api/leads/{fake_session_id}", headers=auth_headers)
    assert response.status_code == 404
    assert "session not found" in response.json()["detail"].lower()


def test_get_leads_unauthenticated(client, test_session_with_leads):
    """GET /api/leads/{session_id} without auth should return 401."""
    session = test_session_with_leads["session"]
    response = client.get(f"/api/leads/{session.id}")
    assert response.status_code == 401


# ── PATCH /api/leads/{lead_id} (toggle is_selected) ────────────────────────


def test_update_lead_toggle_selection(client, auth_headers, test_session_with_leads):
    """PATCH /api/leads/{lead_id} should toggle is_selected."""
    lead = test_session_with_leads["leads"][0]

    # Deselect the lead
    response = client.patch(
        f"/api/leads/{lead.id}",
        json={"is_selected": False},
        headers=auth_headers,
    )
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == lead.id
    assert data["is_selected"] is False

    # Re-select the lead
    response = client.patch(
        f"/api/leads/{lead.id}",
        json={"is_selected": True},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["is_selected"] is True


def test_update_lead_not_found(client, auth_headers):
    """PATCH /api/leads/{nonexistent_lead_id} should return 404."""
    fake_lead_id = str(uuid.uuid4())
    response = client.patch(
        f"/api/leads/{fake_lead_id}",
        json={"is_selected": False},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_lead_unauthenticated(client, test_session_with_leads):
    """PATCH /api/leads/{lead_id} without auth should return 401."""
    lead = test_session_with_leads["leads"][0]
    response = client.patch(
        f"/api/leads/{lead.id}",
        json={"is_selected": False},
    )
    assert response.status_code == 401


# ── PATCH /api/leads/{lead_id}/email ────────────────────────────────────────


def test_update_lead_email_content(client, auth_headers, test_session_with_leads):
    """PATCH /api/leads/{lead_id}/email should update email fields."""
    lead = test_session_with_leads["leads"][0]

    new_email_data = {
        "personalized_email": "Hello Alice, this is a new email body.",
        "email_subject": "New Subject Line",
        "suggested_approach": "Try a different angle",
    }

    response = client.patch(
        f"/api/leads/{lead.id}/email",
        json=new_email_data,
        headers=auth_headers,
    )
    assert response.status_code == 200

    data = response.json()
    assert data["personalized_email"] == "Hello Alice, this is a new email body."
    assert data["email_subject"] == "New Subject Line"
    assert data["suggested_approach"] == "Try a different angle"


def test_update_lead_email_partial(client, auth_headers, test_session_with_leads):
    """PATCH /api/leads/{lead_id}/email with partial data should only update provided fields."""
    lead = test_session_with_leads["leads"][0]
    original_subject = lead.email_subject

    response = client.patch(
        f"/api/leads/{lead.id}/email",
        json={"personalized_email": "Only updating the body."},
        headers=auth_headers,
    )
    assert response.status_code == 200

    data = response.json()
    assert data["personalized_email"] == "Only updating the body."
    # Subject should remain unchanged
    assert data["email_subject"] == original_subject


def test_update_lead_email_not_found(client, auth_headers):
    """PATCH /api/leads/{nonexistent}/email should return 404."""
    fake_lead_id = str(uuid.uuid4())
    response = client.patch(
        f"/api/leads/{fake_lead_id}/email",
        json={"personalized_email": "Test"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_lead_email_unauthenticated(client, test_session_with_leads):
    """PATCH /api/leads/{lead_id}/email without auth should return 401."""
    lead = test_session_with_leads["leads"][0]
    response = client.patch(
        f"/api/leads/{lead.id}/email",
        json={"personalized_email": "Test"},
    )
    assert response.status_code == 401
