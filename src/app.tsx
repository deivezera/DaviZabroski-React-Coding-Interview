import { ReactNode, useState } from "react";
import { TopBar } from "./components/layout/topBar";
import { Sidebar, type Screen } from "./components/layout/sidebar";
import { TicketList } from "./components/ticketList";
import { AgentList } from "./components/agentList";
import { AssignScreen } from "./components/assignScreen";
import { Dashboard } from "./components/dashboard";
import type { SupportCase } from "./types/supportCase";
import "./components/layout/appShell.css";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);

  function handleSelectCase(supportCase: SupportCase) {
    setSelectedCase(supportCase);
  }

  function handleNavigate(screen: Screen) {
    setSelectedCase(null);
    setActiveScreen(screen);
  }

  const screenMap: Record<string, ReactNode> = {
    dashboard: <Dashboard />,
    tickets: selectedCase ? (
      <AssignScreen supportCase={selectedCase} />
    ) : (<TicketList onSelectCase={handleSelectCase} />),
    agents: (<AgentList/>)
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-shell__body">
        <Sidebar activeScreen={activeScreen} onNavigate={handleNavigate} />
        <main className="app-shell__main">{screenMap[activeScreen]}</main>
      </div>
    </div>
  );
}
