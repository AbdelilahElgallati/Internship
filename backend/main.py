from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import threading
from utils.db_client import DatabaseClient
from scheduler import ScraperScheduler
import uvicorn

db_client = DatabaseClient()
scheduler = ScraperScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Internship Aggregator API...")
    scheduler.start()
    yield
    print("🛑 Shutting down Internship Aggregator API...")
    scheduler.stop()

app = FastAPI(
    title="Internship Aggregator API",
    version="1.1.0",
    description="API for aggregating and searching internship opportunities.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Internship Aggregator API is running"}

@app.get("/internships")
async def get_internships(
    limit: Optional[int] = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    internships = db_client.get_all_internships(limit=limit, offset=offset)
    return {
        "count": len(internships),
        "limit": limit,
        "offset": offset,
        "data": internships
    }

@app.get("/internships/search")
async def search_internships(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),  
    source_site: Optional[str] = Query(None),
    limit: Optional[int] = Query(50, ge=1, le=200)
):
    results = db_client.search_internships(keyword, location, source_site, limit) 
    return {"count": len(results), "data": results}

@app.get("/internships/stats")
async def get_internship_stats():
    stats = db_client.get_aggregated_stats()
    if not stats or stats.get("error"):
        return {
            "error": "Could not fetch statistics.",
            "details": stats.get("error", "Function not available.")
        }
    return stats

@app.get("/stats/last_update")
async def get_last_update():
    last_scrape = db_client.get_latest_scrape_info()
    return last_scrape or {"message": "No scrapes recorded yet."}

@app.post("/scrape/trigger")
async def trigger_scrape():
    print("📡 Manual scrape triggered via API.")
    thread = threading.Thread(target=scheduler.scrape_all_sites)
    thread.start()
    return {
        "status": "success",
        "message": "Scrape initiated in the background. Check logs for progress."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)