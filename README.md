<div align="center">

# Siyada AI Lead Generation & Outreach Platform

**Transform natural language into sales-ready leads — enriched, personalized, and HubSpot-imported in minutes.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

<br />

<img src="https://img.shields.io/badge/Serper.dev-Web_Search-FF6B35?style=for-the-badge" />
<img src="https://img.shields.io/badge/Apollo.io-Enrichment-7C3AED?style=for-the-badge" />
<img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/HubSpot-CSV_Export-FF7A59?style=for-the-badge&logo=hubspot&logoColor=white" />

---

*"Find me CTOs of Series B SaaS companies in Saudi Arabia"*
*&rarr; 50 enriched leads with personalized emails &rarr; one-click HubSpot import*

</div>

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [HubSpot CSV Specification](#hubspot-csv-specification)
- [Model Selection](#model-selection)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Siyada AI is an end-to-end lead generation engine built for B2B sales teams. It automates the entire top-of-funnel workflow that typically takes hours of manual research:

| Manual Process | With Siyada AI |
|---------------|----------------|
| Google companies one by one | Automated web search across multiple queries |
| Visit each website, read about pages | AI-powered web scraping and context extraction |
| Search LinkedIn for decision-makers | Apollo.io enrichment with verified contacts |
| Write individual outreach emails | GPT-generated personalized emails at scale |
| Format data for CRM import | One-click HubSpot-ready CSV export |

**Result:** What used to take a full day now takes under an hour.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│  "Find me VPs of Business Development at FinTech companies      │
│   in the UAE with 50-200 employees"                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  PARSE   │→ │  SEARCH  │→ │  ENRICH  │→ │ GENERATE │→ │  EXPORT  │
│  Query   │  │  Google  │  │  Apollo  │  │  Emails  │  │   CSV    │
│  (GPT)   │  │ (Serper) │  │   .io    │  │  (GPT)   │  │(HubSpot)│
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │              │              │              │              │
  Extract        Find          Find           Write         Smart
  entities      companies    decision-      personalized    Export
  & intents     & URLs       makers         cold emails     Center
```

| Step | Engine | What Happens |
|------|--------|-------------|
| **1. Parse** | OpenAI GPT | Extracts search queries, job titles, industries, locations, seniority from natural language |
| **2. Search** | Serper.dev | Runs Google searches, collects company URLs, scrapes websites for context |
| **3. Enrich** | Apollo.io | Finds decision-makers with verified emails, phones, LinkedIn profiles |
| **4. Generate** | OpenAI GPT | Writes personalized outreach emails with strategic approach notes |
| **5. Export** | Built-in | Smart Export Center with 6 export types, HubSpot guides, and column previews |

---

## Features

### Core Pipeline
- **Natural Language Input** — Describe your ideal customer in plain English. No complex filters.
- **Smart Query Parsing** — LLM automatically extracts industries, locations, job titles, seniority levels.
- **Multi-Query Search** — Generates multiple Google search queries for comprehensive coverage.
- **Website Scraping** — Extracts company context from websites for email personalization.
- **Contact Enrichment** — Apollo.io integration for verified emails, phones, titles, and LinkedIn.
- **AI-Generated Outreach** — Personalized cold emails with subject lines and strategic approach notes.
- **Smart Export Center** — 6 export types (Contacts, Companies, Contacts+Companies, Outreach, Full, Custom) with HubSpot import guides, tips, and column previews.

### Platform
- **Live Activity Feed** — Real-time streaming log during pipeline execution. See every query searched, contact found, and email written as it happens — with progress bar and emoji indicators.
- **Lead Detail Overlay** — Click any lead card to open a full-screen detail view: contact info, role, company, scraped website context, and generated outreach — all in one place.
- **Prompt & Context Editor** — See and edit the system prompt, sender context, and per-lead data before (re)generating emails. Full control over AI output.
- **Pipeline Wizard** — Step-by-step visual progress through each stage with real-time step and percentage tracking.
- **Lead Management** — Select/deselect leads, edit emails, filter and sort results.
- **Settings Dashboard** — Add, test, and validate API keys with live status indicators.
- **Model Switcher** — Choose from 10 OpenAI models (GPT-5.2, 4.1, 4o, o3, o4) based on speed, cost, and quality.
- **Session History** — Revisit past searches without re-running expensive API calls.
- **JWT Authentication** — Secure, per-user data isolation.
- **41 Backend Tests** — Comprehensive test coverage for all API endpoints.

---

## Tech Stack

<table>
<tr><td><b>Layer</b></td><td><b>Technology</b></td><td><b>Why</b></td></tr>
<tr><td>Backend</td><td>Python 3.11+ &middot; FastAPI</td><td>Async-native, high performance, auto-generated OpenAPI docs</td></tr>
<tr><td>Database</td><td>SQLite (SQLAlchemy ORM)</td><td>Zero-config for MVP. Swap to PostgreSQL via DATABASE_URL</td></tr>
<tr><td>Frontend</td><td>React 18 &middot; Vite &middot; TypeScript</td><td>Fast builds, type safety, modern DX</td></tr>
<tr><td>Styling</td><td>TailwindCSS 3</td><td>Utility-first, dark theme, responsive</td></tr>
<tr><td>Auth</td><td>JWT (python-jose + bcrypt)</td><td>Stateless, scalable authentication</td></tr>
<tr><td>Search</td><td><a href="https://serper.dev">Serper.dev</a></td><td>Google SERP API — fast, reliable, cost-effective</td></tr>
<tr><td>Enrichment</td><td><a href="https://apollo.io">Apollo.io</a></td><td>Largest B2B contact database, verified emails</td></tr>
<tr><td>AI</td><td><a href="https://platform.openai.com">OpenAI GPT</a></td><td>Best-in-class for parsing and content generation</td></tr>
<tr><td>Icons</td><td>Lucide React</td><td>Clean, consistent icon set</td></tr>
</table>

---

## Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

### Installation

```bash
# Clone the repository
git clone https://github.com/siyaida/leads-hubspot.git
cd leads-hubspot
```

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start the server (auto-creates SQLite database)
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### First Run

1. Open `http://localhost:5173`
2. **Register** a new account
3. Go to **Settings** &rarr; add your API keys &rarr; click **Test** to validate each one
4. Select your preferred **AI model**
5. Go to **Dashboard** &rarr; enter a query &rarr; click **Generate Leads**
6. Review leads, edit emails, then **Export CSV**
7. Import the CSV into HubSpot &rarr; Contacts &rarr; Import

---

## Configuration

### API Keys

| Service | Purpose | Free Tier | Get Key |
|---------|---------|-----------|---------|
| **Serper.dev** | Google web search | 2,500 free queries | [serper.dev](https://serper.dev) |
| **Apollo.io** | Contact enrichment | Free plan available | [apollo.io](https://apollo.io) |
| **OpenAI** | Query parsing + email gen | Pay-as-you-go | [platform.openai.com](https://platform.openai.com) |

> Keys are managed in-app via the **Settings** page. They are stored locally in `api_keys.json` (git-ignored) and are only sent to their respective API providers.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./siyada_leads.db` | Database connection string |
| `SECRET_KEY` | Auto-generated | JWT signing key (set in production!) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiry (24 hours) |
| `SERPER_API_KEY` | — | Serper.dev API key |
| `APOLLO_API_KEY` | — | Apollo.io API key |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Default LLM model |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pipeline/run` | Start lead generation pipeline |
| `GET` | `/api/pipeline/{session_id}/status` | Get pipeline progress |
| `GET` | `/api/pipeline/sessions` | List all past sessions |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leads/{session_id}` | Get all leads for a session |
| `PATCH` | `/api/leads/{lead_id}` | Toggle lead selection |
| `PATCH` | `/api/leads/{lead_id}/email` | Edit generated email content |

### Generation & Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/generate/{session_id}/prompt-preview` | Preview system prompt and lead data |
| `POST` | `/api/generate/{session_id}` | Generate outreach emails (accepts custom prompt) |
| `GET` | `/api/export/{session_id}?export_type=contacts&custom_fields=first_name,email` | Download HubSpot CSV (6 export types) |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings/` | Get API key statuses (masked) |
| `PUT` | `/api/settings/keys` | Update API keys |
| `POST` | `/api/settings/test/{service}` | Test an API key with live call |
| `GET` | `/api/settings/models` | List available AI models |
| `PUT` | `/api/settings/model` | Set active AI model |

> All endpoints except auth and health require a valid JWT in the `Authorization: Bearer <token>` header.

Full interactive API docs available at `http://localhost:8000/docs` when the backend is running.

---

## Smart Export Center

Choose the right export for your workflow — each type includes HubSpot import guides, tips, and column previews:

| Export Type | Columns | Use Case |
|------------|---------|----------|
| **Contacts** | 6 | First Name, Last Name, Email, Phone, Job Title, LinkedIn — for HubSpot Contacts import |
| **Companies** | 6 | Company Name, Domain, Website, Industry, Size, Company LinkedIn — for HubSpot Companies import |
| **Contacts + Companies** | 11 | Combined contact & company data — recommended for fresh CRM setups (two-object import) |
| **Outreach** | 8 | Contact info + Email Subject, Email Body, Suggested Approach — for outreach tools |
| **Full** | 20 | All available fields including location, description, and enrichment data |
| **Custom** | Variable | Pick exactly which fields to include via multi-select checklist |

### API Usage

```
GET /api/export/{session_id}?export_type=contacts
GET /api/export/{session_id}?export_type=custom&custom_fields=first_name,email,company_name
```

Filename pattern: `siyada_{type}_{session_id[:8]}_{date}.csv`

> CSV uses UTF-8 BOM encoding for Excel compatibility. Empty fields are blank, not "null". Each export type in the UI includes step-by-step HubSpot import instructions, optimization tips, and warnings.

---

## Model Selection

Choose the right model for your use case:

| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| **GPT-4.1 Nano** | Fastest | ~$0.10/1M tokens | Good | Query parsing, high volume |
| **GPT-4o Mini** | Fast | ~$0.15/1M tokens | Good | General purpose, budget runs |
| **GPT-5.2 Mini** | Fast | ~$0.40/1M tokens | Great | **Recommended** — best value |
| **GPT-4.1 Mini** | Fast | ~$0.40/1M tokens | Great | Best value alternative |
| **o3 Mini / o4 Mini** | Medium | ~$1.10/1M tokens | Excellent | Reasoning + structured tasks |
| **GPT-5.2** | Medium | ~$2.00/1M tokens | Superior | Best quality outreach |
| **GPT-4.1 / GPT-4o** | Medium | ~$2.00-2.50/1M | Excellent | Premium email generation |
| **o3** | Slower | ~$10.00/1M tokens | Best | Complex research queries |

> Switch models anytime from the **Settings** page. The selected model is used for both query parsing and email generation.

---

## Testing

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_auth.py -v

# Run with coverage
python -m pytest tests/ --cov=app
```

### Test Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `test_health.py` | 1 | Health endpoint |
| `test_auth.py` | 11 | Register, login, JWT validation, expired tokens |
| `test_settings.py` | 7 | API key CRUD, test endpoints, auth guards |
| `test_leads.py` | 10 | Lead listing, selection toggle, email editing |
| `test_export.py` | 6 | CSV download, 19-column validation, content matching |
| `test_pipeline.py` | 6 | Pipeline run, status polling, error handling |
| **Total** | **41** | |

---

## Project Structure

```
leads-hubspot/
│
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                   # App entry point, CORS, routers
│   │   ├── core/
│   │   │   ├── config.py             # Settings, env vars, API key management
│   │   │   ├── database.py           # SQLAlchemy engine & session
│   │   │   └── security.py           # JWT tokens & password hashing
│   │   ├── models/                   # Database models (SQLAlchemy)
│   │   │   ├── user.py               # User accounts
│   │   │   ├── search_session.py     # Pipeline sessions
│   │   │   ├── search_result.py      # Raw search results
│   │   │   └── lead.py               # Enriched leads (central entity)
│   │   ├── schemas/                  # API schemas (Pydantic)
│   │   ├── api/                      # Route handlers
│   │   │   ├── auth.py               # Authentication endpoints
│   │   │   ├── pipeline.py           # Pipeline orchestration
│   │   │   ├── leads.py              # Lead management
│   │   │   ├── generate.py           # Email generation
│   │   │   ├── export.py             # CSV export
│   │   │   └── settings.py           # API key & model management
│   │   └── services/                 # Business logic
│   │       ├── llm_service.py        # OpenAI integration
│   │       ├── serper_service.py     # Google search via Serper.dev
│   │       ├── apollo_service.py     # Contact enrichment via Apollo.io
│   │       ├── scraper_service.py    # Website content extraction
│   │       ├── export_service.py     # HubSpot CSV generation
│   │       ├── pipeline_service.py   # 5-stage pipeline orchestrator
│   │       └── pipeline_log.py      # In-memory activity log for live feed
│   ├── tests/                        # 41 pytest tests
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         # React TypeScript Frontend
│   ├── src/
│   │   ├── pages/                    # Full page views
│   │   │   ├── DashboardPage.tsx     # Query input + examples
│   │   │   ├── ResultsPage.tsx       # Leads + outreach + export tabs
│   │   │   ├── SettingsPage.tsx      # API keys + model selection
│   │   │   ├── HistoryPage.tsx       # Past sessions
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── components/               # Reusable UI components
│   │   │   ├── PipelineStepper.tsx   # 5-stage progress wizard
│   │   │   ├── ActivityFeed.tsx      # Live streaming event log
│   │   │   ├── LeadCard.tsx          # Individual lead display
│   │   │   ├── LeadList.tsx          # Filterable lead grid
│   │   │   ├── LeadDetailOverlay.tsx # Full lead detail modal
│   │   │   ├── PromptEditor.tsx      # System prompt & context editor
│   │   │   ├── EmailPreview.tsx      # Email editor with regenerate
│   │   │   ├── ExportSummary.tsx     # Smart Export Center (6 types + HubSpot guides)
│   │   │   ├── Layout.tsx            # App shell with sidebar
│   │   │   └── ProtectedRoute.tsx    # Auth guard
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.tsx           # Authentication state
│   │   │   └── usePipeline.ts        # Pipeline status polling
│   │   ├── services/api.ts           # Axios API client
│   │   └── types/index.ts            # TypeScript interfaces
│   └── package.json
│
├── .gitignore
├── ARCHITECTURE.md
├── REQUIREMENTS.md
└── README.md
```

---

## Estimated API Costs

| Service | Cost Per Unit | 100 Leads Cost |
|---------|-------------|----------------|
| Serper.dev | ~$0.001/search | ~$0.01 |
| Apollo.io | Varies by plan | Free tier covers MVPs |
| OpenAI (GPT-4.1-mini) | ~$0.40/1M tokens | ~$0.05-0.10 |
| **Total per 100 leads** | | **~$0.10-0.20** |

---

## Roadmap

- [x] Natural language query parsing
- [x] Google search via Serper.dev
- [x] Apollo.io contact enrichment
- [x] AI-generated personalized emails
- [x] Smart Export Center (6 export types with HubSpot guides, tips, column previews)
- [x] JWT authentication
- [x] API key management with live testing
- [x] Model switcher (10 models, GPT-5.2 to o4)
- [x] Live activity feed with streaming progress
- [x] Prompt & context editor for outreach customization
- [x] Lead detail overlay with full data view
- [x] Apollo.io 2-step enrichment (search + match)
- [x] 41 backend tests
- [ ] Direct HubSpot API integration (auto-import)
- [ ] CSV upload for bulk enrichment
- [ ] Multi-step email sequence generation
- [ ] Usage analytics dashboard
- [ ] Webhook notifications on pipeline completion

---

## Contributing

This is a proprietary project by **Siyada Technologies**. Internal contributions only.

---

## License

Proprietary — Siyada Technologies. All rights reserved.

---

<div align="center">

**Built by [Siyada](https://github.com/siyaida)** &middot; Powered by AI

</div>
