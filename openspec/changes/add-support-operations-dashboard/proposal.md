## Why

Support managers currently have no single view of overall operations: answering "how many tickets are unassigned, how much high-priority work is pending, which categories are piling up, and who is overloaded" requires reading the ticket and agent lists and counting by hand. The Dashboard navigation item already exists but only renders a "coming soon" placeholder.

## What Changes

- Replace the Dashboard placeholder with a read-only operations summary.
- Show headline totals: unassigned tickets, high/critical tickets, total tickets, and the status breakdown (open, in-progress, closed).
- Show the priority mix across all statuses, including how many high and critical tickets are still open.
- Rank categories by their count of open tickets.
- Summarize agent workload from active assigned tickets and flag agents as available, busy, or overloaded.
- Load ticket and agent data through the existing mock API and handle loading and error states consistently with the other screens.
- No data model, API, or navigation changes.

## Capabilities

### New Capabilities
- `support-operations-dashboard`: Read-only overview of ticket demand, priority and category distribution, and support agent workload.

### Modified Capabilities
<!-- None: existing ticket and agent behavior is unchanged. -->

## Impact

- `src/app.tsx`: Dashboard screen renders the new view instead of the placeholder.
- New dashboard components and styles under `src/components/` and a pure metrics helper under `src/lib/`.
- Reuses `fetchCases` / `fetchAgents`, existing `Card`, `Badge`, `Spinner`, design tokens, and CSS-file conventions.
- No dependency, data shape, or API changes.
