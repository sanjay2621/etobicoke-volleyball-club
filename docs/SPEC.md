# Spec: Volleyball Tournament Web Application

> Status: **DRAFT — awaiting human approval** (Phase 1: Specify)
> Location: `C:\dev\work\Volleyball`

---

## 1. Objective

A web application for organizing and running a recreational volleyball tournament end-to-end:
players self-register, an admin builds teams (manually or via a live captain **draft**),
the system auto-generates a **two-group round-robin schedule** across multiple courts, and
results drive **standings → semifinals → final + bronze-medal** matches.

**Users & success:**

| Role | What they can do | "Done" looks like |
|------|------------------|-------------------|
| **Player** | Register for a tournament; log in; view their own registration; once drafted, view their full team roster + schedule. | A player registers, logs in, and sees their team and match schedule. |
| **Admin** | Manage tournaments, view/edit/delete registrations & teams, designate captains, run the draft, generate & publish the schedule, enter match results. | Admin takes a pool of registered players → teams → published schedule → recorded results → crowned champion, all in the app. |

**Scope (v1 decisions, confirmed with stakeholder):**
- Auth: **email + password, JWT**. Roles: `ADMIN`, `PLAYER`.
- Captain draft: **admin single-screen, live** (admin picks on behalf of each captain in turn). Data model designed so real-time multi-device can be added later without rework.
- Photos: **local filesystem**, path stored in DB.
- Target: **local-first working MVP** (localhost). Email, payments, cloud deploy deferred.

**Out of scope (v1):** online payments, email/SMS notifications, real-time multi-device draft, live spectator scoreboard, multi-tenant/org isolation, mobile native apps.

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Java 17, Spring Boot 3.4.x, Spring Web, Spring Security 6 (JWT), Spring Data JPA / Hibernate |
| DB | MySQL 8.x, Flyway migrations |
| Mapping / boilerplate | MapStruct, Lombok |
| Build (BE) | Maven 3.9 (`mvnw` wrapper) |
| Frontend | React 18, TypeScript, Vite |
| FE data layer | TanStack Query v5, Axios (single API client) |
| FE routing | react-router-dom v6 |
| FE forms | react-hook-form + Zod validation |
| FE UI / theme | MUI v5 + two custom themes (player site vs admin panel — see §5) |
| FE i18n | (Deferred — English only in v1; strings centralized to ease later i18n) |
| Testing | BE: JUnit 5 + MockMvc + Testcontainers (MySQL). FE: Vitest + React Testing Library |
| Auth tokens | JWT access token (short-lived) + refresh token |

---

## 3. Commands

```bash
# Backend (from backend/)
./mvnw spring-boot:run                 # run API on :8080
./mvnw clean verify                    # compile + unit + integration tests
./mvnw test                            # unit tests only
./mvnw flyway:migrate                  # apply DB migrations (auto-runs on boot)

# Frontend (from frontend/)
npm install
npm run dev                            # Vite dev server on :5173, proxies /api -> :8080
npm run build                          # production build
npm test                               # Vitest
npm run lint                           # ESLint
npm run typecheck                      # tsc --noEmit

# Database (local)
docker compose up -d mysql             # MySQL 8 on :3306 (db: volleyball)
```

---

## 4. Project Structure

