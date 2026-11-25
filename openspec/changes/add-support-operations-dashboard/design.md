## Context

The Dashboard screen already exists in `src/app.tsx` and `Sidebar` but renders a "Dashboard — coming soon" placeholder. Tickets and agents are loaded through `src/data/mockApi.ts`, which returns arrays after a simulated 1200 ms delay. Tickets carry `status`, `priority`, `category`, and `agentId`; agents carry `specialty` but no capacity. See `proposal.md` for motivation and the spec for required behavior.

Constraints from the codebase:

- Plain function components and hooks; no router or data-fetching library.
- Plain CSS files imported by components; design tokens in `src/styles/tokens.css`.
- Existing `Card`, `Badge`, `Spinner` primitives and a shared loading/error pattern in `TicketList` and `AgentList`.
- No test runner is installed; `tsx` is available for running TypeScript directly.

## Goals / Non-Goals

**Goals:**

- Derive every metric from a single load of the ticket and agent arrays.
- Keep metric derivation pure and independently checkable.
- Reuse existing primitives and visual language so the Dashboard matches Tickets and Agents.
- Fit the summary in one viewport at common desktop widths, with panels stacking on narrow screens.

**Non-Goals:**

- Server-side aggregation, pagination, or changes to `mockApi`.
- Filters, drill-down navigation, or assigning work from the Dashboard.
- Trend charts or historical data.
- Adding an agent capacity field or changing the data generator.

## Decisions

### Pure metrics module

Add `src/lib/dashboardMetrics.ts` exporting one function that accepts the two arrays and returns the complete view model: status counts, unassigned count, priority counts, open-by-category ranking, per-agent workload records, and workload class totals. Components only render this result.

Rationale: keeps aggregation out of JSX, makes thresholds testable, and avoids repeated filtering in multiple components. Alternative: compute inside the component — simpler to start but hard to verify and easy to double-count closed tickets.

### Workload definition

Active load = assigned tickets whose status is `open` or `in-progress`. Unassigned tickets are excluded because no agent owns them. Classification thresholds: available 0-2, busy 3-5, overloaded 6+. With the current generator, active assigned counts range from 1 to 12, so all three classes appear with meaningful sizes.

Rationale: matches the user's framing of "available vs overloaded" without inventing capacity data. Alternative: add capacity to `SupportAgent` — more faithful to real staffing but changes data model and generator for a read-only dashboard.

Thresholds live as named constants in the metrics module so they can be tuned without touching components.

### Load both datasets with `Promise.all`

`Dashboard` calls `fetchCases()` and `fetchAgents()` concurrently, mirrors the existing `cancelled` flag cleanup, and renders three states: loading (`Spinner`), error (message plus existing `ticket-list-state` styling), and ready.

Rationale: avoids two sequential 1200 ms waits and matches existing screen behavior. Partial rendering is rejected because workload needs agents while ticket panels need cases; showing half a dashboard would be misleading.

### Layout and components

One `Dashboard` component under `src/components/dashboard.tsx` with a local `dashboard.css`, composed of small presentational pieces in the same file unless a piece is reused elsewhere:

1. Header with title and last-updated context is unnecessary; the top bar already frames the screen.
2. KPI row: unassigned, high + critical (with open subset), total tickets, and status breakdown. Status breakdown can be a compact list of three labelled counts rather than a fourth KPI.
3. Priority panel: four labelled rows with counts and proportional CSS bars using token colors; high and critical remain text-labelled.
4. Category panel: open counts per category as labelled horizontal bars, ordered descending.
5. Agent workload panel: class totals as badges, plus a list of every agent with name, specialty, active count, and a text classification badge, ordered descending by active count (ties by name).

Bars are decorative (`aria-hidden`) with adjacent numeric text; no chart dependency is added. Grid uses `auto-fit`/`minmax` so panels stack under ~768px, consistent with the existing responsive padding rule.

### Verification without a test runner

Add `src/lib/dashboardMetrics.test.ts` using `node:assert/strict` and small fixtures covering: closed tickets excluded from workload, unassigned excluded from workload, zero-active agent, threshold boundaries (2, 3, 5, 6), priority/status totals, and category ordering including a zero category. Run with `npx tsx src/lib/dashboardMetrics.test.ts`.

Rationale: proves the branch-heavy logic without adding Vitest or another dependency. Alternative: no check — rejected because threshold and status-scope mistakes are the main risk in this change.

## Risks / Trade-offs

- **Generated data changes on regeneration** → Metrics are computed at render time from whatever `db.json` contains; no hard-coded expected numbers in production code. Test fixtures are independent of the generator.
- **Thresholds are a judgment call, not real capacity** → Kept as named constants and a single classification function; a future capacity field can replace them without touching layout.
- **All-status totals can make pending work look smaller** → High/critical KPI shows the open subset explicitly, and the category panel is open-only, so urgent and pending work stays visible.
- **Duplicated fetch with other screens** → Acceptable for a mock app and consistent with existing per-screen fetching; caching or shared state is out of scope.
- **No automated browser test** → Manual `npm run build` plus the metrics check covers the logic and compilation; visual layout verified in `npm run dev`.
