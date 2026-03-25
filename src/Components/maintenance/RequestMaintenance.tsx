import { useState, useMemo } from "react";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";
import CancelConfirmModal from "./CancelConfirmModal";
import DeletedRequestsModal from "./DeletedRequestsModal";
import { useAppSelector } from '../../store/hooks';
import { Trash2 } from "lucide-react";
import { FaTable, FaThLarge } from 'react-icons/fa';
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { MaintenanceCard } from "./MaintenanceCard";
import EndlessScroll from "../common/EndlessScroll";
import Table from "../common/Table";

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
  onOpenCreateForm: () => void;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({
  onOpenForm,
  onOpenCreateForm,
}) => {
  const { tickets, loading, error, refetch } = useRequestMaintenance();
  const { user: reduxUser } = useAppSelector(state => state.auth);

  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState<MaintenanceTicket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ NEW: deleted requests modal state
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [deletedTickets, setDeletedTickets] = useState<MaintenanceTicket[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

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

  const handleConfirmDelete = async (reason?: string) => {
    if (!selectedTicketForDelete) return;

    const requestId = selectedTicketForDelete.Request_Id ?? selectedTicketForDelete.request_id;
    if (!requestId) return;

    const trimmed = (reason ?? "").trim();
    if (!trimmed) {
      alert("Reason is required.");
      return;
    }

    try {
      setIsDeleting(true);

      const actorId = reduxUser?.Account_id ?? reduxUser?.account_id;
      if (!actorId) throw new Error("actor_account_id not found");

      await maintenanceService.deleteTicket(requestId, actorId, trimmed);
      setSelectedTicketForDelete(null);
      await refetch();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeletedModal = async () => {
    setIsDeletedModalOpen(true);
    setLoadingDeleted(true);
    setDeletedError(null);
    try {
      const rows = await maintenanceService.listDeletedTickets();
      setDeletedTickets(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setDeletedTickets([]);
      setDeletedError(err?.response?.data?.message || err?.message || "Failed to load deleted requests");
    } finally {
      setLoadingDeleted(false);
    }
  };

  const closeDeletedModal = () => {
    setIsDeletedModalOpen(false);
  };

  // Priority order for sorting
  const priorityOrder: Record<string, number> = {
    'critical': 1,
    'urgent': 2,
    'mild': 3,
  };

  // Filter, search, and sort tickets
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ticket) =>
        ticket.Title?.toLowerCase().includes(query) ||
        ticket.Priority?.toLowerCase().includes(query) ||
        ticket.Status?.toLowerCase().includes(query)
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
      key: 'Due_date',
      label: 'Due Date',
      render: (value: string) => (
        <span className="text-sibol-green">
          {value
            ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Not set'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, ticket: MaintenanceTicket) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenForm('assign', ticket);
            }}
            className="px-3 py-1 text-sm font-semibold rounded-full border transition-all duration-200 bg-[#355842] text-white border-[#2f5236] hover:bg-[#2e4a36]"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicketForDelete(ticket);
            }}
            disabled={isDeleting}
            className="px-3 py-1 text-sm font-semibold rounded-full border transition-all duration-200 bg-red-600 text-white border-red-500 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Toolbar */}
      <div className="flex gap-4 mb-6 items-center justify-between">
        {/* Left Side: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search maintenance requests..."
          className="flex-1 max-w-2xl"
        />

        {/* Right Side: Buttons */}
        <div className="flex gap-3 items-center">
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

          <button
            onClick={onOpenCreateForm}
            className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md shadow-sm hover:bg-[#2e4a36] transition whitespace-nowrap"
          >
            New Maintenance Request
          </button>

          <FilterPanel
            types={["maintenancePriorities"]}
            onFilterChange={setActiveFilters}
          />

          <button
            type="button"
            onClick={openDeletedModal}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition"
            title="View deleted requests"
            aria-label="View deleted requests"
          >
            <Trash2 size={18} className="text-gray-700" />
          </button>
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
            emptyMessage={searchQuery || activeFilters.length > 0 ? "No matching requests found" : "No maintenance requests found"}
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
              {searchQuery || activeFilters.length > 0 ? "No matching requests found" : "No maintenance requests found"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map((ticket) => (
                <MaintenanceCard
                  key={ticket.Request_Id ?? ticket.request_id}
                  ticket={ticket}
                  mode="request"
                  onViewDetails={(ticket) => onOpenForm('assign', ticket)}
                  onDelete={setSelectedTicketForDelete}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
        </EndlessScroll>
      )}

      <CancelConfirmModal
        isOpen={!!selectedTicketForDelete}
        onClose={() => setSelectedTicketForDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        mode="delete"
      />

      <DeletedRequestsModal
        isOpen={isDeletedModalOpen}
        onClose={closeDeletedModal}
        data={deletedTickets}
        loading={loadingDeleted}
        error={deletedError}
      />
    </div>
  );
};