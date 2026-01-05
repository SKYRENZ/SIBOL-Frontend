import { useCallback, useEffect, useState } from "react";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket, MaintenanceTicketPayload } from "../../types/maintenance";

export function useRequestMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Request Maintenance = Requested + Cancelled
      const data = await maintenanceService.listTickets({ status: "Requested,Cancelled" });
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (payload: MaintenanceTicketPayload) => {
      const result = await maintenanceService.createTicket(payload);
      await fetch();
      return result;
    },
    [fetch]
  );

  return { tickets, loading, error, refetch: fetch, createTicket: create };
}