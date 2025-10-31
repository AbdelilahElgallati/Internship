# Internship Aggregator

Une application web complète (Frontend + Backend) pour agréger et rechercher des offres de stage.

Le backend utilise **FastAPI** et **Scrapy** pour scraper les données et les stocke dans **Supabase**. Le scraping est automatisé avec **APScheduler**.

## Stack Technique

* **Backend**: FastAPI, Scrapy, Supabase, APScheduler
* **Frontend**: React / Next.js, TailwindCSS 

## Installation

### Backend

1.  **Naviguer vers le dossier :**
    ```bash
    cd backend
    ```
2.  **Installer les dépendances Python :**
    ```bash
    pip install -r requirements.txt
    ```
   
3.  **Configurer la base de données :**
    * Exécutez le script SQL `backend/utils/table.sql` dans votre éditeur SQL Supabase.
4.  **Variables d'environnement :**
    * Créez un fichier `.env` à la racine de `backend/`.
    * Ajoutez vos clés Supabase (utilisez `backend/.env` comme modèle):
      ```env
      SUPABASE_URL="votre_url_supabase"
      SUPABASE_SERVICE_ROLE_KEY="votre_clé_de_service_supabase"
      ```
5.  **Lancer le serveur backend :**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```
   

### Frontend

1.  **Installer les dépendances Node.js :**
    ```bash
    npm install 
    ```
2.  **Variables d'environnement :**
    * Créez un fichier `.env.local` à la racine.
    * Ajoutez l'URL de votre API backend :
      ```env
      NEXT_PUBLIC_API_URL="http://localhost:8000"
      ```
3.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```

## Endpoints API principaux



* `GET /internships`: Récupérer les offres de stage (paginées).
* `GET /internships/search`: Rechercher des stages (par `keyword`, `location`, etc.).
* `GET /internships/stats`: Obtenir les statistiques agrégées.
* `GET /stats/last_update`: Voir le statut du dernier scraping.
* `POST /scrape/trigger`: Lancer manuellement un nouveau cycle de scraping.