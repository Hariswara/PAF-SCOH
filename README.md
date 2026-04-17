# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack university operations platform with modules for authentication, ticket management, resource catalog, bookings, and notifications.

## Tech Stack

- Backend: Spring Boot 3.4.3, Java 21, JDBC
- Frontend: React 19, TypeScript, Vite 7, Tailwind CSS 4
- Database: PostgreSQL (Neon)
- Authentication: Google OAuth2 + Passkeys (WebAuthn)
- Media: Cloudinary

## Core Modules

- User authentication and profile management
- Ticket submission, tracking, and comments
- Resource catalog and search
- Booking workflows
- In-app notifications

## Prerequisites

- Java 21
- Node.js 22+
- npm 10+
- Docker Desktop (optional, for backend container run)
- PostgreSQL database connection (Neon recommended)

## Environment Setup

1. Clone the repository and move to the project root.
2. Create your environment file:

```bash
cp .env.example .env
```

3. Fill all required values in `.env`:

```env
NEON_DB_URL=
NEON_DB_USER=
NEON_DB_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
INITIAL_ADMIN_EMAIL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Run the Project

### Option 1: Backend with Docker + Frontend locally

From project root:

```bash
docker compose up --build
```

Then run frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

### Option 2: Run both services locally

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell alternative:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

The frontend dev server proxies these backend paths:

- `/api`
- `/oauth2`
- `/login/oauth2`

## Build and Test

Backend:

```bash
cd backend
./mvnw clean test
./mvnw clean package
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Troubleshooting

- `docker compose up --build` exits with code 1:
	- Ensure `.env` exists at project root.
	- Verify all required variables are set (database, Google OAuth, Cloudinary).
	- Check that port `8080` is free.
- Frontend cannot reach backend:
	- Confirm backend is running on `http://localhost:8080`.
	- Confirm frontend runs on `http://localhost:5173` so Vite proxy is active.
- OAuth login errors:
	- Verify Google OAuth client credentials and redirect URI configuration.

## Project Structure

```text
backend/   Spring Boot API
frontend/  React + Vite client
mydocs/    Testing and supporting docs
```
