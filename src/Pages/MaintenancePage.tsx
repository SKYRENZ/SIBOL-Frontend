import React, { useMemo, useState, useEffect } from "react";
import Header from "../Components/Header";
import Tabs from "../Components/common/Tabs";
import SearchBar from "../Components/common/SearchBar";
import FilterPanel from "../Components/common/filterPanel";
import { RequestMaintenance } from "../Components/maintenance/RequestMaintenance";
import { PendingMaintenance } from "../Components/maintenance/PendingMaintenance";
import { CompletedMaintenance } from "../Components/maintenance/CompletedMaintenance";
import MaintenanceForm from "../Components/maintenance/MaintenanceForm"; // Import MaintenanceForm
import * as maintenanceService from "../services/maintenanceService"; // Import maintenanceService
import type { MaintenanceTicket } from "../types/maintenance"; // Import MaintenanceTicket type

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Request Maintenance");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setSelectedFilters] = useState<string[]>([]);
  const [createdByAccountId, setCreatedByAccountId] = useState<number | null>(null);
  
  // State for the modal, lifted up to this parent component
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'assign' | 'pending'>('create');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const accountId = userData.Account_id ?? userData.account_id;
        setCreatedByAccountId(accountId || 1);
      } catch (err) {
        console.error("Failed to parse user data:", err);
        setCreatedByAccountId(1);
      }
    } else {
      console.warn("No user in localStorage");
      setCreatedByAccountId(1);
    }
  }, []);

  const handleOpenForm = (mode: 'create' | 'assign' | 'pending', ticket: MaintenanceTicket | null = null) => {
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
        // Create ticket WITHOUT attachments first
        const ticket = await maintenanceService.createTicket({
          title: formData.title,
          details: formData.issue,
          priority: formData.priority,
          created_by: createdByAccountId!,
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
        // ✅ FIX: Check if requestId exists before calling
        if (!requestId) {
          throw new Error('Request ID not found');
        }

        const user = localStorage.getItem('user');
        if (!user) {
          throw new Error('User not found');
        }
        
        const userData = JSON.parse(user);
        const staffId = userData.Account_id ?? userData.account_id;
        
        if (!staffId) {
          throw new Error('Staff account ID not found');
        }

        const assignToId = formData.assignedTo ? parseInt(formData.assignedTo, 10) : null;
        
        console.log('Submitting:', {
          requestId,
          staffId,
          assignToId
        });

        await maintenanceService.acceptAndAssign(requestId, staffId, assignToId);

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
      window.location.reload();

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

  const renderActiveTab = () => {
    if (createdByAccountId === null) return <p>Loading...</p>;
    
    switch (activeTab) {
      case "Pending Maintenance":
        return <PendingMaintenance onOpenForm={handleOpenForm} />;
      case "Complete Maintenance":
        return <CompletedMaintenance onOpenForm={handleOpenForm} />;
      default:
        return <RequestMaintenance 
          onOpenForm={handleOpenForm as (mode: 'assign', ticket: MaintenanceTicket) => void}
        />;
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
              {activeTab === 'Request Maintenance' && (
                <button
                  onClick={() => handleOpenForm('create')}
                  className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md shadow-sm hover:bg-[#2e4a36] transition whitespace-nowrap w-full sm:w-auto text-center"
                >
                  New Maintenance Request
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
    </div>
  );
};

export default MaintenancePage;
