import assert from "node:assert/strict";
import type { SupportAgent, SupportCase } from "@/types/supportCase";
import { classifyWorkload, getDashboardMetrics } from "./dashboardMetrics";

function makeAgent(id: string, firstName: string): SupportAgent {
  return {
    id,
    firstName,
    lastName: "Agent",
    email: `${id}@supporthub.com`,
    specialty: "billing",
  };
}

function makeCase(overrides: Partial<SupportCase> & { id: string }): SupportCase {
  return {
    customer: "Customer",
    customerEmail: "customer@example.com",
    customerTier: "standard",
    subject: "Subject",
    status: "open",
    priority: "low",
    agentId: null,
    category: "billing",
    description: "Description",
    tags: [],
    createdAt: new Date(0),
    updatedAt: new Date(0),
    deadline: new Date(0),
    ...overrides,
  };
}

const agents = [
  makeAgent("a", "Ada"),
  makeAgent("b", "Bob"),
  makeAgent("c", "Cleo"),
  makeAgent("d", "Dana"),
  makeAgent("e", "Eli"),
];

const cases = [
  makeCase({ id: "U1", priority: "critical" }),
  makeCase({ id: "U2", priority: "high", category: "technical" }),
  makeCase({ id: "A1", agentId: "a", priority: "medium", category: "account" }),
  makeCase({ id: "A2", agentId: "a", status: "in-progress", category: "account" }),
  makeCase({ id: "A3", agentId: "a", status: "closed", priority: "critical", category: "account" }),
  makeCase({ id: "A4", agentId: "a", status: "closed", priority: "high", category: "account" }),
  makeCase({ id: "B1", agentId: "b", category: "technical" }),
  makeCase({ id: "B2", agentId: "b", category: "technical" }),
  makeCase({ id: "B3", agentId: "b", category: "technical" }),
  makeCase({ id: "C1", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "C2", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "C3", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "C4", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "C5", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "C6", agentId: "c", status: "in-progress", priority: "medium" }),
  makeCase({ id: "D1", agentId: "d", status: "closed" }),
  makeCase({ id: "E1", agentId: "e", priority: "critical" }),
  makeCase({ id: "E2", agentId: "e", priority: "critical" }),
  makeCase({ id: "E3", agentId: "e", priority: "critical" }),
  makeCase({ id: "E4", agentId: "e", priority: "critical" }),
  makeCase({ id: "E5", agentId: "e", priority: "critical" }),
];

const metrics = getDashboardMetrics(cases, agents);

assert.equal(metrics.totalTickets, 21);
assert.deepEqual(metrics.statusCounts, { open: 11, "in-progress": 7, closed: 3 });
assert.equal(
  metrics.statusCounts.open + metrics.statusCounts["in-progress"] + metrics.statusCounts.closed,
  metrics.totalTickets,
);

assert.equal(metrics.unassignedCount, 2);

assert.deepEqual(
  metrics.priorityCounts.map(({ priority, count, openCount }) => ({ priority, count, openCount })),
  [
    { priority: "low", count: 5, openCount: 3 },
    { priority: "medium", count: 7, openCount: 1 },
    { priority: "high", count: 2, openCount: 1 },
    { priority: "critical", count: 7, openCount: 6 },
  ],
);
assert.equal(
  metrics.priorityCounts.reduce((sum, entry) => sum + entry.count, 0),
  metrics.totalTickets,
);
assert.equal(metrics.highCriticalCount, 9);
assert.equal(metrics.openHighCriticalCount, 7);

assert.deepEqual(metrics.openByCategory, [
  { category: "billing", openCount: 6 },
  { category: "technical", openCount: 4 },
  { category: "account", openCount: 1 },
]);

assert.deepEqual(metrics.workloadTotals, { available: 2, busy: 2, overloaded: 1 });
assert.deepEqual(
  metrics.agentWorkloads.map(({ agent, activeTickets, workload }) => ({
    id: agent.id,
    activeTickets,
    workload,
  })),
  [
    { id: "c", activeTickets: 6, workload: "overloaded" },
    { id: "e", activeTickets: 5, workload: "busy" },
    { id: "b", activeTickets: 3, workload: "busy" },
    { id: "a", activeTickets: 2, workload: "available" },
    { id: "d", activeTickets: 0, workload: "available" },
  ],
);

assert.equal(classifyWorkload(0), "available");
assert.equal(classifyWorkload(2), "available");
assert.equal(classifyWorkload(3), "busy");
assert.equal(classifyWorkload(5), "busy");
assert.equal(classifyWorkload(6), "overloaded");

const zeroCategoryMetrics = getDashboardMetrics(
  [makeCase({ id: "Z1", category: "technical" })],
  [],
);
assert.deepEqual(zeroCategoryMetrics.openByCategory, [
  { category: "technical", openCount: 1 },
  { category: "billing", openCount: 0 },
  { category: "account", openCount: 0 },
]);

console.log("dashboardMetrics checks passed");
