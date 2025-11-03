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
      const data = await maintenanceService.listTickets({ status: "Requested" });
      console.log("Fetched tickets:", data); // Debug log
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Fetch error:", err); // Debug log
      setError(err.message || "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (
      payload: MaintenanceTicketPayload,
      options?: { attachment?: File | null; attachmentFolder?: string }
    ) => {
      try {
        const result = await maintenanceService.createTicket(payload, options);
        console.log("Created ticket:", result); // Debug log
        await fetch(); // Refetch to show new ticket
      } catch (err: any) {
        console.error("Create error:", err); // Debug log
        throw err;
      }
    },
    [fetch]
  );

  return { tickets, loading, error, refetch: fetch, createTicket: create };
}