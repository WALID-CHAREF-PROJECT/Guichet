# TicketFlow (inspiration UX marocaine FR)

Projet full-stack local inspiré d'une expérience billetterie moderne (sans reprise de marque/assets protégés), avec un frontend React/Vite et un backend Laravel 12 API.

## Structure

- `frontend/` : React + Vite + TypeScript + Tailwind CSS
- `backend/` : Laravel 12 API (REST)

## Pré-requis

- PHP 8.2+ (8.3 recommandé pour Laravel 12)
- Composer
- Node.js 20+
- npm
- SQLite ou MySQL

## Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### DB SQLite (simple local)

```bash
touch database/database.sqlite
# puis dans .env
# DB_CONNECTION=sqlite
# DB_DATABASE=/chemin/absolu/vers/backend/database/database.sqlite
```

### DB MySQL (option)

Configurer dans `.env` :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ticketflow
DB_USERNAME=root
DB_PASSWORD=
```

### Migration + seed

```bash
php artisan migrate --seed
```

### Run API

```bash
php artisan serve
```

API attendue sur : `http://127.0.0.1:8000/api`

Endpoints principaux :

- `GET /api/events`
- `GET /api/events/{slug}`
- `GET /api/categories`
- `GET /api/cities`
- `POST /api/newsletter/subscribe`

Exemple filtre :

`/api/events?search=jazz&category=concert&city=rabat&quick_date=7d&sort=price_asc&page=1`

## Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend attendu sur : `http://localhost:5173`

Variable :

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Fonctionnalités livrées

- Homepage FR responsive
- Header sticky avec langue/pays/panier/login/signup/menu mobile
- Listing événements + recherche + filtres (catégorie/ville/date rapide/tri)
- Détail événement via slug
- Newsletter branchée à l'API
- Page panier (scaffold) + 404
- Backend seed avec 16 événements mock réalistes (Casablanca, Rabat, Marrakech, Fès, Kénitra)
- CORS local React↔Laravel configuré

## Notes auth

L'auth complète est volontairement mock/scaffold pour la démo locale.
Vous pouvez ajouter Sanctum plus tard via `composer require laravel/sanctum` si nécessaire.
