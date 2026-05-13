# InfraWatch — Infrastructure Monitoring Dashboard

A full-stack web application for tracking and visualizing infrastructure assets, condition ratings, and maintenance history.

## Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Backend   | Python 3.12, FastAPI         |
| Database  | PostgreSQL 15                |
| ORM       | SQLAlchemy 2.0               |
| Frontend  | React 18, Recharts           |
| Build     | Vite 5                       |
| Container | Docker, Docker Compose       |

## Features

- **Asset Registry** — track bridges, roads, pipelines, electrical, water, and building infrastructure
- **Condition Monitoring** — Good / Fair / Poor / Critical condition states with visual badges
- **Inspection History** — time-ordered log of inspections per asset with condition updates
- **Dashboard Statistics** — condition breakdown, status overview, asset-type counts, critical alerts
- **Filtering & Sorting** — filter by condition, status, type; sort by name, condition, last inspected
- **RESTful API** — full CRUD with Pydantic validation and OpenAPI docs at `/docs`
- **Seed Data** — 10 sample Toronto-area infrastructure assets auto-loaded on first run

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Run

```bash
git clone <repo>
cd infrastructure-dashboard
docker compose up --build
```

| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:5173            |
| Backend  | http://localhost:8000            |
| API Docs | http://localhost:8000/docs       |

## API Endpoints

### Assets
```
GET    /assets/              List assets (filter: condition, status, asset_type, search; sort: sort_by, order)
POST   /assets/              Create asset
GET    /assets/{id}          Get asset with inspection history
PUT    /assets/{id}          Update asset
DELETE /assets/{id}          Delete asset
```

### Inspections
```
GET    /assets/{id}/inspections/   List inspections for asset
POST   /assets/{id}/inspections/   Log new inspection (auto-updates asset condition & last_inspection_date)
```

### Dashboard
```
GET    /dashboard/stats      Aggregated stats: condition/status/type breakdown, recent inspections, critical assets
```

## Database Schema

```sql
assets (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  asset_type          ENUM(bridge|road|building|pipeline|electrical|water|other),
  location            VARCHAR(500) NOT NULL,
  latitude            FLOAT,
  longitude           FLOAT,
  condition           ENUM(good|fair|poor|critical),
  status              ENUM(active|inactive|under_maintenance|decommissioned),
  installation_date   TIMESTAMPTZ,
  last_inspection_date TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
)

inspections (
  id               SERIAL PRIMARY KEY,
  asset_id         INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  inspector_name   VARCHAR(255) NOT NULL,
  condition        ENUM(good|fair|poor|critical),
  notes            TEXT,
  inspection_date  TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
)
```

## Project Structure

```
infrastructure-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, startup, seed data
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models (Asset, Inspection)
│   │   ├── schemas.py       # Pydantic I/O schemas
│   │   └── routers/
│   │       ├── assets.py    # CRUD endpoints
│   │       ├── inspections.py
│   │       └── dashboard.py # Stats aggregation
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── StatsPanel.jsx   # Overview cards + charts
│   │   │   ├── AssetTable.jsx   # Filterable/sortable table
│   │   │   ├── AssetDrawer.jsx  # Side panel with inspection log
│   │   │   └── AddAssetModal.jsx
│   │   └── utils/
│   │       ├── api.js       # Fetch wrapper
│   │       └── constants.js # Condition/status/type maps
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
└── docker-compose.yml
```

## Development (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
DATABASE_URL=postgresql://infra_user:infra_pass@localhost:5432/infra_db uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