```
Volleyball/
├── docs/
│   ├── SPEC.md                  # this file
│   ├── PLAN.md                  # technical implementation plan (Phase 2)
│   └── TASKS.md                 # task breakdown (Phase 3)
├── docker-compose.yml           # local MySQL
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/volleyball/tournament/
│       ├── config/              # security, CORS, JWT, file-storage config
│       ├── auth/                # login, registration-of-account, JWT issue/refresh
│       ├── player/              # player registration domain (api/service/repo/entity/model/mapper)
│       ├── tournament/          # tournament entity + CRUD
│       ├── team/                # teams, rosters, captain assignment
│       ├── draft/               # captain-draft engine (rounds, picks)
│       ├── schedule/            # match generation, courts, standings, bracket
│       ├── match/               # match + set results
│       └── common/              # exceptions, base entity (soft delete, audit), file storage
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/        # Flyway V1__*.sql ...
├── frontend/
│   └── src/
│       ├── api/                 # axios client + per-domain hooks (TanStack Query)
│       ├── auth/                # auth context, login, guards
│       ├── theme/               # playerTheme.ts, adminTheme.ts
│       ├── components/          # shared UI
│       ├── pages/
│       │   ├── public/          # home, register, login
│       │   ├── player/          # player dashboard, my team
│       │   └── admin/           # dashboard, players, teams, draft, schedule, tournaments
│       └── types/               # shared TS types (mirrors DTOs)
└── uploads/                     # player photos (gitignored)
```

Each backend domain follows: `api/` (thin `@RestController`) → `service/` → `repository/` → `entity/` + `model/` (DTOs) + `mapper/` (MapStruct). No business logic in controllers; controllers never return entities.

---

## 5. Code Style & Themes

**Backend** — thin controller delegating to service, DTOs in/out, constructor injection via Lombok:

```java
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerService playerService;

    @PostMapping
    public ResponseEntity<PlayerResponse> register(@Valid @RequestBody PlayerRegistrationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(playerService.register(req));
    }
}
```

- Validation via `jakarta.validation` annotations on request DTOs.
- Duplicate-registration check throws `DuplicateRegistrationException` → `409 Conflict` with field detail (which of phone/email collided).
- Soft delete: base entity `deleted` flag; repositories filter it.
- `@Transactional(readOnly = true)` for reads.

**Frontend** — function components, typed hooks, no raw fetch in components:

```tsx
export function usePlayers(tournamentId: string) {
  return useQuery({
    queryKey: ['players', tournamentId],
    queryFn: () => api.get<PlayerResponse[]>(`/players?tournamentId=${tournamentId}`).then(r => r.data),
  });
}
```

**Themes (two distinct looks):**
- **Player / public site** — energetic sport vibe. Palette: deep volleyball navy `#1A2B4A` + vibrant orange/coral accent `#FF6B35` + clean white; rounded cards, large hero on home page with tournament name/date, friendly sans-serif (Inter/Poppins). Motion-light, welcoming.
- **Admin panel** — dense, professional dashboard. Cooler palette: slate/teal `#0F4C5C` primary, neutral greys, compact tables, side-nav layout, data-grid heavy. Optimized for managing many rows quickly.

Both implemented as MUI `createTheme` objects; route group decides which `ThemeProvider` wraps the tree.

---

## 6. Domain Model

### Tournament
`id, name, date, startTime (default 08:00), venue, numberOfCourts (default 4), breakMinutes (default 10), poolMatchDurationMinutes (default 20), poolSetsToWin (default 1), poolPointsPerSet (default 25), finalSetsToWin (default 2 → best of 3), finalPointsPerSet (default 15), registrationOpen (bool), status (SETUP|REGISTRATION|DRAFT|SCHEDULED|IN_PROGRESS|COMPLETE)`

### Player Registration
Required (from stakeholder):
`firstName, middleName(optional), lastName, phone, email, photoPath, address{line1,line2,city,province,postalCode,country=Canada default}, preferredPositions (exactly 2 of: CENTER, NETTY, FRONT, BACK, ANYWHERE, REFEREE), tshirtSize (S|M|L|XL|XXL|XXXL), tournamentId`

**Suggested additional fields** (proposed — see Open Questions): `dateOfBirth` (age divisions), `gender` (for mixed-team rules), `emergencyContactName + emergencyContactPhone`, `skillLevel` (BEGINNER|INTERMEDIATE|ADVANCED — helps captains draft), `yearsExperience`, `jerseyNumberPreference`, `waiverAccepted (bool, required)`, `photoConsent (bool)`, `dietaryNotes`, `paymentStatus (UNPAID|PAID — tracked, not processed)`, `notes`.

