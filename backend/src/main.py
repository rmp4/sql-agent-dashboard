from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from src.api import (
    chat,
    health,
    data_sources,
    dashboards,
    data_source_connections,
    rules,
)

app = FastAPI(title="Bag of Words API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router, prefix="/api")
app.include_router(data_sources.router, prefix="/api")
app.include_router(dashboards.router, prefix="/api")
app.include_router(data_source_connections.router, prefix="/api")
app.include_router(rules.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
