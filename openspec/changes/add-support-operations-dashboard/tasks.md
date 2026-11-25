## 1. Metrics

- [x] 1.1 Create `src/lib/dashboardMetrics.ts` with a pure function that returns status counts, total tickets, unassigned count, priority counts (all statuses) and open high/critical count, open tickets per category sorted descending, per-agent workload from open + in-progress assigned tickets, and workload class totals; verify it compiles with `npx tsc -b`.
- [x] 1.2 Add `src/lib/dashboardMetrics.test.ts` with assert-based fixtures for closed tickets excluded from workload, unassigned tickets excluded, zero-active agent, thresholds at 2/3/5/6, priority/status sums, and category ordering with a zero-count category; verify with `npx tsx src/lib/dashboardMetrics.test.ts`.

## 2. Dashboard UI

- [x] 2.1 Create `src/components/dashboard.tsx` that fetches cases and agents concurrently, renders `Spinner` while loading, the existing error markup on failure, and calls the metrics helper only when both datasets are ready; verify all three states in `npm run dev`.
- [x] 2.2 Render the KPI section (unassigned, high + critical with open subset, total, and open/in-progress/closed breakdown) and the priority panel using existing `Card`/`Badge` with text labels alongside proportional bars; verify counts against the browser's current `db.json` totals.
- [x] 2.3 Render the open-tickets-by-category panel ordered highest first, including categories with zero open tickets; verify all three categories appear with correct counts.
- [x] 2.4 Render the agent workload section with available/busy/overloaded totals and every agent's name, specialty, active count, and text classification, ordered by active count descending then name; verify an agent with zero active tickets would show as available and that closed tickets are absent from counts.
- [x] 2.5 Add `src/components/dashboard.css` using existing tokens, grid panels that stack at 768px, and no color-only status encoding; verify layout at desktop and narrow widths.

## 3. Integration and verification

- [x] 3.1 Replace the Dashboard placeholder in `src/app.tsx` with `<Dashboard />` and verify sidebar navigation still reaches Tickets and Agents unchanged.
- [x] 3.2 Run `npm run lint` and `npm run build`; verify both pass and `npx tsx src/lib/dashboardMetrics.test.ts` still passes.
