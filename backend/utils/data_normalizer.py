import hashlib
from datetime import datetime
from typing import Dict, Any, List
import re

class DataNormalizer:    
    def _generate_content_hash(self, job_data: Dict[str, Any]) -> str:
        """Generates a unique hash based on core job content."""
        unique_string = (
            f"{job_data.get('job_title', '').strip()}|"
            f"{job_data.get('company_name', '').strip()}|"
            f"{job_data.get('location', '').strip()}|"
            f"{job_data.get('source_site', '').strip()}"
        )
        return hashlib.md5(unique_string.encode('utf-8')).hexdigest()
    
    def _normalize_date(self, date_str: str) -> str:
        """Converts various date strings to ISO format."""
        if not date_str or 'recent' in date_str.lower():
            return datetime.utcnow().isoformat()
        try:
            # Attempt to parse common formats, for now, we default to now
            return datetime.fromisoformat(date_str.replace('Z', '+00:00')).isoformat()
        except (ValueError, TypeError):
            return datetime.utcnow().isoformat()
    
    def _normalize_location(self, location_str: str) -> str:
        """Cleans and standardizes location strings."""
        if not location_str:
            return "Remote"
        
        # Simple rule: if 'remote' is present, classify as Remote
        if 'remote' in location_str.lower():
            return "Remote"
            
        # Remove "Morocco" if other city info is present
        location_str = location_str.replace("Morocco", "").strip(', ')
        return location_str if location_str else "Morocco"

    def _normalize_salary(self, salary_str: str) -> str:
        """Cleans salary string, keeping it simple."""
        if not salary_str:
            return "Not specified"
        # Remove extra text and standardize
        return salary_str.replace("Up to", "").replace("From", "").strip()

    def normalize_internship(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes a single internship dictionary."""
        normalized = {
            'job_title': raw_data.get('job_title', 'N/A').strip(),
            'company_name': raw_data.get('company_name', 'N/A').strip(),
            'location': self._normalize_location(raw_data.get('location')),
            'employment_type': 'Internship',
            'job_description': raw_data.get('job_description', '').strip(),
            'apply_link': raw_data.get('apply_link', '').strip(),
            'source_site': raw_data.get('source_site', 'Unknown').strip(),
            'date_posted': self._normalize_date(raw_data.get('date_posted')),
            'salary': self._normalize_salary(raw_data.get('salary')),
            'scraped_at': datetime.utcnow().isoformat()
        }
        
        normalized['content_hash'] = self._generate_content_hash(normalized)
        return normalized
    
    def normalize_internship_batch(self, raw_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes a list of internship dictionaries."""
        return [self.normalize_internship(data) for data in raw_data_list]