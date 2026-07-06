# Volleyball Tournament App

Full-stack app to run a volleyball tournament: player registration, team formation (manual + live captain draft), pool round-robin scheduling across courts, standings, and playoffs (semifinals, final, bronze).

**Stack:** Spring Boot 3 (Java 17) · PostgreSQL 16 · React 18 + TypeScript (Vite + MUI). See [`docs/SPEC.md`](docs/SPEC.md), [`docs/PLAN.md`](docs/PLAN.md), [`docs/TASKS.md`](docs/TASKS.md).

## Prerequisites
- Java 17, Maven (or use `./mvnw`)
- Node 18+ / npm
- Docker (for local Postgres) — or a local PostgreSQL 16 instance

## Run locally

1. **Start Postgres**
   ```bash
   docker compose up -d postgres
   ```
2. **Start the backend** (port 8080) — seeds a default admin on first boot:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Default admin: `admin@volleyball.local` / `admin123` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
3. **Start the frontend** (port 5173, proxies `/api` → 8080):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open http://localhost:5173 — log in at `/login`, manage tournaments at `/admin/tournaments`.

## Configuration (env vars, all have local defaults)
| Var | Purpose |
|-----|---------|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | Postgres connection (`DB_URL` is a full `jdbc:postgresql://...` URL) |
| `JWT_SECRET` | Base64 HMAC secret for JWTs (override outside local dev) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin account |
| `CORS_ORIGINS` | Allowed frontend origin(s) |

Player photos are stored as bytea in Postgres (`player.photo_data`), not on local disk — the
Render web service filesystem is ephemeral, so disk storage doesn't survive a deploy/restart.

## Build / test
```bash
cd backend  && ./mvnw clean verify     # backend build + tests
cd frontend && npm run typecheck && npm test
```

## Status
- ✅ M0 scaffolding · M1 auth + tournaments · M2 registration · M3 teams · M4 draft · M5 schedule/standings/playoffs — full stack, build-verified, algorithm unit tests passing.
- ✅ Runtime-verified end-to-end against live MySQL (full flow: register → teams → draft → schedule → standings → playoffs → bracket).
- ✅ M6 polish: CSV export (players/teams/schedule), player search/filter, per-tournament dashboard stats, empty/loading states.
- 🎉 All milestones (M0–M6) complete and build-verified.
