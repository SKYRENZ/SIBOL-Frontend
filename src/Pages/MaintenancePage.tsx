import React, { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import Header from "../Components/Header";
import Tabs from "../Components/common/Tabs";
import { RequestMaintenance } from "../Components/maintenance/RequestMaintenance";
import { PendingMaintenance } from "../Components/maintenance/PendingMaintenance";
import { CompletedMaintenance } from "../Components/maintenance/CompletedMaintenance";
import MaintenanceForm from "../Components/maintenance/MaintenanceForm";
import * as maintenanceService from "../services/maintenanceService";
import type { MaintenanceTicket } from "../types/maintenance";
import SnackBar from "../Components/common/SnackBar";

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Request Maintenance");
  const [createdByAccountId, setCreatedByAccountId] = useState<number | null>(null);

  // ✅ SnackBar state
  const [snack, setSnack] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  const showSnack = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSnack({ visible: true, message, type });
  };

  // State for the modal, lifted up to this parent component
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'assign' | 'pending' | 'completed'>('create');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Read user from Redux instead of localStorage
  const reduxUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const accountId = reduxUser?.Account_id ?? reduxUser?.account_id ?? null;
    setCreatedByAccountId(accountId);
  }, [reduxUser]);

  const handleOpenForm = (
    mode: 'create' | 'assign' | 'pending' | 'completed',
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
        const ticket = await maintenanceService.createTicket({
          title: formData.title,
          details: formData.issue,
          priority: formData.priority,
          created_by: createdByAccountId,
          due_date: formData.dueDate || null,
        });

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

        await maintenanceService.acceptAndAssign(
          requestId,
          staffId,
          assignToId,
          formData.priority || null,
          formData.dueDate || null
        );
      } else if (formMode === 'pending') {
        if (formData.files && formData.files.length > 0) {
          if (!requestId) throw new Error('Request ID not found');

          await Promise.all(
            formData.files.map((file: File) =>
              maintenanceService.uploadAttachment(requestId, createdByAccountId!, file)
            )
          );
        }
      }

      handleCloseForm();
      window.dispatchEvent(new Event('maintenance:refresh'));
    } catch (err: any) {
      console.error("Form submission error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit form";
      setSubmitError(errorMessage);
      showSnack(`Error: ${errorMessage}`, 'error');
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

  const handleOpenCompletedForm = (_mode: 'completed', ticket: MaintenanceTicket) => {
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
            onOpenCreateForm={() => handleOpenForm("create")}
          />
        );
    }
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
          <div className="overflow-x-auto">
            {renderActiveTab()}
          </div>
        </div>
      </main>

      <MaintenanceForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedTicket}
        submitError={submitError}
      />

      <SnackBar
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
      />
    </div>
  );
};

export default MaintenancePage;