Duplicate check: reject if an active registration exists with the **same email OR same phone** within the **same tournament** → `409`.

### Team
`id, tournamentId, name, captainPlayerId (nullable until assigned), refereePlayerId (nullable), group (A|B|null), seed (int), members (1..N players, captain included)`
- Min roster = 6 (1 captain + 5, or 6 incl. captain per "6 players (1 captain)").
- Admin may add a player to a team **even if not in the registration list** (creates a lightweight "manual" player record).

### Draft
`id, tournamentId, status (NOT_STARTED|IN_PROGRESS|COMPLETE), currentRound, currentPickTeamId`
`DraftPick: id, draftId, round, pickOrder, teamId, playerId, timestamp`
- Pre-req: admin designates N captains (one per team; e.g. 10 captains → 10 teams). Captains are themselves players.
- Each round, every team picks 1 player (snake order recommended: 1→N then N→1). 6 rounds → 6 players/team (incl. captain as round-0 seed). Configurable target roster size.
- Players already picked or designated captains are unavailable.

### Match
`id, tournamentId, stage (POOL|SEMIFINAL|FINAL|BRONZE), group (A|B|null), court, scheduledStart, homeTeamId, awayTeamId (nullable for TBD bracket slots), status (SCHEDULED|IN_PROGRESS|COMPLETE), winnerTeamId`
`MatchSet: id, matchId, setNumber, homePoints, awayPoints`

### Standings (derived)
Per group: `wins, losses, setsWon, setsLost, pointsFor, pointsAgainst, pointDiff`.
**Tiebreaker order:** (1) wins, (2) head-to-head, (3) set ratio, (4) point differential, (5) points-for. Configurable later; this is the v1 default.

### User Account
`id, playerId (nullable for admins), email, passwordHash, role (ADMIN|PLAYER), enabled`. Created when a player sets a password; admin seeded at startup.

---

## 7. Key Algorithms

**Group assignment:** Admin sets each team's `seed` (or auto-seed by registration order). Teams split into Group A / Group B by **snake seeding** (1→A, 2→B, 3→B, 4→A, …) for balance. Admin can override group/seed manually.

**Round-robin generation (per group):** Circle method. For *n* teams, *n−1* rounds (if *n* even) or *n* rounds (if odd, with byes). Each team plays every other once. Example: 5 teams → 4 matches each.

**Court + time assignment:**
- Slot length = `poolMatchDurationMinutes + breakMinutes` (default 20 + 10 = 30 min).
- Matches packed across `numberOfCourts` courts starting at `startTime` (default 08:00).
- Constraint: a team is never scheduled on two courts in the same slot. Greedy assignment honoring this; warn admin if infeasible.

**Bracket:** Top 2 per group advance. Semifinals cross-seed: **A1 vs B2** and **B1 vs A2**. Semifinal **winners → Final** (best of 3, 15-pt sets). Semifinal **losers → Bronze match**. Brackets scheduled after pool play completes (admin clicks "Generate Playoffs").

---

## 8. API Surface (high level)

```
POST   /api/auth/register-account     # player sets password (links to registration)
POST   /api/auth/login                # -> JWT + refresh
POST   /api/auth/refresh

POST   /api/players                   # public registration (with photo upload, multipart)
GET    /api/players?tournamentId=     # admin list / filter
GET    /api/players/{id}              # admin or owning player
PUT    /api/players/{id}              # admin edit
DELETE /api/players/{id}              # admin soft-delete
GET    /api/players/me                # current player's own registration + team

POST   /api/tournaments               # admin CRUD
GET/PUT/DELETE /api/tournaments/{id}

POST   /api/teams                     # admin create
PUT/DELETE /api/teams/{id}
POST   /api/teams/{id}/members        # add player (registered or manual)
DELETE /api/teams/{id}/members/{pid}
PUT    /api/teams/{id}/captain
PUT    /api/teams/{id}/referee

POST   /api/draft/{tournamentId}/start
POST   /api/draft/{tournamentId}/pick     # {teamId, playerId}
GET    /api/draft/{tournamentId}/state    # board, available players, whose turn

POST   /api/schedule/{tournamentId}/generate-pools
POST   /api/schedule/{tournamentId}/generate-playoffs
GET    /api/schedule/{tournamentId}       # matches grouped by court/time
GET    /api/standings/{tournamentId}      # per-group standings
PUT    /api/matches/{id}/result           # set scores -> recompute standings/bracket
```

