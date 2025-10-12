from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from utils.db_client import DatabaseClient
from scheduler import ScraperScheduler
import uvicorn

app = FastAPI(title="Internship Aggregator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_client = DatabaseClient()
scheduler = ScraperScheduler()

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.stop()

@app.get("/")
async def root():
    return {
        "message": "Internship Aggregator API",
        "version": "1.0.0",
        "endpoints": {
            "/internships": "Get all internships",
            "/internships/search": "Search internships with filters",
            "/stats/last_update": "Get last scrape information"
        }
    }

@app.get("/internships")
async def get_internships(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    internships = db_client.get_all_internships(limit=limit, offset=offset)
    return {
        "count": len(internships),
        "data": internships
    }

@app.get("/internships/search")
async def search_internships(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    source_site: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    results = db_client.search_internships(
        keyword=keyword,
        location=location,
        source_site=source_site,
        limit=limit
    )
    return {
        "count": len(results),
        "filters": {
            "keyword": keyword,
            "location": location,
            "source_site": source_site
        },
        "data": results
    }

@app.get("/stats/last_update")
async def get_last_update():
    last_scrape = db_client.get_latest_scrape_info()
    return last_scrape if last_scrape else {"message": "No scrapes recorded yet"}

@app.post("/scrape/trigger")
async def trigger_scrape():
    inserted_count = scheduler.scrape_all_sites()
    return {
        "message": "Scrape completed",
        "new_internships": inserted_count
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
