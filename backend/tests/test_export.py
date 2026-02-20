"""Tests for the export endpoints (/api/export)."""

import csv
import io
import uuid

import pytest


# ── GET /api/export/{session_id} ────────────────────────────────────────────


def test_export_csv_success(client, auth_headers, test_session_with_leads):
    """GET /api/export/{session_id} should return a valid CSV file."""
    session = test_session_with_leads["session"]

    response = client.get(f"/api/export/{session.id}", headers=auth_headers)
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    assert ".csv" in response.headers["content-disposition"]


def test_export_csv_has_correct_headers(client, auth_headers, test_session_with_leads):
    """The exported CSV should contain the 19 HubSpot-spec column headers."""
    session = test_session_with_leads["session"]

    response = client.get(f"/api/export/{session.id}", headers=auth_headers)
    assert response.status_code == 200

    # Decode the CSV content (skip BOM bytes)
    content = response.content
    # Skip UTF-8 BOM if present
    if content.startswith(b"\xef\xbb\xbf"):
        content = content[3:]
    csv_text = content.decode("utf-8")

    reader = csv.reader(io.StringIO(csv_text))
    headers = next(reader)

    expected_headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Job Title",
        "Company Name",
        "Company Domain Name",
        "Website URL",
        "Description",
        "Industry",
        "Street Address",
        "City",
        "State/Region",
        "Country/Region",
        "Number of Employees",
        "LinkedIn URL",
        "Company LinkedIn URL",
        "Personalized Email Draft",
        "Suggested Approach",
    ]
    assert len(headers) == 19
    assert headers == expected_headers


def test_export_csv_content_matches_leads(client, auth_headers, test_session_with_leads):
    """The CSV data rows should match the lead data in the database."""
    session = test_session_with_leads["session"]
    leads = test_session_with_leads["leads"]

    response = client.get(f"/api/export/{session.id}", headers=auth_headers)
    assert response.status_code == 200

    content = response.content
    if content.startswith(b"\xef\xbb\xbf"):
        content = content[3:]
    csv_text = content.decode("utf-8")

    reader = csv.DictReader(io.StringIO(csv_text))
    rows = list(reader)

    # Both leads are selected, so both should appear
    assert len(rows) == 2

    # Build a set of first names from the CSV
    csv_first_names = {row["First Name"] for row in rows}
    assert "Alice" in csv_first_names
    assert "Bob" in csv_first_names

    # Verify specific field mapping for one lead
    alice_row = next(row for row in rows if row["First Name"] == "Alice")
    assert alice_row["Last Name"] == "Smith"
    assert alice_row["Email"] == "alice@techcorp.com"
    assert alice_row["Job Title"] == "AI Engineer"
    assert alice_row["Company Name"] == "TechCorp"
    assert alice_row["Company Domain Name"] == "techcorp.com"
    assert alice_row["Industry"] == "Technology"
    assert alice_row["City"] == "San Francisco"
    assert alice_row["State/Region"] == "California"
    assert alice_row["Country/Region"] == "United States"
    assert alice_row["Number of Employees"] == "51-200"
    assert alice_row["LinkedIn URL"] == "https://linkedin.com/in/alicesmith"
    assert alice_row["Company LinkedIn URL"] == "https://linkedin.com/company/techcorp"
    assert "TechCorp" in alice_row["Personalized Email Draft"]
    assert alice_row["Suggested Approach"] == "Reference their AI projects"


def test_export_nonexistent_session(client, auth_headers):
    """GET /api/export/{nonexistent_session_id} should return 404."""
    fake_session_id = str(uuid.uuid4())
    response = client.get(f"/api/export/{fake_session_id}", headers=auth_headers)
    assert response.status_code == 404
    assert "session not found" in response.json()["detail"].lower()


def test_export_unauthenticated(client, test_session_with_leads):
    """GET /api/export/{session_id} without auth should return 401."""
    session = test_session_with_leads["session"]
    response = client.get(f"/api/export/{session.id}")
    assert response.status_code == 401


def test_export_no_selected_leads(client, auth_headers, test_session_with_leads, db_session):
    """GET /api/export/{session_id} with no selected leads should return 400."""
    session = test_session_with_leads["session"]
    leads = test_session_with_leads["leads"]

    # Deselect all leads
    for lead in leads:
        lead.is_selected = False
    db_session.commit()

    response = client.get(f"/api/export/{session.id}", headers=auth_headers)
    assert response.status_code == 400
    assert "no selected leads" in response.json()["detail"].lower()
