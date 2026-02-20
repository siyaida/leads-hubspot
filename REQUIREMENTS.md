# Siyada AI Lead Generation & Outreach Platform — Requirements

## MVP Epics (E1-E8)

### E1: Project Scaffolding & Infrastructure
- FastAPI backend with SQLAlchemy + Alembic + PostgreSQL
- React/Vite/TypeScript/TailwindCSS frontend
- Docker Compose for local dev
- Health check endpoint

### E2: User Authentication
- JWT-based auth (register, login, protected routes)
- User model with email/password/name

### E3: Natural Language Query Input (F1)
- Text area with example prompts
- LLM parses query → structured search params (search_queries, job_titles, industries, locations, company_size, seniority_levels, keywords)
- SearchSession persistence

### E4: Web Search via Serper.dev (F2)
- Serper.dev Google Search API integration
- Concurrent query execution, deduplication
- SearchResult storage

### E5: Data Extraction & Enrichment (F3)
- Web scraping (httpx + BeautifulSoup4)
- Apollo.io people enrichment (match + search)
- Lead model with 25+ fields
- Progress UI with lead cards

### E6: Personalized Outreach Generation (F4)
- LLM generates personalized email per lead
- Subject + body (150-250 words)
- Batch generation, preview/edit UI

### E7: HubSpot-Ready CSV Export (F5)
- 19-column CSV matching HubSpot properties
- UTF-8 BOM encoding, single-click download

### E8: Pipeline Orchestration & UX
- Single endpoint orchestrates full pipeline
- Step-by-step wizard UI
- Error handling with retry

## API Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| POST | /api/pipeline/run | Yes | Run full pipeline |
| GET | /api/pipeline/{session_id}/status | Yes | Pipeline status |
| GET | /api/leads/{session_id} | Yes | Get leads |
| PATCH | /api/leads/{lead_id} | Yes | Toggle selection |
| PATCH | /api/leads/{lead_id}/email | Yes | Update email |
| POST | /api/generate/{session_id} | Yes | Generate emails |
| GET | /api/export/{session_id} | Yes | Download CSV |
| GET | /api/sessions | Yes | List sessions |

## Data Models
- **User**: id, email, hashed_password, full_name, is_active, timestamps
- **SearchSession**: id, user_id, raw_query, parsed_query (JSONB), status, result_count, timestamps
- **SearchResult**: id, session_id, title, url, snippet, domain, position, raw_serper_data (JSONB)
- **Lead**: id, session_id, search_result_id, first_name, last_name, email, email_status, phone, job_title, linkedin_url, city, state, country, company_name, company_domain, company_industry, company_size, company_linkedin_url, scraped_context, personalized_email, email_subject, is_selected, timestamps

## Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/siyada_leads
SECRET_KEY=<random-64-char>
SERPER_API_KEY=
APOLLO_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173
```
