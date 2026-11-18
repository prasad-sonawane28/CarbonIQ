# CarbonIQ

CarbonIQ is a work-in-progress web application for recording and reviewing factory emissions. Users can create an account, log emission records by source and category, and view total, category-wise, and month-wise emissions.

> **Project status: In progress.** This repository contains the current implementation only. Additional features are planned and will be added incrementally.

## Current implementation

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Create and list emission records for the authenticated user
- Delete emission records
- Dashboard showing total emissions (kg CO₂e)
- Category-wise emission totals
- Monthly emission chart

## Planned improvements

- Update/edit existing emission records
- Role-based access control
- PDF reports
- AI-powered insights
- PostgreSQL support
- Docker Compose setup
- Production deployment and security hardening

## Technology stack

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Recharts

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT (PyJWT)
- bcrypt

## Project structure

```text
carboniq/
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── lib/
    │   └── api.ts
    └── package.json
```

## Run locally

### 1. Start the backend

From the project root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows**
```bash
venv\Scripts\activate
```

**macOS/Linux**
```bash
source venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 2. Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

The frontend API client defaults to `http://localhost:8000`. To use a different backend URL, create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Do not commit `.env.local` or any file containing real credentials or secrets.

## API endpoints currently implemented

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health check |
| POST | `/api/auth/register` | Register a user and return a JWT |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |
| GET | `/api/records` | List the authenticated user's records |
| POST | `/api/records` | Create an emission record |
| DELETE | `/api/records/{record_id}` | Delete one of the authenticated user's records |
| GET | `/api/summary` | Return total, monthly, and category-wise emission summaries |

## Notes

- The current database is SQLite and is created locally by the backend.
- This is a development-stage project, not a production-ready deployment.
- Before deploying publicly, configure a strong secret through the `SECRET_KEY` environment variable, review token storage and CORS settings, and complete security testing.
