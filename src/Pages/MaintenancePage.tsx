import React, { useMemo, useState, useEffect } from "react";
import Header from "../Components/Header";
import Tabs from "../Components/common/Tabs";
import SearchBar from "../Components/common/SearchBar";
import FilterPanel from "../Components/common/filterPanel";
import { RequestMaintenance } from "../Components/maintenance/RequestMaintenance";
import { PendingMaintenance } from "../Components/maintenance/PendingMaintenance";
import { CompletedMaintenance } from "../Components/maintenance/CompletedMaintenance";
import "../types/Household.css";

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Request Maintenance");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setSelectedFilters] = useState<string[]>([]);
  const [createdByAccountId, setCreatedByAccountId] = useState<number | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("User data from localStorage:", userData); // Debug
        const accountId = userData.Account_id ?? userData.account_id;
        console.log("Extracted account_id:", accountId); // Debug
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
        return <PendingMaintenance />;
      case "Complete Maintenance":
        return <CompletedMaintenance />;
      default:
        return <RequestMaintenance 
          createdByAccountId={createdByAccountId} 
          onCreateRequest={() => setShowMaintenanceForm(true)}
          showForm={showMaintenanceForm}
          onFormClose={() => setShowMaintenanceForm(false)}
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
        <div style={{ height: '60px' }} aria-hidden />
        <div className="subheader sticky top-[60px] z-30 w-full bg-white px-6 py-4 shadow-sm">
          <div className="max-w-screen-2xl mx-auto">
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search maintenance..."
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {activeTab === 'Request Maintenance' && (
                <button
                  onClick={() => setShowMaintenanceForm(true)}
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
      </div>
    </div>
  );
};

export default MaintenancePage;
