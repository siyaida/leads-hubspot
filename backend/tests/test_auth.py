"""Tests for the authentication endpoints (/api/auth)."""

import pytest


# ── POST /api/auth/register ─────────────────────────────────────────────────


def test_register_success(client):
    """Registration with valid data should return 201 with access_token and user."""
    payload = {
        "email": "newuser@example.com",
        "password": "StrongPass123!",
        "full_name": "New User",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"
    assert data["user"]["is_active"] is True
    assert "id" in data["user"]
    assert "created_at" in data["user"]
    # Password should never appear in the response
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


def test_register_duplicate_email(client):
    """Registering with an already-used email should return 409."""
    payload = {
        "email": "duplicate@example.com",
        "password": "StrongPass123!",
        "full_name": "First User",
    }
    response1 = client.post("/api/auth/register", json=payload)
    assert response1.status_code == 201

    # Attempt to register again with the same email
    response2 = client.post("/api/auth/register", json=payload)
    assert response2.status_code == 409
    assert "already exists" in response2.json()["detail"].lower()


def test_register_invalid_email(client):
    """Registering with an invalid email should return 422."""
    payload = {
        "email": "not-an-email",
        "password": "StrongPass123!",
        "full_name": "Bad Email User",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


def test_register_missing_password(client):
    """Registering without a password should return 422."""
    payload = {
        "email": "nopass@example.com",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


# ── POST /api/auth/login ────────────────────────────────────────────────────


def test_login_success(client):
    """Login with valid credentials should return 200 with access_token."""
    # First register a user
    register_payload = {
        "email": "loginuser@example.com",
        "password": "LoginPass123!",
        "full_name": "Login User",
    }
    client.post("/api/auth/register", json=register_payload)

    # Now login
    login_payload = {
        "email": "loginuser@example.com",
        "password": "LoginPass123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "loginuser@example.com"
    assert data["user"]["is_active"] is True


def test_login_wrong_password(client):
    """Login with wrong password should return 401."""
    # Register a user first
    register_payload = {
        "email": "wrongpass@example.com",
        "password": "CorrectPass123!",
        "full_name": "Wrong Pass User",
    }
    client.post("/api/auth/register", json=register_payload)

    # Attempt login with wrong password
    login_payload = {
        "email": "wrongpass@example.com",
        "password": "WrongPassword!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_login_nonexistent_email(client):
    """Login with a non-existent email should return 401."""
    login_payload = {
        "email": "nobody@example.com",
        "password": "SomePassword123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


# ── GET /api/auth/me ────────────────────────────────────────────────────────


def test_get_me_with_valid_token(client, auth_headers, test_user):
    """GET /api/auth/me with a valid token should return the user profile."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
    assert data["is_active"] is True
    assert "created_at" in data
    # No sensitive fields
    assert "password" not in data
    assert "hashed_password" not in data


def test_get_me_without_token(client):
    """GET /api/auth/me without a token should return 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_me_with_invalid_token(client):
    """GET /api/auth/me with a garbage token should return 401."""
    headers = {"Authorization": "Bearer invalid-token-garbage-12345"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401


def test_get_me_with_expired_token(client, test_user):
    """GET /api/auth/me with an expired token should return 401."""
    from datetime import timedelta
    from app.core.security import create_access_token

    # Create a token that expired 1 hour ago
    expired_token = create_access_token(
        data={"sub": test_user.id},
        expires_delta=timedelta(seconds=-3600),
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
