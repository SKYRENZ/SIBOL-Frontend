import { useState, useMemo } from "react";
import { useCompletedMaintenance } from "../../hooks/maintenance/useCompletedMaintenance";
import type { MaintenanceTicket } from "../../types/maintenance";
import { FaTable, FaThLarge } from 'react-icons/fa';
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { MaintenanceCard } from "./MaintenanceCard";
import EndlessScroll from "../common/EndlessScroll";
import Table from "../common/Table";

interface CompletedMaintenanceProps {
  onOpenForm: (mode: "completed", ticket: MaintenanceTicket) => void;
}

export const CompletedMaintenance: React.FC<CompletedMaintenanceProps> = ({
  onOpenForm,
}) => {
  const { tickets, loading, error } = useCompletedMaintenance();

  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

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

  // Priority order for sorting
  const priorityOrder: Record<string, number> = {
    'critical': 1,
    'urgent': 2,
    'mild': 3,
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

    // Sort by priority
    result.sort((a, b) => {
      const aPriority = (a.Priority || '').toLowerCase();
      const bPriority = (b.Priority || '').toLowerCase();
      const aOrder = priorityOrder[aPriority] ?? 999;
      const bOrder = priorityOrder[bPriority] ?? 999;
      return aOrder - bOrder;
    });

    return result;
  }, [tickets, searchQuery, activeFilters]);

  // Table columns definition
  const columns = [
    {
      key: 'Title',
      label: 'Title',
      render: (value: string) => (
        <span className="text-sibol-green font-medium">{value}</span>
      ),
    },
    {
      key: 'Priority',
      label: 'Priority',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'Completed_at',
      label: 'Completed Date',
      render: (value: string) => (
        <span className="text-sibol-green">
          {value
            ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, ticket: MaintenanceTicket) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenForm('completed', ticket);
          }}
          className="px-3 py-1 text-sm font-semibold rounded-full border transition-all duration-200 bg-[#355842] text-white border-[#2f5236] hover:bg-[#2e4a36]"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Toolbar: Search and Filter */}
      <div className="flex gap-3 mb-6 items-center justify-between">
        {/* Left Side: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search completed maintenance..."
          className="flex-1 max-w-2xl"
        />

        {/* Right Side: View Toggle and Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-full transition-all duration-200 border ${
              viewMode === 'table'
                ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
            }`}
            title="Table View"
          >
            <FaTable size={18} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-full transition-all duration-200 border ${
              viewMode === 'card'
                ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
            }`}
            title="Card View"
          >
            <FaThLarge size={18} />
          </button>

          <FilterPanel
            types={["maintenancePriorities"]}
            onFilterChange={setActiveFilters}
          />
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : (
          <Table
            columns={columns}
            data={filteredTickets}
            emptyMessage={searchQuery || activeFilters.length > 0 ? "No matching maintenance found" : "No completed maintenance found"}
            enablePagination={false}
            rowKey="Request_Id"
            hideSearch={true}
          />
        )
      ) : (
        <EndlessScroll
          hasMore={false}
          loading={loading}
          onLoadMore={() => {}}
          className="w-full"
        >
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
        </EndlessScroll>
      )}
    </div>
  );
};