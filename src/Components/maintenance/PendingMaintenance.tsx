import { useState, useMemo } from "react";
import CompletionConfirmModal from "./CompletionConfirmModal";
import CancelConfirmModal from "./CancelConfirmModal";

import { usePendingMaintenance } from "../../hooks/maintenance/usePendingMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

import { useAppSelector } from '../../store/hooks';
import { User } from "lucide-react";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { MaintenanceCard } from "./MaintenanceCard";

interface PendingMaintenanceProps {
  onOpenForm: (mode: 'pending', ticket: MaintenanceTicket) => void;
}

export const PendingMaintenance: React.FC<PendingMaintenanceProps> = ({
  onOpenForm,
}) => {
  const { tickets, loading, error, refetch } = usePendingMaintenance();
  const { user: reduxUser } = useAppSelector(state => state.auth);

  const [selectedTicketForCompletion, setSelectedTicketForCompletion] = useState<MaintenanceTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTicketForCancel, setSelectedTicketForCancel] = useState<MaintenanceTicket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const getPriorityColor = (priority: string | null | undefined) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p === 'mild') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string | null | undefined) => {
    const s = (status || '').toLowerCase();
    if (s === 'on-going') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'for verification') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancel requested') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleCompleteRequest = async () => {
    if (!selectedTicketForCompletion) return;

    const requestId = selectedTicketForCompletion.Request_Id ?? selectedTicketForCompletion.request_id;
    if (!requestId) return;

    try {
      setIsSubmitting(true);

      const staffId = reduxUser?.Account_id ?? reduxUser?.account_id;

      if (staffId) {
        await maintenanceService.verifyCompletion(requestId, staffId);
      }

      setSelectedTicketForCompletion(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to complete:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedTicketForCancel) return;

    const requestId = selectedTicketForCancel.Request_Id ?? selectedTicketForCancel.request_id;
    if (!requestId) return;

    try {
      setIsCancelling(true);

      const actorId = reduxUser?.Account_id ?? reduxUser?.account_id;
      if (!actorId) throw new Error("actor_account_id not found");

      await maintenanceService.cancelTicket(requestId, actorId);

      setSelectedTicketForCancel(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to cancel:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ticket) =>
        ticket.Title?.toLowerCase().includes(query) ||
        ticket.Priority?.toLowerCase().includes(query) ||
        ticket.Status?.toLowerCase().includes(query) ||
        ticket.AssignedOperatorName?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((ticket) =>
        activeFilters.includes(ticket.Priority || '') ||
        activeFilters.includes(ticket.Status || '')
      );
    }

    return result;
  }, [tickets, searchQuery, activeFilters]);

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Toolbar: Search and Filter */}
      <div className="flex gap-3 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search pending maintenance..."
          className="flex-1"
        />
        <FilterPanel
          types={["maintenancePriorities", "maintenanceStatuses"]}
          onFilterChange={setActiveFilters}
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {searchQuery || activeFilters.length > 0 ? "No matching maintenance found" : "No pending maintenance found"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <MaintenanceCard
              key={ticket.Request_Id ?? ticket.request_id}
              ticket={ticket}
              mode="pending"
              onViewDetails={(ticket) => onOpenForm('pending', ticket)}
              onComplete={setSelectedTicketForCompletion}
              onCancel={setSelectedTicketForCancel}
            />
          ))}
        </div>
      )}

      <CompletionConfirmModal
        isOpen={!!selectedTicketForCompletion}
        onClose={() => setSelectedTicketForCompletion(null)}
        onConfirm={handleCompleteRequest}
        isLoading={isSubmitting}
      />

      <CancelConfirmModal
        isOpen={!!selectedTicketForCancel}
        onClose={() => setSelectedTicketForCancel(null)}
        onConfirm={handleCancelRequest}
        isLoading={isCancelling}
        mode="cancel"
      />
    </div>
  );
};