from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
from utils.db_client import DatabaseClient
from scheduler import ScraperScheduler
import uvicorn

# Initialisation des clients
db_client = DatabaseClient()
scheduler = ScraperScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du cycle de vie de l'application
    Remplace les anciens @app.on_event("startup") et @app.on_event("shutdown")
    """
    # Startup
    print("🚀 Starting Internship Aggregator API...")
    scheduler.start()
    print("✓ Scheduler started successfully")
    
    yield  # L'application tourne ici
    
    # Shutdown
    print("🛑 Shutting down Internship Aggregator API...")
    scheduler.stop()
    print("✓ Scheduler stopped successfully")

# Création de l'application FastAPI avec lifespan
app = FastAPI(
    title="Internship Aggregator API",
    version="1.0.0",
    description="API pour agréger et rechercher des offres de stage",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint racine avec informations sur l'API"""
    return {
        "message": "Internship Aggregator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/": "API information",
            "/internships": "Get all internships with pagination",
            "/internships/search": "Search internships with filters",
            "/internships/stats": "Get internship statistics",
            "/stats/last_update": "Get last scrape information",
            "/scrape/trigger": "Manually trigger a scrape (POST)"
        }
    }

@app.get("/internships")
async def get_internships(
    limit: int = Query(100, ge=1, le=500, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """
    Récupère toutes les offres de stage avec pagination
    """
    internships = db_client.get_all_internships(limit=limit, offset=offset)
    return {
        "count": len(internships),
        "limit": limit,
        "offset": offset,
        "data": internships
    }

@app.get("/internships/search")
async def search_internships(
    keyword: Optional[str] = Query(None, description="Search in title and description"),
    location: Optional[str] = Query(None, description="Filter by location"),
    source_site: Optional[str] = Query(None, description="Filter by source (LinkedIn, Indeed, etc.)"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results")
):
    """
    Recherche des offres de stage avec filtres
    """
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

@app.get("/internships/stats")
async def get_internship_stats():
    """
    Obtenir des statistiques sur les offres de stage
    """
    try:
        all_internships = db_client.get_all_internships(limit=10000)
        
        if not all_internships:
            return {
                "total_internships": 0,
                "message": "No internships found"
            }
        
        # Calculer les statistiques
        companies = {}
        locations = {}
        sources = {}
        
        for internship in all_internships:
            # Compter par entreprise
            company = internship.get('company_name', 'Unknown')
            companies[company] = companies.get(company, 0) + 1
            
            # Compter par localisation
            location = internship.get('location', 'Unknown')
            locations[location] = locations.get(location, 0) + 1
            
            # Compter par source
            source = internship.get('source_site', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        return {
            "total_internships": len(all_internships),
            "unique_companies": len(companies),
            "unique_locations": len(locations),
            "by_source": sources,
            "top_companies": dict(sorted(companies.items(), key=lambda x: x[1], reverse=True)[:10]),
            "top_locations": dict(sorted(locations.items(), key=lambda x: x[1], reverse=True)[:10])
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Could not fetch statistics"
        }

@app.get("/stats/last_update")
async def get_last_update():
    """
    Obtenir les informations sur le dernier scraping
    """
    last_scrape = db_client.get_latest_scrape_info()
    
    if last_scrape:
        return {
            "status": "success",
            "data": last_scrape
        }
    else:
        return {
            "status": "no_data",
            "message": "No scrapes recorded yet. The first scrape will run soon."
        }

@app.post("/scrape/trigger")
async def trigger_scrape():
    """
    Déclencher manuellement un scraping de toutes les sources
    """
    try:
        print("📡 Manual scrape triggered via API")
        inserted_count = scheduler.scrape_all_sites()
        
        return {
            "status": "success",
            "message": "Scrape completed successfully",
            "new_internships": inserted_count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Scrape failed: {str(e)}"
        }

@app.get("/health")
async def health_check():
    """
    Vérifier l'état de l'API et du scheduler
    """
    return {
        "status": "healthy",
        "scheduler_running": scheduler.is_running if hasattr(scheduler, 'is_running') else True,
        "database_connected": True  # Vous pouvez ajouter une vraie vérification ici
    }

if __name__ == "__main__":
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )