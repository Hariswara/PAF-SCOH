# Smart Campus Operations Hub

**Stack:** Spring Boot 3.4 (Java 21) + React 19 (TypeScript, Vite) + PostgreSQL (Neon)

## Prerequisites

- [Java 21](https://adoptium.net/)
- [Node.js 22](https://nodejs.org/)
- [Docker](https://www.docker.com/) (optional, for containerized backend)
- [Neon](https://neon.tech/) PostgreSQL database

## Setup

```bash
git clone <repo-url>
cd PAF-SCOP
cp .env.example .env
```

Fill in your Neon credentials in `.env`:

```
NEON_DB_URL=URI
NEON_DB_USER=your_username
NEON_DB_PASS=your_password
```

## Running the Backend

```bash
docker compose up --build
```

API runs at `http://localhost:8080`.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. API calls under `/api` are proxied to the backend.
