import { useEffect, useState } from "react";
import type { SupportAgent, SupportCase } from "@/types/supportCase";
import { fetchAgents, fetchCases } from "@/data/mockApi";
import {
  getDashboardMetrics,
  type DashboardMetrics,
  type PriorityMetric,
  type WorkloadClass,
} from "@/lib/dashboardMetrics";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import "./dashboard.css";

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} as const;

const SPECIALTY_LABELS = {
  billing: "Billing",
  technical: "Technical",
  account: "Account",
} as const;

const WORKLOAD_LABELS: Record<WorkloadClass, string> = {
  available: "Available",
  busy: "Busy",
  overloaded: "Overloaded",
};

const WORKLOAD_BADGES: Record<WorkloadClass, "success" | "warning" | "danger"> = {
  available: "success",
  busy: "warning",
  overloaded: "danger",
};

const WORKLOAD_ORDER: WorkloadClass[] = ["available", "busy", "overloaded"];

function percent(value: number, max: number) {
  return max > 0 ? `${(value / max) * 100}%` : "0%";
}

function PriorityRow({ metric }: { metric: PriorityMetric }) {
  return (
    <li className="dashboard-rank-row">
      <span className="dashboard-rank-row__label">
        {PRIORITY_LABELS[metric.priority]}
      </span>
      <div className="dashboard-bar" aria-hidden="true">
        <div
          className={`dashboard-bar__fill dashboard-bar__fill--${metric.priority}`}
          style={{ width: percent(metric.count, 100) }}
        />
      </div>
      <span className="dashboard-rank-row__count">{metric.count}</span>
      <span className="dashboard-rank-row__note">{metric.openCount} open</span>
    </li>
  );
}

function DashboardContent({ metrics }: { metrics: DashboardMetrics }) {
  const maxCategoryOpen = Math.max(
    0,
    ...metrics.openByCategory.map((item) => item.openCount),
  );

  return (
    <div className="dashboard">
      <section className="dashboard__section" aria-labelledby="dashboard-tickets-heading">
        <h2 id="dashboard-tickets-heading" className="dashboard__heading">
          Ticket overview
        </h2>
        <div className="dashboard__kpis">
          <Card padding="md" className="dashboard-kpi">
            <span className="dashboard-kpi__label">Unassigned</span>
            <span className="dashboard-kpi__value">{metrics.unassignedCount}</span>
            <span className="dashboard-kpi__note">Across all statuses</span>
          </Card>
          <Card padding="md" className="dashboard-kpi">
            <span className="dashboard-kpi__label">High &amp; critical</span>
            <span className="dashboard-kpi__value">{metrics.highCriticalCount}</span>
            <span className="dashboard-kpi__note">
              {metrics.openHighCriticalCount} open
            </span>
          </Card>
          <Card padding="md" className="dashboard-kpi">
            <span className="dashboard-kpi__label">Total tickets</span>
            <span className="dashboard-kpi__value">{metrics.totalTickets}</span>
            <span className="dashboard-kpi__note">All statuses</span>
          </Card>
          <Card padding="md" className="dashboard-kpi">
            <span className="dashboard-kpi__label">By status</span>
            <dl className="dashboard-status-list">
              <div className="dashboard-status-row">
                <dt>Open</dt>
                <dd>{metrics.statusCounts.open}</dd>
              </div>
              <div className="dashboard-status-row">
                <dt>In progress</dt>
                <dd>{metrics.statusCounts["in-progress"]}</dd>
              </div>
              <div className="dashboard-status-row">
                <dt>Closed</dt>
                <dd>{metrics.statusCounts.closed}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </section>

      <div className="dashboard__grid">
        <Card padding="lg" className="dashboard-panel">
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Priority mix</h2>
            <span className="dashboard-panel__hint">All statuses</span>
          </div>
          <ul className="dashboard-rank-list">
            {metrics.priorityCounts.map((metric) => (
              <PriorityRow key={metric.priority} metric={metric} />
            ))}
          </ul>
        </Card>

        <Card padding="lg" className="dashboard-panel">
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Open tickets by category</h2>
            <span className="dashboard-panel__hint">Open only</span>
          </div>
          <ul className="dashboard-rank-list">
            {metrics.openByCategory.map((metric) => (
              <li key={metric.category} className="dashboard-rank-row">
                <span className="dashboard-rank-row__label">
                  {SPECIALTY_LABELS[metric.category]}
                </span>
                <div className="dashboard-bar" aria-hidden="true">
                  <div
                    className="dashboard-bar__fill"
                    style={{ width: percent(metric.openCount, maxCategoryOpen) }}
                  />
                </div>
                <span className="dashboard-rank-row__count">{metric.openCount}</span>
                <span className="dashboard-rank-row__note">open</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg" className="dashboard-panel dashboard-panel--wide">
          <div className="dashboard-panel__header">
            <h2 className="dashboard-panel__title">Agent workload</h2>
            <span className="dashboard-panel__hint">Open + in progress</span>
          </div>
          <div className="dashboard-workload-summary">
            {WORKLOAD_ORDER.map((workload) => (
              <Badge key={workload} variant={WORKLOAD_BADGES[workload]}>
                {WORKLOAD_LABELS[workload]}: {metrics.workloadTotals[workload]}
              </Badge>
            ))}
          </div>
          <ul className="dashboard-agent-list">
            {metrics.agentWorkloads.map(({ agent, activeTickets, workload }) => (
              <li key={agent.id} className="dashboard-agent">
                <div className="dashboard-agent__identity">
                  <span className="dashboard-agent__name">
                    {agent.firstName} {agent.lastName}
                  </span>
                  <span className="dashboard-agent__specialty">
                    {SPECIALTY_LABELS[agent.specialty]}
                  </span>
                </div>
                <span className="dashboard-agent__count">{activeTickets} active</span>
                <Badge variant={WORKLOAD_BADGES[workload]}>
                  {WORKLOAD_LABELS[workload]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [tickets, setTickets] = useState<SupportCase[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [dataState, setDataState] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    setDataState("loading");
    setErrorMessage("");

    Promise.all([fetchCases(), fetchAgents()])
      .then(([caseData, agentData]) => {
        if (!cancelled) {
          setTickets(caseData);
          setAgents(agentData);
          setDataState("ready");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDataState("error");
          setErrorMessage(
            err instanceof Error ? err.message : "An unexpected error occurred",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (dataState === "loading") {
    return (
      <div>
        <p>Loading...</p>
        <Spinner />
      </div>
    );
  }

  if (dataState === "error") {
    return (
      <div className="ticket-list-state">
        <p>Something went wrong.</p>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    );
  }

  return <DashboardContent metrics={getDashboardMetrics(tickets, agents)} />;
}
