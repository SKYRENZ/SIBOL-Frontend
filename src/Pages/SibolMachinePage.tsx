import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import * as machineService from '../services/machineService';
import type { Machine, Area } from '../services/machineService';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Chemical Additives');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('SIBOL Machine 1');
  const [formData, setFormData] = useState({
    area: '',
    startDate: ''
  });

  // ✅ Add state for real machine data
  const [machines, setMachines] = useState<Machine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [machinesData, areasData] = await Promise.all([
        machineService.getAllMachines(),
        machineService.getAreas()
      ]);
      setMachines(machinesData);
      setAreas(areasData);
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

  const tabs = ['Process Panels', 'Chemical Additives', 'Machines', 'Waste Container', 'Analytics'];
  const staticAreas = ['Package 1', 'Package 2', 'Package 3', 'Package 4']; // Keep for other tabs
  const sibolMachines = Array.from({ length: 120305 }, (_, i) => `SIBOL Machine ${i + 1}`);

  const generateMachineNo = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  const handleAddForm = () => {
    setFormData({ area: '', startDate: '' });
    setShowAddForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'Machines') {
      // ✅ Handle real machine creation
      try {
        setLoading(true);
        const areaId = parseInt(formData.area);
        await machineService.createMachine(areaId);
        await loadMachineData(); // Reload data
        setShowAddForm(false);
        alert('Machine created successfully!');
      } catch (err) {
        alert(`Failed to create machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Handle other tabs (existing logic)
      console.log('Form submitted:', { machineNo: generateMachineNo(), ...formData });
      setShowAddForm(false);
    }
  };

  const renderTable = () => {
    if (activeTab === 'Chemical Additives') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead style={{ backgroundColor: 'rgba(175, 200, 173, 0.55)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Chemical Input
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Person in Charge
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chemicalAdditivesData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.chemicalInput}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.personInCharge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'Machines') {
      // ✅ Updated Machines table with real data
      return (
        <div className="overflow-x-auto">
          {/* Error Display */}
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              🔄 Loading machines...
            </div>
          )}

          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead style={{ backgroundColor: 'rgba(175, 200, 173, 0.55)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Machine ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Machine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading && machines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                    No machines found. Click "Add Machine" to create one.
                  </td>
                </tr>
              ) : (
                machines
                  .filter(machine => 
                    searchTerm === '' || 
                    machine.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.Area_Name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((machine, index) => (
                    <tr key={machine.machine_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                        #{machine.machine_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-100">
                        {machine.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                        {machine.Area_Name || `Area ${machine.Area_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          machine.status_name 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {machine.status_name || 'No Status'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                        <button
                          onClick={() => console.log('Edit machine:', machine.machine_id)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'Waste Container') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead style={{ backgroundColor: 'rgba(175, 200, 173, 0.55)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Waste Container No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Start Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wasteContainerData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.wasteContainerNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                    {row.startDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar */}
      <div className="bg-transparent border-b border-transparent pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Tabs */}
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 focus:outline-none ${
                    activeTab === tab
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

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

              {/* ✅ Add Refresh button for Machines tab */}
              {activeTab === 'Machines' && (
                <button
                  onClick={loadMachineData}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-2"
                >
                  <span>{loading ? '🔄' : '🔄'}</span>
                  <span>Refresh</span>
                </button>
              )}

              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center space-x-2 hover:bg-gray-50">
                 <span>Filter by</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            </div>
          </div>

          {/* Divider line to separate tabs from table */}
          <div className="mt-3 border-b border-gray-200" />
         </div>
       </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar and Action Buttons - Aligned */}
        <div className="mb-6 flex items-center justify-between">
          {/* Search Bar */}
          <div className="relative" style={{ width: '70%' }}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-opacity-20 sm:text-sm"
              style={{ 
                '--tw-ring-color': 'rgba(135, 169, 144, 0.2)',
                '--tw-border-opacity': '1'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = '#a7b5a9';
                e.target.style.boxShadow = '0 0 0 3px rgba(135, 169, 144, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={handleAddForm}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-transparent border-transparent"
              style={{ color: '#2E523A', backgroundColor: 'transparent', border: 'none' }}
            >
              {activeTab === 'Chemical Additives' ? 'Add Chemical' : 'Add Machine'}
            </button>
            {activeTab !== 'Machines' && (
              <button className="bg-transparent border-transparent text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2" style={{ backgroundColor: 'transparent', border: 'none' }}>
                 <span>Filter by</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {renderTable()}
      </div>

      {/* ✅ Updated Add Machine Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add {activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}
              </h3>
              <form onSubmit={handleSubmitForm}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Area</option>
                    {/* ✅ Use real areas for Machines tab, static for others */}
                    {(activeTab === 'Machines' ? areas : staticAreas.map((area, index) => ({ Area_id: index + 1, Area_Name: area }))).map((area) => (
                      <option key={area.Area_id} value={area.Area_id}>
                        {area.Area_Name}
                      </option>
                    ))}
                  </select>
                </div>
                {activeTab !== 'Machines' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200"
                    style={{ backgroundColor: '#2E523A' }}
                  >
                    {loading ? 'Creating...' : `Add ${activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SibolMachinePage;
