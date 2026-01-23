import React, { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import Header from "../Components/Header";
import Tabs from "../Components/common/Tabs";
import SearchBar from "../Components/common/SearchBar";
import FilterPanel from "../Components/common/filterPanel";
import { RequestMaintenance } from "../Components/maintenance/RequestMaintenance";
import { PendingMaintenance } from "../Components/maintenance/PendingMaintenance";
import { CompletedMaintenance } from "../Components/maintenance/CompletedMaintenance";
import MaintenanceForm from "../Components/maintenance/MaintenanceForm";
import * as maintenanceService from "../services/maintenanceService";
import type { MaintenanceTicket } from "../types/maintenance";

// ✅ NEW
import { Trash2 } from "lucide-react";
import DeletedRequestsModal from "../Components/maintenance/DeletedRequestsModal";

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Request Maintenance");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setSelectedFilters] = useState<string[]>([]);
  const [createdByAccountId, setCreatedByAccountId] = useState<number | null>(null);
  
  // State for the modal, lifted up to this parent component
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'assign' | 'pending' | 'completed'>('create'); // ✅ add completed
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Read user from Redux instead of localStorage
  const reduxUser = useAppSelector((state) => state.auth.user);
  
  // ✅ NEW: deleted requests modal state
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [deletedTickets, setDeletedTickets] = useState<MaintenanceTicket[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

  useEffect(() => {
    // derive account id from redux user; do NOT default to 1 (avoid accidental wrong actor)
    const accountId = reduxUser?.Account_id ?? reduxUser?.account_id ?? null;
    setCreatedByAccountId(accountId);
  }, [reduxUser]);

  const handleOpenForm = (
    mode: 'create' | 'assign' | 'pending' | 'completed', // ✅ add completed
    ticket: MaintenanceTicket | null = null
  ) => {
    setFormMode(mode);
    setSelectedTicket(ticket);
    setIsFormOpen(true);
    setSubmitError(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTicket(null);
    setSubmitError(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setSubmitError(null);
      const requestId = selectedTicket?.Request_Id || selectedTicket?.request_id;

      if (formMode === 'create') {
        if (!createdByAccountId) throw new Error('Creator account not available. Please sign in / reload.');
        // Create ticket WITHOUT attachments first
        const ticket = await maintenanceService.createTicket({
          title: formData.title,
          details: formData.issue,
          priority: formData.priority,
          created_by: createdByAccountId,
          due_date: formData.dueDate || null,
        });

        // Then upload attachments if any
        if (formData.files && formData.files.length > 0) {
          const newRequestId = ticket.Request_Id || ticket.request_id;
          if (newRequestId) {
            await Promise.all(
              formData.files.map((file: File) =>
                maintenanceService.uploadAttachment(newRequestId, createdByAccountId!, file)
              )
            );
          }
        }

      } else if (formMode === 'assign') {
        if (!requestId) throw new Error('Request ID not found');

        const staffId = reduxUser?.Account_id ?? reduxUser?.account_id;
        if (!staffId) throw new Error('Staff account ID not found');

        const assignToId = formData.assignedTo ? parseInt(formData.assignedTo, 10) : null;

        // ✅ send edited priority + due date
        await maintenanceService.acceptAndAssign(
          requestId,
          staffId,
          assignToId,
          formData.priority || null,
          formData.dueDate || null
        );

      } else if (formMode === 'pending') {
        // ✅ FIX: Check if requestId exists before uploading attachments
        if (formData.files && formData.files.length > 0) {
          if (!requestId) {
            throw new Error('Request ID not found');
          }
          
          await Promise.all(
            formData.files.map((file: File) =>
              maintenanceService.uploadAttachment(requestId, createdByAccountId!, file)
            )
          );
        }
      }
      
      handleCloseForm();
      // avoid full reload (loses app state). emit refresh event so hooks re-fetch.
      window.dispatchEvent(new Event('maintenance:refresh'));
      // close modal / UI already handled by handleCloseForm
    } catch (err: any) {
      console.error("Form submission error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit form";
      setSubmitError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const tabsConfig = useMemo(
    () => [
      { id: "Request Maintenance", label: "Request Maintenance" },
      { id: "Pending Maintenance", label: "Pending Maintenance" },
      { id: "Complete Maintenance", label: "Complete Maintenance" },
    ],
    []
  );

  const handleOpenCompletedForm = (mode: 'completed', ticket: MaintenanceTicket) => {
    // ✅ open as completed, not pending
    handleOpenForm('completed', ticket);
  };

  const renderActiveTab = () => {
    if (createdByAccountId === null) return <p>Loading...</p>;

    switch (activeTab) {
      case "Pending Maintenance":
        return <PendingMaintenance onOpenForm={handleOpenForm} />;

      case "Complete Maintenance":
        return <CompletedMaintenance onOpenForm={handleOpenCompletedForm} />;

      default:
        return (
          <RequestMaintenance
            onOpenForm={handleOpenForm as (mode: "assign", ticket: MaintenanceTicket) => void}
          />
        );
    }
  };

  const getFilterTypesByTab = (tab: string): string[] => {
    switch(tab) {
      case 'Request Maintenance':
        return ['maintenancePriorities'];
      case 'Pending Maintenance':
        return ['maintenancePriorities', 'maintenanceStatuses'];
      case 'Complete Maintenance':
        return ['maintenancePriorities', 'maintenanceStatuses'];
      default:
        return [];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full bg-white shadow-sm">
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />
        <div
          className="subheader sticky z-30 w-full bg-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 shadow-sm"
          style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
        >
          <div className="max-w-screen-2xl mx-auto">
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search maintenance..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {activeTab === "Request Maintenance" && (
                <button
                  onClick={() => handleOpenForm("create")}
                  className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md shadow-sm hover:bg-[#2e4a36] transition whitespace-nowrap w-full sm:w-auto text-center"
                >
                  New Maintenance Request
                </button>
              )}

              {/* ✅ NEW: trash icon beside filter button (Request Maintenance tab only) */}
              {activeTab === "Request Maintenance" && (
                <button
                  type="button"
                  onClick={openDeletedModal}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition w-full sm:w-auto"
                  title="View deleted requests"
                  aria-label="View deleted requests"
                >
                  <Trash2 size={18} className="text-gray-700" />
                </button>
              )}

              <FilterPanel
                types={getFilterTypesByTab(activeTab)}
                onFilterChange={setSelectedFilters}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            {renderActiveTab()}
          </div>
        </div>
      </main>

      {/* Render the modal at the top level of the page */}
      <MaintenanceForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedTicket}
        submitError={submitError}
      />

      {/* ✅ NEW: Deleted requests modal */}
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

export default MaintenancePage;
