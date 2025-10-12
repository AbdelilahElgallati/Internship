from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from typing import List, Dict, Optional
import hashlib
from datetime import datetime

class DatabaseClient:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def generate_content_hash(self, job_title: str, company_name: str, apply_link: str) -> str:
        content = f"{job_title}|{company_name}|{apply_link}"
        return hashlib.sha256(content.encode()).hexdigest()

    def insert_internship(self, data: Dict) -> Optional[Dict]:
        content_hash = self.generate_content_hash(
            data['job_title'],
            data['company_name'],
            data['apply_link']
        )

        existing = self.supabase.table('internships').select('id').eq('content_hash', content_hash).maybeSingle().execute()

        if existing.data:
            return None

        data['content_hash'] = content_hash
        result = self.supabase.table('internships').insert(data).execute()
        return result.data[0] if result.data else None

    def insert_internships_batch(self, internships: List[Dict]) -> int:
        inserted_count = 0
        for internship in internships:
            if self.insert_internship(internship):
                inserted_count += 1
        return inserted_count

    def log_scrape_start(self, source_site: str) -> str:
        result = self.supabase.table('scrape_logs').insert({
            'source_site': source_site,
            'scrape_start': datetime.utcnow().isoformat(),
            'status': 'running'
        }).execute()
        return result.data[0]['id']

    def log_scrape_end(self, log_id: str, records_found: int, status: str = 'success', error_message: str = None):
        self.supabase.table('scrape_logs').update({
            'scrape_end': datetime.utcnow().isoformat(),
            'records_found': records_found,
            'status': status,
            'error_message': error_message
        }).eq('id', log_id).execute()

    def get_all_internships(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        result = self.supabase.table('internships').select('*').order('date_posted', desc=True).limit(limit).offset(offset).execute()
        return result.data

    def search_internships(self, keyword: str = None, location: str = None, source_site: str = None, limit: int = 100) -> List[Dict]:
        query = self.supabase.table('internships').select('*')

        if keyword:
            query = query.or_(f'job_title.ilike.%{keyword}%,job_description.ilike.%{keyword}%')

        if location:
            query = query.ilike('location', f'%{location}%')

        if source_site:
            query = query.eq('source_site', source_site)

        result = query.order('date_posted', desc=True).limit(limit).execute()
        return result.data

    def get_latest_scrape_info(self) -> Optional[Dict]:
        result = self.supabase.table('scrape_logs').select('*').order('scrape_start', desc=True).limit(1).maybeSingle().execute()
        return result.data
