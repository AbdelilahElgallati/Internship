import hashlib
from datetime import datetime
from typing import Dict, Any

class DataNormalizer:
    """Normalise les données de scraping pour l'insertion en base de données"""
    
    @staticmethod
    def _generate_content_hash(job_data: Dict[str, Any]) -> str:
        """
        Génère un hash unique basé sur le contenu du job
        Utilisé pour détecter les doublons
        """
        # Créer une chaîne unique à partir des données importantes
        unique_string = f"{job_data.get('job_title', '')}|" \
                       f"{job_data.get('company_name', '')}|" \
                       f"{job_data.get('location', '')}|" \
                       f"{job_data.get('apply_link', '')}"
        
        # Générer un hash MD5
        return hashlib.md5(unique_string.encode('utf-8')).hexdigest()
    
    @staticmethod
    def _normalize_date(date_str: str) -> str:
        """
        Normalise les différents formats de date en ISO format
        """
        if not date_str or date_str == 'Recently':
            return datetime.utcnow().isoformat()
        
        # Si c'est déjà au format ISO, retourner tel quel
        if 'T' in date_str or len(date_str) > 15:
            return date_str
        
        # Sinon, utiliser la date actuelle
        return datetime.utcnow().isoformat()
    
    def normalize_internship(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalise les données d'un stage pour correspondre au schéma de la base de données
        """
        normalized = {
            'job_title': raw_data.get('job_title', 'Untitled Position').strip(),
            'company_name': raw_data.get('company_name', 'Unknown Company').strip(),
            'location': raw_data.get('location', 'Remote').strip(),
            'employment_type': raw_data.get('employment_type', 'Internship').strip(),
            'job_description': raw_data.get('job_description', '').strip(),
            'apply_link': raw_data.get('apply_link', '').strip(),
            'source_site': raw_data.get('source_site', 'Unknown').strip(),
            'date_posted': self._normalize_date(raw_data.get('date_posted', '')),
            'scraped_at': datetime.utcnow().isoformat()
        }
        
        # Générer le content_hash
        normalized['content_hash'] = self._generate_content_hash(normalized)
        
        return normalized
    
    def normalize_internship_batch(self, raw_data_list: list[Dict[str, Any]]) -> list[Dict[str, Any]]:
        """
        Normalise un lot de stages
        """
        return [self.normalize_internship(data) for data in raw_data_list]