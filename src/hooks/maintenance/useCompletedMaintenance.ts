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
      console.debug('fetching completed tickets...');
      const data = await maintenanceService.listTickets({ status: "Completed" });
      setTickets(data);
      console.debug('completed tickets received', data?.length);
    } catch (err: any) {
      console.error('useCompletedMaintenance fetch error', err);
      setError(err.message || "Failed to load completed maintenance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const onRefresh = () => fetch();
    window.addEventListener('maintenance:refresh', onRefresh);
    return () => window.removeEventListener('maintenance:refresh', onRefresh);
  }, [fetch]);

  return { tickets, loading, error, refetch: fetch };
}