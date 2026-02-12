# SQL Agent Dashboard

AI-powered SQL agent with natural language query generation and interactive data visualization dashboard.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- [uv](https://github.com/astral-sh/uv) for Python package management

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key
PYTHONPATH=/path/to/project/backend uv run python src/main.py
```

### Database Setup
```bash
cd backend
# Run migrations
uv run alembic upgrade head
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn/ui, Recharts
- **Backend**: FastAPI, OpenAI, SQLAlchemy, Alembic, PostgreSQL
- **Package Management**: npm (frontend), uv (backend)

## Features

### ✅ Completed
- Chat interface with natural language to SQL
- 11 chart types (Line, Bar, Area, Pie, Donut, Horizontal Bar, Stacked Bar, Scatter, Combo, Table)
- Interactive chart configuration panel
- Dashboard management (create, list, view)
- Data source connections management
- Rules system for AI context
- Fixed layout architecture (sidebar, scroll containers)

### ⏳ In Progress
- Dashboard detail page with saved charts
- Save chart to dashboard functionality
- Edit/Delete operations for all entities
- Chat integration with rules and data sources

## Development

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Schema

- `dashboards` - Dashboard containers
- `saved_charts` - Saved chart configurations
- `data_source_connections` - Database connection configs
- `rules` - AI context rules for query generation
