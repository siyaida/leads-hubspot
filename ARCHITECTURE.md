# Architecture — Siyada AI Lead Generation Platform

## Directory Structure
```
hubspotenrichement/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── search_session.py
│       │   ├── search_result.py
│       │   └── lead.py
│       ├── schemas/
│       │   ├── auth.py
│       │   ├── search.py
│       │   ├── lead.py
│       │   └── pipeline.py
│       ├── api/
│       │   ├── auth.py
│       │   ├── pipeline.py
│       │   ├── leads.py
│       │   ├── generate.py
│       │   └── export.py
│       └── services/
│           ├── llm_service.py
│           ├── serper_service.py
│           ├── apollo_service.py
│           ├── scraper_service.py
│           ├── export_service.py
│           └── pipeline_service.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── types/
        │   └── index.ts
        ├── services/
        │   └── api.ts
        ├── hooks/
        │   ├── useAuth.ts
        │   └── usePipeline.ts
        ├── components/
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── PipelineStepper.tsx
        │   ├── LeadCard.tsx
        │   ├── LeadList.tsx
        │   ├── EmailPreview.tsx
        │   └── ExportSummary.tsx
        └── pages/
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── DashboardPage.tsx
            ├── ResultsPage.tsx
            ├── OutreachPage.tsx
            └── ExportPage.tsx
```

## Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 16
- **Frontend**: React 18, Vite 5, TypeScript 5, TailwindCSS 3
- **Auth**: JWT (python-jose + passlib/bcrypt)
- **External APIs**: Serper.dev, Apollo.io, OpenAI
- **Dev**: Docker Compose

## Data Flow
```
User Query → LLM Parse → Serper Search → Scrape URLs → Apollo Enrich → LLM Email Gen → CSV Export
```

## Pipeline States
pending → searching → enriching → generating → completed | failed
