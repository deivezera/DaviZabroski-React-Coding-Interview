import type {
  CaseCategory,
  CasePriority,
  CaseStatus,
  SupportAgent,
  SupportCase,
} from "@/types/supportCase";

export type WorkloadClass = "available" | "busy" | "overloaded";

export interface PriorityMetric {
  priority: CasePriority;
  count: number;
  openCount: number;
}

export interface CategoryMetric {
  category: CaseCategory;
  openCount: number;
}

export interface AgentWorkload {
  agent: SupportAgent;
  activeTickets: number;
  workload: WorkloadClass;
}

export interface DashboardMetrics {
  totalTickets: number;
  statusCounts: Record<CaseStatus, number>;
  unassignedCount: number;
  priorityCounts: PriorityMetric[];
  highCriticalCount: number;
  openHighCriticalCount: number;
  openByCategory: CategoryMetric[];
  workloadTotals: Record<WorkloadClass, number>;
  agentWorkloads: AgentWorkload[];
}

const STATUSES: CaseStatus[] = ["open", "in-progress", "closed"];
const PRIORITIES: CasePriority[] = ["low", "medium", "high", "critical"];
const CATEGORIES: CaseCategory[] = ["billing", "technical", "account"];

const BUSY_MIN = 3;
const OVERLOADED_MIN = 6;

export function classifyWorkload(activeTickets: number): WorkloadClass {
  if (activeTickets >= OVERLOADED_MIN) return "overloaded";
  if (activeTickets >= BUSY_MIN) return "busy";
  return "available";
}

function countBy<T extends string>(items: T[], values: readonly T[]): Record<T, number> {
  const counts = Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;
  for (const item of items) {
    counts[item] += 1;
  }
  return counts;
}

export function getDashboardMetrics(
  cases: SupportCase[],
  agents: SupportAgent[],
): DashboardMetrics {
  const statusCounts = countBy(
    cases.map((supportCase) => supportCase.status),
    STATUSES,
  );

  const priorityCounts = PRIORITIES.map((priority) => {
    const matching = cases.filter((supportCase) => supportCase.priority === priority);
    return {
      priority,
      count: matching.length,
      openCount: matching.filter((supportCase) => supportCase.status === "open").length,
    };
  });

  const highCritical = cases.filter(
    (supportCase) =>
      supportCase.priority === "high" || supportCase.priority === "critical",
  );

  const openByCategory = CATEGORIES.map((category) => ({
    category,
    openCount: cases.filter(
      (supportCase) =>
        supportCase.category === category && supportCase.status === "open",
    ).length,
  })).sort((a, b) => b.openCount - a.openCount);

  const activeByAgent = new Map<string, number>();
  for (const supportCase of cases) {
    if (
      supportCase.agentId !== null &&
      (supportCase.status === "open" || supportCase.status === "in-progress")
    ) {
      activeByAgent.set(
        supportCase.agentId,
        (activeByAgent.get(supportCase.agentId) ?? 0) + 1,
      );
    }
  }

  const agentWorkloads = agents
    .map((agent) => {
      const activeTickets = activeByAgent.get(agent.id) ?? 0;
      return { agent, activeTickets, workload: classifyWorkload(activeTickets) };
    })
    .sort(
      (a, b) =>
        b.activeTickets - a.activeTickets ||
        `${a.agent.firstName} ${a.agent.lastName}`.localeCompare(
          `${b.agent.firstName} ${b.agent.lastName}`,
        ),
    );

  const workloadTotals: Record<WorkloadClass, number> = {
    available: 0,
    busy: 0,
    overloaded: 0,
  };
  for (const entry of agentWorkloads) {
    workloadTotals[entry.workload] += 1;
  }

  return {
    totalTickets: cases.length,
    statusCounts,
    unassignedCount: cases.filter((supportCase) => supportCase.agentId === null).length,
    priorityCounts,
    highCriticalCount: highCritical.length,
    openHighCriticalCount: highCritical.filter(
      (supportCase) => supportCase.status === "open",
    ).length,
    openByCategory,
    workloadTotals,
    agentWorkloads,
  };
}
