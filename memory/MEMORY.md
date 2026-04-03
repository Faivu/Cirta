## Workflow Preferences
- **One thing at a time per git commit.** Don't bundle unrelated changes. If the user asks for multiple things, implement and commit them separately.
- User may forget this rule — gently remind them if they're asking for too many changes at once before committing.
- User uses voice-to-text so naming in messages may vary.

## Project: Cirta (Symfony + React)
- Located at `/Users/safir/VScode/Projects/Symfony/Cirta`
- Symfony 8 backend, React 19 frontend, Webpack Encore
- Google OAuth authentication (KnpU OAuth2 bundle)
- Key features: Pomodoro/Flowtime/TimeBlocking sessions, Todo list, Calendar
- Task entity has both `scheduleDate` and `deadline` fields (kept separate)

## Architecture: UUIDs
- All entities (User, Task, Event, Session and subclasses) use UUIDv7 (`binary(16)` in MySQL)
- `getId()` returns `?string` (RFC4122 format) — pragmatic choice for JSON APIs
- **Known tech debt:** Should eventually refactor to use Symfony Serializer, with `getId()` returning `?Uuid` and controllers using `$this->json($entity)` instead of manual array building. User is aware and will tackle this when learning the Serializer.
- **Critical:** When using Doctrine QueryBuilder with UUID columns, always pass explicit type: `->setParameter('user', $user->getId(), 'uuid')`. Doctrine does NOT auto-detect the `uuid` DBAL type for parameter binding — without it, queries return 0 results.
- Route `{id}` params must be `string`, not `int`.

## Architecture: Sessions
- `Session` is abstract with JOINED inheritance (`Pomodoro`, `Flowtime`, `TimeBlocking`)
- `PomodoroService` handles all Pomodoro business logic (only strategy fully implemented)
- `SessionStrategy` interface exists but is only implemented by `PomodoroService` — Flowtime and TimeBlocking are handled inline in the controller (tech debt)

## Logbook Summaries
- See `feedback_logbook_summary.md` for the workflow
- Last save point: `project_logbook_savepoint.md` — currently 2026-03-21

## Rename TopBar → MainBar (Codebase Task)
- See `project_rename_topbar.md` — rename component, imports, CSS classes, and `TOPBAR_WIDTH` constant

## Time Blocking Redesign (Priority)
- See `project_time_blocking_redesign.md` — brown color, hour/minute stepper input, wall-clock end-time behavior under consideration

## Pending Work (next session)
1. **Implement FlowtimeService and TimeBlockingService** implementing `SessionStrategy`, and refactor `SessionController` to use them instead of inline logic.
2. **Fix LSP violation in `SessionStrategy` interface:** `pauseSession` and `resumeSession` are Pomodoro-only but sit on the base interface. Fix by extracting a `PausableSessionStrategy` sub-interface (or removing them from the base interface), so Flowtime and TimeBlocking don't have to implement no-op/throw stubs.

## Deployment
- Railway (production), FrankenPHP + Caddy
- Dockerfile uses `doctrine:schema:update --force` on startup
- Login page CSS must be registered as Encore entry (`addEntry('login', ...)`) and loaded via `encore_entry_link_tags('login')`
