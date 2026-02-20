# Siyada AI Lead Generation & Outreach Platform

An AI-powered lead generation engine that transforms natural language queries into enriched, sales-ready leads with personalized outreach — exported as HubSpot-ready CSV files.

> **"Find me CTOs of Series B SaaS companies in Saudi Arabia"** → 50 enriched leads with personalized emails → one-click HubSpot import.

---

## How It Works

```
Natural Language Query → Web Search → Contact Enrichment → AI Outreach → HubSpot CSV
```

| Step | What Happens | Powered By |
|------|-------------|------------|
| **1. Query** | Describe your ideal customer in plain English | OpenAI GPT |
| **2. Search** | Finds matching companies across the web | Serper.dev |
| **3. Enrich** | Discovers decision-makers, emails, phones, LinkedIn | Apollo.io |
| **4. Generate** | Writes personalized outreach emails per lead | OpenAI GPT |
| **5. Export** | Downloads a 19-column HubSpot-ready CSV | Built-in |

---

## Features

- **Natural Language Input** — No complex filters. Just describe who you're looking for.
- **Smart Query Parsing** — LLM extracts industries, locations, job titles, seniority levels automatically.
- **Web Discovery** — Searches Google via Serper.dev, scrapes company websites for context.
- **Contact Enrichment** — Apollo.io integration finds verified emails, phones, and LinkedIn profiles.
- **AI-Generated Outreach** — Personalized cold emails with subject lines and strategic approach notes.
- **HubSpot CSV Export** — 19 columns mapped exactly to HubSpot's import spec. Zero reformatting.
- **Settings Dashboard** — Add, test, and validate API keys directly in the UI.
- **Pipeline Wizard** — Step-by-step visual progress through each stage.
- **Session History** — Revisit past searches without re-running expensive API calls.
- **JWT Authentication** — Secure, per-user data isolation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+ · FastAPI · SQLAlchemy · SQLite |
| **Frontend** | React 18 · Vite · TypeScript · TailwindCSS |
| **Auth** | JWT (python-jose + bcrypt) |
| **Search** | [Serper.dev](https://serper.dev) — Google SERP API |
| **Enrichment** | [Apollo.io](https://apollo.io) — B2B contact data |
| **AI** | [OpenAI](https://platform.openai.com) — GPT-4o-mini |
| **Icons** | Lucide React |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys for Serper.dev, Apollo.io, and OpenAI

### 1. Clone

```bash
git clone https://github.com/siyaida/leads-hubspot.git
cd leads-hubspot
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open & Configure

1. Open **http://localhost:5173**
2. Register an account
3. Go to **Settings** → add your API keys → click **Test** to validate
4. Go to **Dashboard** → enter a query → generate leads

---

## API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Serper.dev** | Web search for finding companies | [serper.dev](https://serper.dev) |
| **Apollo.io** | Contact enrichment (emails, phones, titles) | [apollo.io](https://apollo.io) |
| **OpenAI** | Query parsing + email generation | [platform.openai.com](https://platform.openai.com) |

Keys are managed in-app via the **Settings** page. They are stored locally in `api_keys.json` (git-ignored) and never sent to any third party beyond the respective API provider.

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py           # Environment & API key management
│   │   │   ├── database.py         # SQLAlchemy engine & session
│   │   │   └── security.py         # JWT & password hashing
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── search_session.py
│   │   │   ├── search_result.py
│   │   │   └── lead.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── api/                    # Route handlers
│   │   │   ├── auth.py             # Register, login, profile
│   │   │   ├── pipeline.py         # Run pipeline, status, sessions
│   │   │   ├── leads.py            # CRUD for leads
│   │   │   ├── generate.py         # Email generation
│   │   │   ├── export.py           # CSV download
│   │   │   └── settings.py         # API key management & testing
│   │   └── services/               # Business logic
│   │       ├── llm_service.py      # OpenAI integration
│   │       ├── serper_service.py    # Web search
│   │       ├── apollo_service.py   # Contact enrichment
│   │       ├── scraper_service.py  # Website scraping
│   │       ├── export_service.py   # CSV generation
│   │       └── pipeline_service.py # Orchestrator
│   ├── tests/                      # 41 pytest tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Login, Register, Dashboard, Results, Settings, History
│   │   ├── components/             # PipelineStepper, LeadCard, EmailPreview, ExportSummary
│   │   ├── hooks/                  # useAuth, usePipeline
│   │   ├── services/api.ts         # Axios API client
│   │   └── types/index.ts          # TypeScript interfaces
│   └── package.json
└── .gitignore
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Get JWT token |
| `GET` | `/api/auth/me` | Yes | Current user profile |
| `POST` | `/api/pipeline/run` | Yes | Start lead generation pipeline |
| `GET` | `/api/pipeline/{id}/status` | Yes | Pipeline progress |
| `GET` | `/api/pipeline/sessions` | Yes | List past sessions |
| `GET` | `/api/leads/{session_id}` | Yes | Get leads for session |
| `PATCH` | `/api/leads/{lead_id}` | Yes | Toggle lead selection |
| `PATCH` | `/api/leads/{lead_id}/email` | Yes | Edit generated email |
| `POST` | `/api/generate/{session_id}` | Yes | Generate outreach emails |
| `GET` | `/api/export/{session_id}` | Yes | Download HubSpot CSV |
| `GET` | `/api/settings/` | Yes | API key statuses |
| `PUT` | `/api/settings/keys` | Yes | Update API keys |
| `POST` | `/api/settings/test/{service}` | Yes | Test an API key |

---

## HubSpot CSV Columns

The exported CSV maps directly to HubSpot's import specification:

| # | Column | Source |
|---|--------|--------|
| 1 | First Name | Apollo.io |
| 2 | Last Name | Apollo.io |
| 3 | Email | Apollo.io |
| 4 | Phone Number | Apollo.io |
| 5 | Job Title | Apollo.io |
| 6 | Company Name | Search + Scraping |
| 7 | Company Domain Name | Search |
| 8 | Website URL | Search |
| 9 | Description | Scraping + LLM |
| 10 | Industry | Apollo.io |
| 11 | Street Address | Apollo.io |
| 12 | City | Apollo.io |
| 13 | State/Region | Apollo.io |
| 14 | Country/Region | Apollo.io |
| 15 | Number of Employees | Apollo.io |
| 16 | LinkedIn URL | Apollo.io |
| 17 | Company LinkedIn URL | Apollo.io |
| 18 | Personalized Email Draft | OpenAI |
| 19 | Suggested Approach | OpenAI |

---

## Testing

```bash
cd backend
python -m pytest tests/ -v
```

41 tests covering: authentication, leads CRUD, CSV export validation, pipeline orchestration, settings management, and health checks.

---

## Environment Variables

```env
DATABASE_URL=sqlite:///./siyada_leads.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SERPER_API_KEY=
APOLLO_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173
```

---

## License

Proprietary — Siyada Technologies.
