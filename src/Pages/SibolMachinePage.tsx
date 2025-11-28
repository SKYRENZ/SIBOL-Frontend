import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import * as machineService from '../services/machineService';
import type { Machine } from '../services/machineService';
import { useMachine } from '../hooks/sibolMachine/useMachine'; // Correctly using your existing hook
import { useMachinesData } from '../hooks/sibolMachine/useMachinesData';
import { useWasteContainers } from '../hooks/sibolMachine/useWasteContainers';
import Tabs from '../Components/common/Tabs';
import SearchBar from '../Components/common/SearchBar';
import FormModal from '../Components/common/FormModal';
import FormField from '../Components/common/FormField';
import '../types/Household.css';
import WasteContainerTab from '../Components/SibolMachine/WasteContainerTab';
import MachineTab from '../Components/SibolMachine/MachineTab';
import AdditivesTab from '../Components/SibolMachine/AdditivesTab';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Machines');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Your existing hook for form state
  const { 
    showAddForm, 
    showEditForm,
    openAddForm, 
    closeAddForm, 
    openEditForm,
    closeEditForm,
    formData, 
    updateFormField, 
    setFormData 
  } = useMachine();

  // New hooks for data fetching
  const machinesHook = useMachinesData();
  const containersHook = useWasteContainers();

  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const tabsConfig = [
    { id: 'Machines', label: 'Machines' },
    { id: 'Chemical Additives', label: 'Additives' },
    { id: 'Waste Container', label: 'Waste Container' },
    { id: 'Analytics', label: 'Analytics' }
  ];

  // Load data based on the active tab
  useEffect(() => {
    if (activeTab === 'Machines') {
      machinesHook.fetchMachineData();
    }
    if (activeTab === 'Waste Container') {
      containersHook.fetchContainers();
    }
  }, [activeTab]);

  // Reset to page 1 when search term or active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // ✅ Handle edit machine button click
  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      area: machine.Area_id.toString(),
      startDate: '', // Not used in machine edit
      name: machine.Name,
      status: machine.status_id?.toString() || ''
    });
    openEditForm();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = showEditForm && editingMachine;

    if (activeTab === 'Machines') {
      try {
        if (isEditing) {
          await machineService.updateMachine(editingMachine.machine_id, {
            name: formData.name?.trim() || editingMachine.Name,
            areaId: parseInt(formData.area),
            status: formData.status ? parseInt(formData.status) : undefined
          });
        } else {
          await machineService.createMachine(parseInt(formData.area));
        }
        await machinesHook.fetchMachineData();
        isEditing ? closeEditForm() : closeAddForm();
        alert(`Machine ${isEditing ? 'updated' : 'created'} successfully!`);
      } catch (err) {
        alert(`Failed to ${isEditing ? 'update' : 'create'} machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else if (activeTab === 'Waste Container') {
      const success = await containersHook.createContainer({
        container_name: formData.name || '',
        area_id: parseInt(formData.area),
        deployment_date: formData.startDate,
      });
      if (success) {
        closeAddForm();
        alert('Waste container created successfully!');
      } else {
        alert(`Failed to create container: ${containersHook.error}`);
      }
    } else {
      // Handle other tabs
      console.log('Form submitted for other tab:', { ...formData });
      closeAddForm();
    }
  };

  const renderContent = () => {
    if (activeTab === 'Machines') {
      return (
        <MachineTab
          machines={machinesHook.machines}
          loading={machinesHook.loading}
          error={machinesHook.error}
          searchTerm={searchTerm}
          onEdit={handleEditMachine}
          pagination={{
            currentPage,
            pageSize,
            totalItems: machinesHook.machines.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      );
    }
    if (activeTab === 'Waste Container') {
      return (
        <WasteContainerTab
          containers={containersHook.wasteContainers}
          loading={containersHook.loading}
          error={containersHook.error}
          searchTerm={searchTerm}
        />
      );
    }
    if (activeTab === 'Chemical Additives') {
      return <AdditivesTab searchTerm={searchTerm} onSearchChange={setSearchTerm} />;
    }
    // Placeholder for other tabs
    return <div className="text-center py-10">Content for {activeTab}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar */}
      <div className="w-full bg-white shadow-sm">
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />
        <div
          className="subheader sticky top-[60px] z-30 w-full bg-white px-6 py-4 shadow-sm"
          style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            {/* Tabs */}
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Search Bar and Action Buttons */}
          <div className="mb-6 flex items-center justify-between gap-6">
            <div className="w-3/5">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm}
              />
            </div>

            {/* Action Buttons */}
          <div className="flex space-x-3">
            {(activeTab === 'Machines' || activeTab === 'Waste Container') && (
              <button 
                onClick={openAddForm}
                className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {activeTab === 'Waste Container' ? 'Add Container' : 'Add Machine'}
              </button>
            )}
          </div>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Add/Edit Modals */}
      <FormModal
        isOpen={showAddForm || showEditForm}
        onClose={showEditForm ? closeEditForm : closeAddForm}
        title={showEditForm ? `Edit Machine #${editingMachine?.machine_id}` : `Add ${activeTab === 'Waste Container' ? 'Container' : 'Machine'}`}
        width="500px"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {(activeTab === 'Waste Container' || showEditForm) && (
            <FormField
              label={activeTab === 'Waste Container' ? "Container Name" : "Machine Name"}
              name="name"
              type="text"
              placeholder={activeTab === 'Waste Container' ? "e.g., WC-101" : "e.g., SIBOL-M-001"}
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              required
            />
          )}
          <FormField
            label="Area"
            name="area"
            type="select"
            value={formData.area}
            onChange={(e) => updateFormField('area', e.target.value)}
            options={machinesHook.areas.map((area) => ({
              value: area.Area_id.toString(),
              label: area.Area_Name
            }))}
            required
          />
          {activeTab === 'Waste Container' && !showEditForm && (
            <FormField
              label="Deployment Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormField('startDate', e.target.value)}
              required
            />
          )}
          {showEditForm && (
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) => updateFormField('status', e.target.value)}
              options={machinesHook.machineStatuses.map((s) => ({ value: s.Mach_status_id.toString(), label: s.Status }))}
            />
          )}
          <div className="flex justify-center pt-2">
            <button type="button" onClick={showEditForm ? closeEditForm : closeAddForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 mr-3">
              Cancel
            </button>
            <button type="submit" disabled={machinesHook.loading || containersHook.loading} className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg disabled:opacity-50">
              {machinesHook.loading || containersHook.loading ? 'Saving...' : (showEditForm ? 'Update Machine' : 'Add')}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default SibolMachinePage;
