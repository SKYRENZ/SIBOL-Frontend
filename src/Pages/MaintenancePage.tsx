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
        return <RequestMaintenance createdByAccountId={createdByAccountId} />;
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

      <div className="w-full px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search maintenance..."
              className="flex-grow max-w-md"
            />
            <FilterPanel types={getFilterTypesByTab(activeTab)} onFilterChange={setSelectedFilters} />
          </div>

          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
