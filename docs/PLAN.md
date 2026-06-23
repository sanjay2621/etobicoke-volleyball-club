# Implementation Plan — Volleyball Tournament App

> Phase 2 of spec-driven workflow. Build order, dependencies, risks. See `SPEC.md` for the what/why.

## Build order (milestones)

Each milestone is independently verifiable. Earlier milestones unblock later ones.

### M0 — Scaffolding & infra (sequential, foundational)
- `docker-compose.yml` (MySQL 8), root `.gitignore`, `README.md`.
- Backend Maven project: Spring Boot 3.4, deps (web, security, data-jpa, validation, mysql, flyway, lombok, mapstruct), `application.yml`, base packages, `common/` (BaseEntity w/ soft-delete + auditing, GlobalExceptionHandler, ApiError, FileStorageService).
- Frontend Vite+TS project: deps (react-router, tanstack-query, axios, react-hook-form, zod, mui), axios client w/ JWT interceptor, query client, router skeleton, two MUI themes, auth context.
- **Verify:** backend boots & connects to MySQL; Flyway runs empty baseline; `npm run dev` serves a placeholder home page.

### M1 — Auth + Tournament (foundation domains)
- Flyway `V1` schema: `user_account`, `tournament`.
- Backend: JWT issue/validate/refresh, SecurityConfig (role-based), seeded admin, `AuthController`, `TournamentController` (CRUD).
- Frontend: login page, auth guard/role routing, admin Tournament CRUD page.
- **Verify:** seeded admin logs in, creates a tournament; unauthenticated calls rejected.

### M2 — Player registration (the public entry point)
- Flyway `V2`: `player`, `player_address`, positions, photo path.
- Backend: multipart registration endpoint, duplicate (email/phone per tournament) → 409, photo storage, player CRUD, `GET /players/me`.
- Frontend: themed public registration form (react-hook-form + zod, photo upload, Canada default, exactly-2 positions), success/duplicate handling; "set password" → account creation; player dashboard showing own registration.
- **Verify:** SPEC success criteria 1, 2.

### M3 — Teams (manual formation)
- Flyway `V3`: `team`, `team_member`.
- Backend: team CRUD, add/remove member (registered or manual player), assign captain/referee, group/seed.
- Frontend: admin Teams page (list, create, edit, delete, roster builder, referee assign), player "My Team" view.
- **Verify:** SPEC success criteria 3, 5, 9 (team view part).

### M4 — Draft engine
- Flyway `V4`: `draft`, `draft_pick`.
- Backend: designate captains, start draft, snake-order turn logic, pick validation (no double-pick, must be your turn), draft state, auto-complete.
- Frontend: admin draft board (available players, per-team rosters, whose-turn indicator, pick action).
- **Verify:** SPEC success criterion 4. Unit tests on snake order + pick validation.

### M5 — Schedule + standings + playoffs (most algorithm-heavy)
- Flyway `V5`: `match`, `match_set`.
- Backend: snake group split, round-robin (circle method), greedy court/time packing (no double-book), result entry, standings computation w/ tiebreakers, playoff generation (semis cross-seed, final, bronze).
- Frontend: admin schedule view (by court/time), standings table, result entry, bracket view; player schedule view.
- **Verify:** SPEC success criteria 6, 7, 8. Unit tests on round-robin, court packing, standings tiebreakers.

### M6 — Polish
- Dashboard stats, player list filter/search, CSV export, empty/error states, theme consistency pass, README run instructions.

## Dependencies & parallelism
- M0 must finish first. M1 before all others (auth gates APIs).
- After M1: M2 and M3 backend are largely independent and can be built in parallel (teams reference players, so M2 entity must land first — do M2 entity, then parallelize).
- M4 depends on M3 (teams + captains). M5 depends on M3 (teams) and benefits from M4 (drafted teams) but can run with manually-built teams too.
- Frontend per-milestone can lag its backend by one step.

## Risks & mitigations
- **Court-packing feasibility** (teams double-booked / not enough courts): greedy w/ constraint check; if infeasible, return actionable warning rather than a broken schedule. Cover with unit tests on 5-team and odd-team groups (byes).
- **Draft turn integrity** (race/double-pick): server is source of truth; every pick validates `currentPickTeamId`. Single-screen admin mode sidesteps concurrency in v1; design leaves room for locking later.
- **Photo uploads** (size/type): validate content-type + max size; store under `uploads/{tournamentId}/{uuid.ext}`; serve via a controlled endpoint, not static dir traversal.
- **Roster/draft-round contradiction:** resolved by config (`targetRosterSize`, `captainCountsInRoster`) — no hardcoded 6.
- **Scope:** large surface. Strategy = thin vertical slices per milestone, each demoable, tests on the algorithmic core (not on CRUD glue).

## Verification checkpoints
After each milestone: `mvnw verify` green, `npm test` + `npm run typecheck` green, and the milestone's mapped SPEC success criteria demonstrably pass.