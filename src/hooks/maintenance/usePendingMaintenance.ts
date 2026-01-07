import { useState, useEffect, useCallback } from "react";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

export function usePendingMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Pending Maintenance includes Cancel Requested
      const data = await maintenanceService.listTickets({
        status: "On-going,For Verification,Cancel Requested",
      });

      setTickets(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch pending maintenance tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refetch: fetchTickets };
}