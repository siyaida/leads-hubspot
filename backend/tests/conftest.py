"""
Shared test fixtures for the Siyada Lead Generation Platform backend tests.

Provides:
- An in-memory SQLite test database
- Override of the get_db dependency
- A synchronous TestClient
- Helper fixtures for creating users, tokens, sessions, and leads
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.user import User
from app.models.search_session import SearchSession
from app.models.search_result import SearchResult
from app.models.lead import Lead

# ── Test database setup ─────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_siyada.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# Also patch SessionLocal in the pipeline module so background tasks use the test DB
import app.api.pipeline as pipeline_module
pipeline_module.SessionLocal = TestingSessionLocal


# ── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    """Provide a database session for direct DB manipulation in tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    """Provide a synchronous TestClient for the FastAPI app."""
    return TestClient(app)


@pytest.fixture()
def test_user(db_session):
    """Create a test user in the DB and return the User object."""
    user = User(
        id=str(uuid.uuid4()),
        email="testuser@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        full_name="Test User",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def auth_token(test_user):
    """Create a valid JWT token for the test user."""
    return create_access_token(data={"sub": test_user.id})


@pytest.fixture()
def auth_headers(auth_token):
    """Return an Authorization header dict for authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture()
def test_session_with_leads(db_session, test_user):
    """Create a SearchSession with associated leads for testing.

    Returns a dict with 'session' and 'leads' keys.
    """
    # Create a search session
    session = SearchSession(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        raw_query="Find AI engineers in San Francisco",
        status="completed",
        result_count=2,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db_session.add(session)
    db_session.commit()

    # Create a search result (needed for foreign key on Lead)
    search_result = SearchResult(
        id=str(uuid.uuid4()),
        session_id=session.id,
        title="Test Result",
        url="https://example.com",
        snippet="Test snippet",
        domain="example.com",
        position=1,
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(search_result)
    db_session.commit()

    # Create two leads
    lead1 = Lead(
        id=str(uuid.uuid4()),
        session_id=session.id,
        search_result_id=search_result.id,
        first_name="Alice",
        last_name="Smith",
        email="alice@techcorp.com",
        email_status="verified",
        phone="+14155551234",
        job_title="AI Engineer",
        headline="Senior AI Engineer at TechCorp",
        linkedin_url="https://linkedin.com/in/alicesmith",
        city="San Francisco",
        state="California",
        country="United States",
        company_name="TechCorp",
        company_domain="techcorp.com",
        company_industry="Technology",
        company_size="51-200",
        company_linkedin_url="https://linkedin.com/company/techcorp",
        scraped_context="TechCorp specializes in AI solutions.",
        personalized_email="Dear Alice, I noticed your work at TechCorp...",
        email_subject="Collaboration Opportunity",
        suggested_approach="Reference their AI projects",
        is_selected=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    lead2 = Lead(
        id=str(uuid.uuid4()),
        session_id=session.id,
        search_result_id=search_result.id,
        first_name="Bob",
        last_name="Jones",
        email="bob@dataio.com",
        email_status="verified",
        phone="+14155555678",
        job_title="ML Engineer",
        headline="ML Engineer at DataIO",
        linkedin_url="https://linkedin.com/in/bobjones",
        city="San Francisco",
        state="California",
        country="United States",
        company_name="DataIO",
        company_domain="dataio.com",
        company_industry="Data Analytics",
        company_size="11-50",
        company_linkedin_url="https://linkedin.com/company/dataio",
        scraped_context="DataIO focuses on data analytics.",
        personalized_email="Dear Bob, I saw your work at DataIO...",
        email_subject="Partnership Opportunity",
        suggested_approach="Mention their data analytics expertise",
        is_selected=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db_session.add_all([lead1, lead2])
    db_session.commit()
    db_session.refresh(lead1)
    db_session.refresh(lead2)

    return {"session": session, "leads": [lead1, lead2]}
