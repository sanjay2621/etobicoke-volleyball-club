# Tasks — Volleyball Tournament App

> Phase 3. Ordered by dependency. `[ ]` todo · `[~]` in progress · `[x]` done.
>
> **M0–M5 runtime-verified** (2026-06-22) against live MySQL via an end-to-end smoke test:
> admin login → tournament → registration (+ duplicate email/phone → 409) → account+/me →
> teams (+ one-team guard) → draft start/pick → pool generation → standings (tiebreakers) →
> playoff generation (A1–B2 / B1–A2) → result entry → bracket propagation. All passed.

## M0 — Scaffolding ✅
- [x] docker-compose.yml (MySQL 8), .gitignore, README
- [x] Backend Maven project + deps + application.yml — _compiles (35 classes)_
- [x] common/: BaseEntity (soft-delete+audit), GlobalExceptionHandler, ApiError, FileStorageService
- [x] Frontend Vite+TS + deps + axios client + query client + router + 2 themes + auth context — _builds clean_

## M1 — Auth + Tournament ✅ (code complete; runtime verify pending DB up)
- [x] Flyway V1: user_account, tournament
- [x] JWT util + SecurityConfig + seeded admin + AuthController (login/refresh/register-account)
- [x] TournamentController + service + repo + DTOs + mapper (CRUD) with @PreAuthorize ADMIN
- [x] FE: login page, auth guard/role routing, Tournaments admin page (create/edit/delete dialog), admin layout + dashboard

## M2 — Player registration ✅ (code complete; runtime verify pending DB up)
- [x] Flyway V2: player (+embedded address, player_position element collection, photo_path)
- [x] Registration endpoint (multipart data+photo) + duplicate check (email/phone per tournament → 409) + photo storage + FileStorageService
- [x] Player CRUD + GET /players/me + GET /{id}/photo; owner-or-admin read enforced; PlayerDirectory wired (activates register-account)
- [x] FE: public registration form (zod, photo preview, Canada default, exactly-2 positions, waiver, emergency contact, skill) + set-password + player dashboard + admin Players list/edit/delete
- _Note:_ list endpoint computes hasAccount per-row (N+1) — fine for MVP, optimize in M6 if needed.

## M3 — Teams ✅ (code complete; runtime verify pending DB up)
- [x] Flyway V3: team, team_member (unique team+player)
- [x] Team CRUD + add/remove members + captain/referee + group/seed + one-team-per-player guard + manual player creation (admin) + GET /teams/my
- [x] FE: admin Teams page (team cards, roster builder w/ autocomplete, captain star, referee assign, delete) + player My Team view on dashboard

## M4 — Draft ✅ (code complete; runtime verify pending DB up)
- [x] Flyway V4: draft (one per tournament)
- [x] Start (requires captain on every team) + snake turn logic (DraftOrder pure util) + pick validation (turn-driven, no double-pick) + state (board + available)
- [x] Unit test: DraftOrderTest (snake order + bounds) — passing
- [x] FE: admin draft board (on-the-clock banner, team columns, available list w/ Draft buttons)

## M5 — Schedule + standings + playoffs ✅ (code complete; runtime verify pending DB up)
- [x] Flyway V5: match_game, match_set
- [x] Snake group split + round-robin (circle method) + greedy court/time packing (no double-book) + result entry
- [x] Standings + tiebreakers (wins → H2H → set diff → point diff → points-for)
- [x] Playoff generation: semis A1-B2 / B1-A2, FINAL + BRONZE with W:/L: feeder propagation on semi results
- [x] Unit tests: RoundRobinTest, StandingsTest (+ DraftOrderTest) — all passing
- [x] FE: admin Schedule page (pool + bracket tables, generate pools/playoffs, standings tables w/ top-2 shading, result-entry dialog with multi-set support)

## M6 — Polish ✅
- [x] CSV export (players/teams/schedule) — admin-only endpoints + authed client download; verified via live export
- [x] Player search/filter (name/email/phone/position/payment) on admin Players page
- [x] Richer admin dashboard (per-tournament stats: players, teams, matches+completed, draft status, registration, courts, logins)
- [x] Empty/loading states across admin pages; README finalized