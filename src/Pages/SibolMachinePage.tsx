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
import Table from '../Components/common/Table';
import AddWasteContainerForm from '../Components/SibolMachine/AddWasteContainerForm';
import type { CreateContainerRequest } from '../services/wasteContainerService';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Machines');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // measure header height (only apply offset if header is fixed so Tabs won't be hidden)
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useEffect(() => {
    const update = () => {
      const headerEl = document.querySelector('header.header') as HTMLElement | null;
      if (!headerEl) {
        setHeaderHeight(0);
        return;
      }
      const style = getComputedStyle(headerEl);
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      setHeaderHeight(isFixed ? Math.ceil(headerEl.getBoundingClientRect().height) : 0);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  
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

  // Sample data for Chemical Additives
  const chemicalAdditivesData = [
    { additiveInput: 'Cow Manure', stage: 'Pre-treatment', value: '50', units: 'g', date: '2025-10-28', time: '09:00', personInCharge: 'John Doe' },
    { additiveInput: 'NaOH', stage: 'Hydrolysis', value: '100', units: 'ml', date: '2025-10-28', time: '11:30', personInCharge: 'Jane Smith' },
  ];

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

  const handleContainerSubmit = async (payload: CreateContainerRequest) => {
    const success = await containersHook.createContainer(payload);
    if (success) {
      closeAddForm();
      alert('Waste container created successfully!');
      return true;
    }
    alert(`Failed to create container: ${containersHook.error ?? 'Unknown error'}`);
    return false;
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
    } else {
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
      const columns = [
        { key: 'additiveInput', label: 'Additive Input' },
        { key: 'stage', label: 'Stage' },
        { key: 'value', label: 'Value' },
        { key: 'units', label: 'Units' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'personInCharge', label: 'Person in Charge' }
      ];
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = chemicalAdditivesData.slice(startIndex, endIndex);
      return (
        <Table 
          columns={columns} 
          data={paginatedData} 
          emptyMessage="No chemical additives data available"
          pagination={{
            currentPage,
            pageSize,
            totalItems: chemicalAdditivesData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: handlePageSizeChange
          }}
        />
      );
    }
    // Placeholder for other tabs
    return <div className="text-center py-10">Content for {activeTab}</div>;
  };

  return (
    // NOTE: switched to spacer + sticky subheader approach (like MaintenancePage)
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar - placed directly under header with no outer gap */}
      <div className="w-full bg-white border-b">
        {/* spacer to preserve header height so sticky subheader won't overlap header */}
        <div style={{ height: `calc(${headerHeight}px)` }} aria-hidden />
        <div
          className="subheader sticky z-10 w-full bg-white px-6"
          style={{ top: `calc(${headerHeight}px)` }}
        >
          <div className="max-w-screen-2xl mx-auto py-3">
            {/* added vertical padding (py-3) so tabs have breathing room inside the bar */}
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
        // allow modal to open for Waste Container add flow so AddWasteContainerForm is usable
        isOpen={(showAddForm || showEditForm)}
        onClose={showEditForm ? closeEditForm : closeAddForm}
        title={showEditForm ? `Edit Machine #${editingMachine?.machine_id}` : `Add ${activeTab === 'Waste Container' ? 'Container' : 'Machine'}`}
        width="500px"
      >
        {activeTab === 'Waste Container' && !showEditForm ? (
          <AddWasteContainerForm
            loading={containersHook.loading}
            onCancel={closeAddForm}
            onSubmit={handleContainerSubmit}
          />
        ) : (
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
        )}
      </FormModal>
    </div>
  );
};

export default SibolMachinePage;
