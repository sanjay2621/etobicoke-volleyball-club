# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Full-stack app to run a volleyball tournament end-to-end: player registration → team formation
(manual or live captain draft) → two-group round-robin pool schedule across courts → standings →
playoffs (semifinals, final, bronze). Stack: Spring Boot 3 (Java 17) + MySQL 8 (Flyway) backend,
React 18 + TypeScript (Vite + MUI) frontend. Full domain model, algorithms, and API surface are
specified in `docs/SPEC.md` (also see `docs/PLAN.md` for build-order rationale). Read `docs/SPEC.md`
§6-8 before touching domain logic — it is the source of truth for field names and business rules.

## Commands

```bash
# Database (from repo root)
docker compose up -d mysql             # MySQL 8 on :3306 (db: volleyball)

# Backend (from backend/)
./mvnw spring-boot:run                 # run API on :8080, seeds admin on first boot
./mvnw clean verify                    # compile + unit + integration tests (Testcontainers MySQL)
./mvnw test                            # unit tests only
./mvnw test -Dtest=RoundRobinTest      # run a single test class
./mvnw flyway:migrate                  # apply DB migrations (also auto-runs on boot)

# Frontend (from frontend/)
npm install
npm run dev                            # Vite dev server on :5173, proxies /api -> :8080
npm run build                          # tsc -b && vite build
npm test                               # vitest run
npx vitest run src/path/to/File.test.tsx   # run a single test file
npm run lint                           # eslint .
npm run typecheck                      # tsc --noEmit
```

Default seeded admin: `admin@volleyball.local` / `admin123` (override via `ADMIN_EMAIL` /
`ADMIN_PASSWORD`). Full env var list is in the README.

## Architecture

### Backend: package-by-domain, layered within each

`backend/src/main/java/com/volleyball/tournament/` has one package per bounded context:
`auth`, `player`, `tournament`, `team`, `draft`, `schedule` (also owns `Match`/`MatchSet`
entities — despite the spec's aspirational separate `match/` package, matches actually live
under `schedule`), `security`, `config`, `common`.

Each domain package follows: `api/` (thin `@RestController`) → `service/` → `repository/` →
`entity/` + `model/` (request/response DTOs) + `mapper/` (MapStruct, where present). Controllers
never return JPA entities and contain no business logic — they delegate straight to a service.
Reads are `@Transactional(readOnly = true)`. Constructor injection via Lombok `@RequiredArgsConstructor`.

`common/` holds cross-cutting pieces: `BaseEntity` (soft delete + auditing — repositories must
filter `deleted`), `GlobalExceptionHandler` + `ApiError`/`ApiException`/`NotFoundException`/
`DuplicateRegistrationException`, and `FileStorageService` (player photo uploads, stored under
`uploads/{tournamentId}/{uuid.ext}`, served via a controlled endpoint — never static dir traversal).

Auth is JWT (access + refresh) via `security/JwtService` + `JwtAuthenticationFilter`, configured
in `security/SecurityConfig`. Roles: `ADMIN`, `PLAYER`. Players may only read their own player
record; admin-only endpoints check `ROLE_ADMIN`.

Schema changes go through a new Flyway migration in `backend/src/main/resources/db/migration/`
(`V{n}__description.sql`, sequential, never edit a shipped migration) — `spring.jpa.hibernate.ddl-auto`
is `validate`, so the entity model must match the migrations exactly or the app won't boot.

### Algorithm-heavy areas (have dedicated unit tests, keep them passing)

- `draft/service` — snake-order turn logic, pick validation (no double-picks, must be current
  team's turn). Test: `draft/service/DraftOrderTest`.
- `schedule/service` — snake seeding into Group A/B, round-robin generation (circle method,
  handles odd team counts via byes), greedy court/time-slot packing (a team is never double-booked
  in a slot), standings computation with tiebreakers (wins → head-to-head → set ratio → point
  diff → points-for), playoff bracket generation (top 2/group → semis cross-seeded A1×B2/B1×A2 →
  final best-of-3 + bronze). Tests: `schedule/service/RoundRobinTest`, `StandingsTest`.

Tournament config (`poolMatchDurationMinutes`, `breakMinutes`, `numberOfCourts`, `targetRosterSize`,
`captainCountsInRoster`, etc.) is per-tournament and drives these algorithms — don't hardcode values
like "6 players" or "4 courts".

### Frontend: two visually distinct themes sharing one app shell

`frontend/src/`:
- `api/` — one Axios client (`client.ts`, attaches JWT, handles refresh) + one file per domain
  exposing TanStack Query hooks. Components never call `fetch`/`axios` directly — always go through
  a hook here.
- `auth/` — auth context, login, route guards (role-based).
- `theme/` — `playerTheme.ts` (public/player site: navy `#1A2B4A` + orange/coral `#FF6B35`, energetic,
  rounded) and `adminTheme.ts` (admin panel: slate/teal `#0F4C5C`, dense data-grid-heavy dashboard).
  Which route group mounts which `ThemeProvider` determines the look — check this before adding UI
  so new screens land in the right visual language.
- `pages/public/`, `pages/player/`, `pages/admin/` — route groups mirroring the two themes plus
  public/unauthenticated pages.
- `types/` — TS types mirroring backend DTOs; keep in sync when backend `model/` DTOs change.

### Cross-cutting conventions

- Duplicate player registration (same email OR phone within the same tournament) → `409` with
  which field collided — this is enforced both by `DuplicateRegistrationException` server-side and
  Zod validation client-side.
- Admin can add a player to a team who isn't in the registration list (creates a lightweight
  "manual" player record) — don't assume every team member has a full registration.
- Draft turn integrity is server-authoritative: every pick call validates against `currentPickTeamId`
  server-side, since the v1 draft UI is single-screen admin-operated (not yet real-time multi-device).

## Boundaries (from docs/SPEC.md §10)

- **Ask first:** adding a new runtime dependency, changing DB schema after a migration has shipped
  (prefer a new migration over editing one), introducing WebSockets/real-time, any cloud/email
  integration, changing the auth model.
- **Never:** return JPA entities from controllers, store passwords in plaintext, delete failing
  tests to make CI green, commit `node_modules`/`target`/`uploads`, commit real secrets or a real
  DB password.
