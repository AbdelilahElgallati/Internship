from datetime import datetime, timedelta
import re
from typing import Optional

class DataNormalizer:
    @staticmethod
    def normalize_date(date_str: str) -> Optional[str]:
        if not date_str:
            return None

        date_str = date_str.lower().strip()
        now = datetime.utcnow()

        if 'just now' in date_str or 'today' in date_str:
            return now.isoformat()
        elif 'yesterday' in date_str:
            return (now - timedelta(days=1)).isoformat()
        elif 'hour' in date_str:
            hours = re.search(r'(\d+)', date_str)
            if hours:
                return (now - timedelta(hours=int(hours.group(1)))).isoformat()
        elif 'day' in date_str:
            days = re.search(r'(\d+)', date_str)
            if days:
                return (now - timedelta(days=int(days.group(1)))).isoformat()
        elif 'week' in date_str:
            weeks = re.search(r'(\d+)', date_str)
            if weeks:
                return (now - timedelta(weeks=int(weeks.group(1)))).isoformat()
        elif 'month' in date_str:
            months = re.search(r'(\d+)', date_str)
            if months:
                return (now - timedelta(days=int(months.group(1)) * 30)).isoformat()

        return now.isoformat()

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text

    @staticmethod
    def normalize_location(location: str) -> str:
        if not location:
            return "Remote"
        location = DataNormalizer.clean_text(location)
        return location

    @staticmethod
    def truncate_description(description: str, max_length: int = 500) -> str:
        if not description:
            return ""
        description = DataNormalizer.clean_text(description)
        if len(description) > max_length:
            return description[:max_length] + "..."
        return description

    @staticmethod
    def normalize_internship(raw_data: dict) -> dict:
        return {
            'job_title': DataNormalizer.clean_text(raw_data.get('job_title', '')),
            'company_name': DataNormalizer.clean_text(raw_data.get('company_name', '')),
            'location': DataNormalizer.normalize_location(raw_data.get('location', '')),
            'date_posted': DataNormalizer.normalize_date(raw_data.get('date_posted', '')),
            'employment_type': raw_data.get('employment_type', 'Internship'),
            'job_description': DataNormalizer.truncate_description(raw_data.get('job_description', '')),
            'apply_link': raw_data.get('apply_link', ''),
            'source_site': raw_data.get('source_site', '')
        }
