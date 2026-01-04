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
      // ✅ include Cancel Requested in this tab
      const data = await maintenanceService.listTickets({ status: "Requested,Cancel Requested" });
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

  const create = useCallback(async (payload: MaintenanceTicketPayload) => {
    try {
      const result = await maintenanceService.createTicket(payload);
      await fetch();
    } catch (err: any) {
      console.error("Create error:", err);
      throw err;
    }
  }, [fetch]);

  return { tickets, loading, error, refetch: fetch, createTicket: create };
}