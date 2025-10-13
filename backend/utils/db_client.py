from supabase import create_client, Client
import os
from typing import List, Dict, Optional
from datetime import datetime

class DatabaseClient:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.client: Client = create_client(supabase_url, supabase_key)

    def insert_internships_batch(self, internships: List[Dict]) -> int:
        """Insert multiple internships, avoiding duplicates based on content_hash"""
        if not internships:
            return 0
        
        inserted_count = 0
        
        for internship in internships:
            try:
                # Vérifier si l'internship existe déjà avec le content_hash
                content_hash = internship.get('content_hash')
                
                if content_hash:
                    existing = self.client.table('internships')\
                        .select('id')\
                        .eq('content_hash', content_hash)\
                        .execute()
                    
                    if existing.data and len(existing.data) > 0:
                        print(f"Skipping duplicate: {internship['job_title']}")
                        continue
                
                # Insérer le nouveau stage
                result = self.client.table('internships').insert(internship).execute()
                
                if result.data:
                    inserted_count += 1
                    print(f"✓ Inserted: {internship['job_title']} at {internship['company_name']}")
                    
            except Exception as e:
                error_msg = str(e)
                # Ne pas afficher toute l'erreur si c'est juste un doublon
                if 'duplicate key' in error_msg.lower():
                    print(f"⚠ Duplicate skipped: {internship.get('job_title', 'Unknown')}")
                else:
                    print(f"✗ Error inserting '{internship.get('job_title', 'Unknown')}': {error_msg[:100]}")
                continue
        
        return inserted_count

    def get_all_internships(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Retrieve all internships with pagination"""
        try:
            response = self.client.table('internships')\
                .select('*')\
                .order('scraped_at', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching internships: {str(e)}")
            return []

    def search_internships(
        self, 
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        source_site: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Search internships with filters"""
        try:
            query = self.client.table('internships').select('*')
            
            if keyword:
                # Recherche dans le titre et la description
                query = query.or_(f'job_title.ilike.%{keyword}%,job_description.ilike.%{keyword}%')
            
            if location:
                query = query.ilike('location', f'%{location}%')
            
            if source_site:
                query = query.eq('source_site', source_site)
            
            response = query.order('scraped_at', desc=True).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error searching internships: {str(e)}")
            return []

    def log_scrape_start(self, source_site: str) -> int:
        """Log the start of a scraping session"""
        try:
            log_entry = {
                'source_site': source_site,
                'status': 'running',
                'started_at': datetime.utcnow().isoformat()  # Changé l'ordre
            }
            
            result = self.client.table('scrape_logs').insert(log_entry).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return 0
        except Exception as e:
            # Si la table n'existe pas ou a un schéma différent, continuer sans logger
            print(f"Note: Scrape logging not available - {str(e)[:80]}")
            return 0

    def log_scrape_end(
        self, 
        log_id: int, 
        internships_found: int, 
        status: str, 
        error_message: Optional[str] = None
    ):
        """Update scrape log when completed"""
        if log_id == 0:
            return  # Skip si le log n'a pas été créé
            
        try:
            update_data = {
                'status': status,
                'internships_found': internships_found,
                'completed_at': datetime.utcnow().isoformat()
            }
            
            if error_message:
                update_data['error_message'] = error_message
            
            self.client.table('scrape_logs')\
                .update(update_data)\
                .eq('id', log_id)\
                .execute()
                
        except Exception as e:
            # Ignorer les erreurs de logging
            print(f"Note: Could not update scrape log - {str(e)[:80]}")

    def get_latest_scrape_info(self) -> Optional[Dict]:
        """Get information about the last scrape"""
        try:
            response = self.client.table('scrape_logs')\
                .select('*')\
                .order('started_at', desc=True)\
                .limit(1)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching latest scrape info: {str(e)}")
            return None

    def clean_old_internships(self, days_old: int = 30):
        """Remove internships older than specified days"""
        try:
            from datetime import timedelta
            cutoff_date = (datetime.utcnow() - timedelta(days=days_old)).isoformat()
            
            result = self.client.table('internships')\
                .delete()\
                .lt('scraped_at', cutoff_date)\
                .execute()
            
            deleted_count = len(result.data) if result.data else 0
            print(f"Deleted {deleted_count} old internships (>{days_old} days)")
            return deleted_count
            
        except Exception as e:
            print(f"Error cleaning old internships: {str(e)}")
            return 0