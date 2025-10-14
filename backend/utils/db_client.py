from supabase import create_client, Client
from typing import List, Dict, Optional
from datetime import datetime
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

class DatabaseClient:
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("Supabase URL and Key must be set.")
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def insert_internships_batch(self, internships: List[Dict]) -> int:
        """
        Inserts multiple internships, relying on a DB-level UNIQUE constraint
        on 'content_hash' to prevent duplicates efficiently.
        """
        if not internships:
            return 0
        
        try:
            # 'upsert' with 'ignore_duplicates=True' handles this perfectly
            result = self.client.table('internships').upsert(
                internships, 
                on_conflict='content_hash',
                ignore_duplicates=True
            ).execute()
            
            inserted_count = len(result.data)
            print(f"✓ Database insert/upsert complete. New records: {inserted_count}")
            return inserted_count
        except Exception as e:
            print(f"✗ Database batch insert failed: {e}")
            return 0

    def get_all_internships(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Retrieves internships with pagination."""
        try:
            query = self.client.table('internships').select('*').order('date_posted', desc=True)
            if limit is not None:
                query = query.range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data or []
        except Exception as e:
            print(f"Error fetching internships: {e}")
            return []

    def search_internships(self, keyword: Optional[str], location: Optional[str], source_site: Optional[str], limit: Optional[int]) -> List[Dict]:
        """Searches for internships with filters."""
        try:
            query = self.client.table('internships').select('*')
            if keyword:
                query = query.text_search('job_title', f"'{keyword}'")
            if location:
                query = query.ilike('location', f'%{location}%')
            if source_site:
                query = query.eq('source_site', source_site)
            
            query.order('date_posted', desc=True)
            if limit:
                query.limit(limit)

            return query.execute().data or []
        except Exception as e:
            print(f"Error searching internships: {e}")
            return []

    def get_aggregated_stats(self) -> Dict:
        """
        Performs efficient aggregation directly in the database.
        This is vastly more scalable than fetching all records.
        """
        try:
            # RPC (Remote Procedure Call) to a custom SQL function in Supabase
            # is the most efficient way to do this.
            response = self.client.rpc('get_internship_statistics', {}).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            print(f"Error fetching aggregated stats: {e}. Ensure the 'get_internship_statistics' RPC function exists in your database.")
            return { "error": str(e) }

    # ... (log_scrape_start, log_scrape_end, get_latest_scrape_info remain similar) ...

    def log_scrape_start(self, source_site: str) -> int:
        try:
            log_entry = {'source_site': source_site, 'status': 'running'}
            result = self.client.table('scrape_logs').insert(log_entry).execute()
            return result.data[0]['id'] if result.data else 0
        except Exception:
            return 0

    def log_scrape_end(self, log_id: int, internships_found: int, status: str, error_message: Optional[str] = None):
        if not log_id: return
        try:
            update_data = {
                'status': status,
                'internships_found': internships_found,
                'completed_at': datetime.utcnow().isoformat(),
                'error_message': error_message
            }
            self.client.table('scrape_logs').update(update_data).eq('id', log_id).execute()
        except Exception:
            pass

    def get_latest_scrape_info(self) -> Optional[Dict]:
        try:
            response = self.client.table('scrape_logs').select('*').order('started_at', desc=True).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception:
            return None