# InfraWatch: Infrastructure Monitoring Dashboard

A full-stack web application for tracking infrastructure assets, condition ratings, and maintenance history.

![Stack](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## What It Does

InfraWatch lets you track physical infrastructure assets (bridges, roads, pipelines, electrical systems, water systems, buildings) and monitor their condition over time through logged inspections.

- **Overview dashboard** with condition breakdowns, status counts, and critical alerts
- **Asset registry** with search, filtering, and sorting
- **Inspection history** per asset with a full timeline
- **REST API** with auto-generated docs at `/docs`

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run

```bash
git clone https://github.com/adamn23/infrastructure-dashboard.git
cd infrastructure-dashboard
docker compose up --build
```

The first build takes a few minutes. When you see:

```
infra_frontend  | Local:   http://localhost:5173/
infra_backend   | Application startup complete.
```

Open **http://localhost:5173** in your browser. The app loads with 10 sample assets pre-seeded.

### Stop

```bash
docker compose down
```

### Reset database

```bash
docker compose down -v
docker compose up --build
```

---

## Usage

### Overview Tab
- See total assets, critical count, maintenance count, and active count
- Condition breakdown (Good / Fair / Poor / Critical)
- Status overview and asset type distribution
- Critical assets panel with direct links

### Asset Registry Tab
- Search assets by name or location
- Filter by condition, status, or type
- Click any column header to sort
- Click **+ Add Asset** to register a new one

### Asset Detail (click any row)
- Full asset info: location, type, condition, status, coordinates, notes
- Complete inspection timeline sorted newest first
- **Log Inspection** — record a new inspection with inspector name, condition, date, and notes. Automatically updates the asset's condition and last inspection date
- Delete asset

---

## API

Interactive docs available at **http://localhost:8000/docs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets/` | List all assets (filter + sort via query params) |
| POST | `/assets/` | Create a new asset |
| GET | `/assets/{id}` | Get asset with inspection history |
| PUT | `/assets/{id}` | Update asset fields |
| DELETE | `/assets/{id}` | Delete asset |
| GET | `/assets/{id}/inspections/` | List inspections for an asset |
| POST | `/assets/{id}/inspections/` | Log a new inspection |
| GET | `/dashboard/stats` | Aggregated stats for the dashboard |

### Example: Create an asset

```bash
curl -X POST http://localhost:8000/assets/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main St Bridge",
    "asset_type": "bridge",
    "location": "Main St, Toronto, ON",
    "condition": "fair",
    "status": "active"
  }'
```

### Example: Log an inspection

```bash
curl -X POST http://localhost:8000/assets/1/inspections/ \
  -H "Content-Type: application/json" \
  -d '{
    "inspector_name": "J. Smith",
    "condition": "poor",
    "notes": "Crack detected on west pillar.",
    "inspection_date": "2025-05-12T09:00:00"
  }'
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI |
| Database | PostgreSQL 15, SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Frontend | React 18, Vite 5, Recharts |
| Containers | Docker, Docker Compose |

---

## Project Structure

```
infrastructure-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # App entry point, seed data
│   │   ├── database.py      # DB connection and session
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── assets.py    # Asset CRUD endpoints
│   │       ├── inspections.py
│   │       └── dashboard.py # Stats aggregation
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── StatsPanel.jsx
│       │   ├── AssetTable.jsx
│       │   ├── AssetDrawer.jsx
│       │   └── AddAssetModal.jsx
│       └── utils/
│           ├── api.js
│           └── constants.js
└── docker-compose.yml
```
