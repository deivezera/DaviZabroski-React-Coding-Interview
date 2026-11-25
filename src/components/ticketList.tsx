import { useState, useEffect } from "react";
import type { SupportCase } from "@/types/supportCase";
import { fetchCases } from "@/data/mockApi";
import { TicketCard } from "./ticketCard";
import { Spinner } from "./ui/spinner";

interface TicketListProps {
  onSelectCase: (caseItem: SupportCase) => void;
}

const PRIOTITY_MAP: Record<string, number> = { 
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

export function TicketList({ onSelectCase }: TicketListProps) {
  const [tickets, setTickets] = useState<SupportCase[]>([]);
  const [dataState, setDataState] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const activeTickets = tickets.filter((ticket: SupportCase) => ticket.status !== 'closed')
  
  const sortedTickeds = activeTickets.sort((a: SupportCase,b: SupportCase) => {

    if(PRIOTITY_MAP[a.priority] < PRIOTITY_MAP[b.priority]) {
      return 1
    }  
    return -1
  })
  useEffect(() => {
    let cancelled = false;

    setDataState("loading");
    setErrorMessage("");

    fetchCases()
      .then((data) => {
        if (!cancelled) {
          setTickets(data);
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
    return <div>
      <p>Loading...</p>
      <Spinner />
    </div>;
  }

  if (dataState === "error" || tickets.length === 0) {
    return (
      <div className="ticket-list-state">
        <p>Something went wrong.</p>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="ticket-list">
      {sortedTickeds.map((supportCase) => (
        <TicketCard key={supportCase.id} supportCase={supportCase} onSelect={onSelectCase} />
      ))}
    </div>
  );
}
