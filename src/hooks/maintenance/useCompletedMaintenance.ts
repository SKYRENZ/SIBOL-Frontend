import { useCallback, useEffect, useState } from "react";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

export function useCompletedMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.listTickets({ status: "Completed" });
      setTickets(data);
    } catch (err: any) {
      setError(err.message || "Failed to load completed maintenance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tickets, loading, error, refetch: fetch };
}