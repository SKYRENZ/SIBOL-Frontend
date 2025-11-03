import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import * as machineService from '../services/machineService';
import type { Machine, Area } from '../services/machineService';
import { useMachine } from '../hooks/sibolMachine/useMachine';
import Tabs from '../Components/common/Tabs';
import SearchBar from '../Components/common/SearchBar';
import Table from '../Components/common/Table';
import FormModal from '../Components/common/FormModal';
import FormField from '../Components/common/FormField';
import '../types/Household.css';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Chemical Additives');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('SIBOL Machine 1');
  
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

  // ✅ Add state for real machine data
  const [machines, setMachines] = useState<Machine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [machineStatuses, setMachineStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // ✅ Load data when Machines tab is active
  useEffect(() => {
    if (activeTab === 'Machines') {
      loadMachineData();
    }
  }, [activeTab]);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [machinesData, areasData, statusesData] = await Promise.all([
        machineService.getAllMachines(),
        machineService.getAreas(),
        machineService.getMachineStatuses()
      ]);
      setMachines(machinesData);
      setAreas(areasData);
      setMachineStatuses(statusesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load machine data');
      console.error('❌ Load machine data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for Chemical Additives
  const chemicalAdditivesData = [
    {
      chemicalInput: 'Water',
      stage: '2',
      value: '20',
      units: 'liters',
      date: '8/27/25',
      time: '09:39AM',
      personInCharge: 'Maintenance#32'
    },
    {
      chemicalInput: 'Water',
      stage: '2',
      value: '10',
      units: 'ounces',
      date: '8/27/25',
      time: '10:40AM',
      personInCharge: 'Maintenance#54'
    }
  ];

  // Sample data for Waste Container
  const wasteContainerData = [
    {
      wasteContainerNo: 'WC-001',
      area: 'Package 1',
      status: 'Full',
      startDate: '8/1/2025'
    },
    {
      wasteContainerNo: 'WC-002',
      area: 'Package 2',
      status: 'Not Full',
      startDate: '8/15/2025'
    }
  ];

  const tabsConfig = [
    { id: 'Process Panels', label: 'Process Panels' },
    { id: 'Chemical Additives', label: 'Chemical Additives' },
    { id: 'Machines', label: 'Machines' },
    { id: 'Waste Container', label: 'Waste Container' },
    { id: 'Analytics', label: 'Analytics' }
  ];
  const staticAreas = ['Package 1', 'Package 2', 'Package 3', 'Package 4'];
  const sibolMachines = Array.from({ length: 120305 }, (_, i) => `SIBOL Machine ${i + 1}`);

  const generateMachineNo = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  // ✅ Handle edit machine button click
  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      area: machine.Area_id.toString(),
      startDate: '',
      name: machine.Name, // ✅ This is correct
      status: machine.status_id?.toString() || ''
    });
    openEditForm();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'Machines') {
      if (showEditForm && editingMachine) {
        // ✅ Handle machine edit
        try {
          setLoading(true);
          
          // ✅ Fix: Use formData.name directly, fallback to original only if empty
          const updatedName = formData.name?.trim() || editingMachine.Name;
          
          await machineService.updateMachine(editingMachine.machine_id, {
            name: updatedName,
            areaId: parseInt(formData.area),
            status: formData.status ? parseInt(formData.status) : undefined
          });
          await loadMachineData(); // Reload data
          closeEditForm();
          setEditingMachine(null);
          alert('Machine updated successfully!');
        } catch (err) {
          alert(`Failed to update machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      } else {
        // ✅ Handle real machine creation (unchanged)
        try {
          setLoading(true);
          const areaId = parseInt(formData.area);
          await machineService.createMachine(areaId);
          await loadMachineData(); // Reload data
          closeAddForm();
          alert('Machine created successfully!');
        } catch (err) {
          alert(`Failed to create machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Handle other tabs (existing logic)
      console.log('Form submitted:', { machineNo: generateMachineNo(), ...formData });
      closeAddForm();
    }
  };

  const renderTable = () => {
    if (activeTab === 'Chemical Additives') {
      const columns = [
        { key: 'chemicalInput', label: 'Chemical Input' },
        { key: 'stage', label: 'Stage' },
        { key: 'value', label: 'Value' },
        { key: 'units', label: 'Units' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'personInCharge', label: 'Person in Charge' }
      ];
      return <Table columns={columns} data={chemicalAdditivesData} emptyMessage="No chemical additives data available" />;
    } else if (activeTab === 'Machines') {
      const filteredMachines = machines.filter(machine => 
        searchTerm === '' || 
        machine.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.Area_Name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const columns = [
        { 
          key: 'machine_id', 
          label: 'Machine ID',
          render: (value: number) => `#${value}`
        },
        { key: 'Name', label: 'Machine Name' },
        { 
          key: 'Area_Name', 
          label: 'Area',
          render: (value: string | undefined, row: Machine) => value || `Area ${row.Area_id}`
        },
        { 
          key: 'status_name', 
          label: 'Status',
          render: (value: string | undefined) => (
            <span className={`px-2 py-1 text-xs rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {value || 'No Status'}
            </span>
          )
        },
        { 
          key: 'machine_id', 
          label: 'Actions',
          render: (_: any, row: Machine) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditMachine(row);
              }}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none min-h-[40px]"
            >
              Edit
            </button>
          )
        }
      ];

      return (
        <div>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ❌ {error}
              <button 
                onClick={() => setError(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              🔄 Loading machines...
            </div>
          )}
          <Table 
            columns={columns} 
            data={filteredMachines} 
            emptyMessage="No machines found. Click 'Add Machine' to create one."
          />
        </div>
      );
    } else if (activeTab === 'Waste Container') {
      const columns = [
        { key: 'wasteContainerNo', label: 'Waste Container No' },
        { key: 'area', label: 'Area' },
        { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date' }
      ];
      return <Table columns={columns} data={wasteContainerData} emptyMessage="No waste container data available" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar */}
      <div className="w-full bg-white shadow-sm page-content">
        <div className="subheader sticky top-[120px] z-45 w-full bg-white px-6 py-5 shadow-sm border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            {/* Tabs */}
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {activeTab !== 'Machines' && (
                <div className="relative">
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 appearance-none pr-8 cursor-pointer bg-white border border-gray-200"
                  >
                    {sibolMachines.slice(0, 100).map((machine) => (
                      <option key={machine} value={machine} className="bg-white text-gray-900">
                        {machine}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              <button className="flex items-center gap-2 px-6 py-3 min-h-[48px] border border-gray-300 rounded-lg text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40">
                 <span>Filter by</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            </div>
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
            <button 
              onClick={openAddForm}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-6 py-3 min-h-[48px] rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
            >
              {activeTab === 'Chemical Additives' ? 'Add Chemical' : 'Add Machine'}
            </button>
            {activeTab !== 'Machines' && (
              <button className="flex items-center gap-2 px-6 py-3 min-h-[48px] border border-gray-300 rounded-lg text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40">
                 <span>Filter by</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            )}
          </div>
        </div>

          {/* Data Table */}
          {renderTable()}
        </div>
      </div>

      {/* Add Machine Form Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddForm}
        title={`Add ${activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}`}
        subtitle={`Fill out the form to add a new ${activeTab === 'Chemical Additives' ? 'chemical' : 'machine'}`}
        width="500px"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <FormField
            label="Area"
            name="area"
            type="select"
            value={formData.area}
            onChange={(e) => updateFormField('area', e.target.value)}
            options={(activeTab === 'Machines' ? areas : staticAreas.map((area, index) => ({ Area_id: index + 1, Area_Name: area }))).map((area) => ({
              value: area.Area_id.toString(),
              label: area.Area_Name
            }))}
            required
          />
          <FormField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormField('startDate', e.target.value)}
            required
          />
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={closeAddForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 mr-3 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Add ${activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}`}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Edit Machine Form Modal */}
      {editingMachine && (
        <FormModal
          isOpen={showEditForm}
          onClose={() => {
            closeEditForm();
            setEditingMachine(null);
          }}
          title={`Edit Machine #${editingMachine.machine_id}`}
          subtitle="Update machine information"
          width="500px"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <FormField
              label="Machine Name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => updateFormField('name', e.target.value)}
              required
            />
            <FormField
              label="Area"
              name="area"
              type="select"
              value={formData.area}
              onChange={(e) => updateFormField('area', e.target.value)}
              options={areas.map((area) => ({
                value: area.Area_id.toString(),
                label: area.Area_Name
              }))}
              required
            />
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) => updateFormField('status', e.target.value)}
              options={[
                { value: '', label: 'No Status' },
                ...machineStatuses.map((status) => ({
                  value: status.Mach_status_id.toString(),
                  label: status.Status
                }))
              ]}
            />
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  closeEditForm();
                  setEditingMachine(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 mr-3 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Machine'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default SibolMachinePage;
