import sys
import os
import subprocess
import threading
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from config import SCRAPE_INTERVAL_HOURS, SCRAPE_KEYWORDS, SCRAPE_LOCATIONS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(os.path.dirname(BASE_DIR))

class ScraperScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler(daemon=True)
        self.scraper_names = ['LinkedIn', 'Rekrute', 'RemoteOK']
        self.is_scraping = False

    def run_scraper_in_subprocess(self, scraper_name: str):
        script_path = os.path.join(BASE_DIR, 'scrapers', f'run_{scraper_name.lower()}.py')
        
        if not os.path.exists(script_path):
            print(f"❌ Erreur: Le script {script_path} n'a pas été trouvé.")
            return

        print(f"--- Démarrage du scraper: {scraper_name} ---")
        try:
            result = subprocess.run(
                [sys.executable, script_path],
                capture_output=True,
                text=True,
                timeout=1800, 
                check=True,
                encoding='utf-8'
            )
            print(f"--- Sortie de {scraper_name}: ---")
            print(result.stdout)
            print(f"--- {scraper_name} terminé ---")

        except subprocess.TimeoutExpired:
            print(f"❌ {scraper_name} a expiré (timeout de 30 minutes).")
        except subprocess.CalledProcessError as e:
            print(f"❌ {scraper_name} a échoué avec le code {e.returncode}:")
            print(e.stderr)
        except Exception as e:
            print(f"❌ Erreur inconnue lors de l'exécution de {scraper_name}: {e}")

    def scrape_all_sites(self):
        if self.is_scraping:
            print("ℹ️ Un scraping est déjà en cours. Annulation du nouveau déclenchement.")
            return

        self.is_scraping = True
        start_time = datetime.utcnow()
        print(f"\n{'='*60}")
        print(f"🚀 Démarrage du scraping de tous les sites à {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"Mots-clés: {SCRAPE_KEYWORDS}")
        print(f"Lieux: {SCRAPE_LOCATIONS}")
        print(f"{'='*60}\n")

        try:
            for scraper_name in self.scraper_names:
                if not self.is_scraping: 
                    print("🛑 Scraping interrompu.")
                    break
                self.run_scraper_in_subprocess(scraper_name)
        finally:
            self.is_scraping = False
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            print(f"\n{'='*60}")
            print(f"🏁 Scraping terminé en {duration:.2f} secondes.")
            print(f"{'='*60}\n")

    def start(self):
        self.scheduler.add_job(
            func=self.scrape_all_sites,
            trigger=IntervalTrigger(hours=SCRAPE_INTERVAL_HOURS),
            id='scrape_internships',
            name='Scraper les stages de toutes les sources',
            replace_existing=True,
        )
        
        print("📡 Lancement du scraping initial dans un thread d'arrière-plan...")
        initial_scrape_thread = threading.Thread(target=self.scrape_all_sites, daemon=True)
        initial_scrape_thread.start()

        self.scheduler.start()
        print(f"📅 Planificateur démarré. S'exécutera toutes les {SCRAPE_INTERVAL_HOURS} heures.")

    def stop(self):
        self.is_scraping = False 
        self.scheduler.shutdown()
        print("🛑 Planificateur arrêté.")