All non-public endpoints require JWT; admin-only endpoints check `ROLE_ADMIN`. Players may only read their own player record.

---

## 9. Testing Strategy

- **Backend unit:** services & algorithms (round-robin generation, court packing, snake-draft order, standings tiebreakers, duplicate detection) — pure logic, high coverage. JUnit 5.
- **Backend integration:** controllers via MockMvc with security; persistence via Testcontainers MySQL. Cover auth, registration duplicate (409), schedule generation.
- **Frontend unit:** form validation (Zod), key components, query hooks (mocked). Vitest + RTL.
- **Coverage target:** ≥ 70% on backend service layer; critical algorithms 100% branch where practical.
- Tests co-located / mirrored: BE `src/test/java/...`, FE `*.test.tsx` next to source.

---

## 10. Boundaries

- **Always:** validate inputs (DTO + Zod); run `mvnw verify` and `npm test` before committing; keep controllers thin; use migrations for every schema change; gitignore `uploads/` and secrets.
- **Ask first:** adding a new runtime dependency; changing the DB schema after initial migration ships; introducing WebSockets/real-time; any cloud/email integration; changing auth model.
- **Never:** commit secrets or a real DB password; return JPA entities from controllers; store passwords in plaintext; delete failing tests to go green; commit `node_modules`/`target`/`uploads`.

---

## 11. Success Criteria (testable)

1. A visitor opens the home page, registers (with photo, 2 positions, Canada default), and a duplicate phone/email in the same tournament is rejected with a clear 409 message.
2. The registered player sets a password, logs in, and sees their own registration details.
3. Admin creates a tournament (name/date/start time) and sees all registered players in a sortable list with edit/delete.
4. Admin designates 10 captains, runs the live draft (6 rounds, snake order, no double-picks), ending with 10 teams of 6.
5. Admin can alternatively build/edit teams manually, including adding a non-registered player and assigning a referee.
6. Admin clicks "Generate Pools" → two-group round-robin schedule appears across 4 courts, 08:00 start, 10-min breaks, no team double-booked in a slot.
7. Admin enters match results; standings update with correct tiebreakers.
8. Admin generates playoffs: top 2 per group → semis (A1–B2, B1–A2) → final (best of 3, 15-pt) + bronze.
9. A drafted player logs in and sees their full team roster and match schedule.
10. Player site and admin panel render with two visually distinct themes.

---

## 12. Resolved Decisions (were Open Questions)

> Stakeholder said "go ahead" without overriding — resolved with recommendations. All contradiction-prone values are **configurable per tournament** so none block implementation.

1. **Additional registration fields** — INCLUDED: emergency contact (name+phone), skill level, waiver checkbox (required), payment status. Gender + DOB OPTIONAL. ✅
2. **Pool match format** — Default **1 set to 25**, slot = 20-min play + 10-min break. Configurable via `poolSetsToWin`, `poolPointsPerSet`, `poolMatchDurationMinutes`. ✅
3. **Roster size** — Default **6 total incl. captain** = captain + 5 draft picks. Configurable: `targetRosterSize` (default 6) + `captainCountsInRoster` (default true). Draft rounds = `targetRosterSize - (captainCountsInRoster ? 1 : 0)`. ✅
4. **Number of teams/captains** — Data-driven; admin designates any number of captains (= number of teams). No fixed cap. ✅
5. **Referee** — Separate person, does **not** count toward the 6-player roster. May be a registered player flagged REFEREE or a manual entry. ✅

---
```
