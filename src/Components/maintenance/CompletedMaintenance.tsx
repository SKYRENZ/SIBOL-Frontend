import { useState, useMemo } from "react";
import { useCompletedMaintenance } from "../../hooks/maintenance/useCompletedMaintenance";
import type { MaintenanceTicket } from "../../types/maintenance";
import { Calendar, CheckCircle } from "lucide-react";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { MaintenanceCard } from "./MaintenanceCard";

interface CompletedMaintenanceProps {
  onOpenForm: (mode: "completed", ticket: MaintenanceTicket) => void;
}

export const CompletedMaintenance: React.FC<CompletedMaintenanceProps> = ({
  onOpenForm,
}) => {
  const { tickets, loading, error } = useCompletedMaintenance();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const getPriorityColor = (priority: string | null | undefined) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p === 'mild') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ticket) =>
        ticket.Title?.toLowerCase().includes(query) ||
        ticket.Priority?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((ticket) =>
        activeFilters.includes(ticket.Priority || '')
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
          placeholder="Search completed maintenance..."
          className="flex-1"
        />
        <FilterPanel
          types={["maintenancePriorities"]}
          onFilterChange={setActiveFilters}
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {searchQuery || activeFilters.length > 0 ? "No matching maintenance found" : "No completed maintenance found"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <MaintenanceCard
              key={ticket.Request_Id ?? ticket.request_id}
              ticket={ticket}
              mode="completed"
              onViewDetails={(ticket) => onOpenForm('completed', ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
};