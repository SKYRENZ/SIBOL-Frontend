import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout as logoutAction } from '../store/slices/authSlice';
import { getAllMachines, Machine } from '../services/machineService';
import { createWasteInput } from '../services/wasteInputService';
import { getWasteContainers, WasteContainer } from '../services/wasteContainerService';
import OperatorEmergencyMap from '../Components/OperatorEmergencyMap';
import FormModal from '../Components/common/FormModal';

export default function OperatorEmergency() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [containers, setContainers] = useState<WasteContainer[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedMapContainer, setSelectedMapContainer] = useState<WasteContainer | null>(null);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [weight, setWeight] = useState<string>('');
  const [collecting, setCollecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mapWarning, setMapWarning] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [machinesData, containersData] = await Promise.all([
          getAllMachines(),
          getWasteContainers(),
        ]);
        setMachines(machinesData);
        setContainers(containersData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      }
    };
    loadData();
  }, []);

  const cleanBarangay = (barangayRaw?: string | null): string => {
    if (!barangayRaw) return 'N/A';
    const trimmed = barangayRaw.trim();
    return trimmed.replace(/^barangay\s+/i, '');
  };

  const currentAccountId = Number(user?.Account_id ?? user?.account_id ?? user?.AccountId ?? user?.id ?? 0) || undefined;

  const assignedMachines = useMemo(() => {
    if (!currentAccountId) return [];
    return machines.filter((m) => Number(m.operator_account_id) === Number(currentAccountId));
  }, [machines, currentAccountId]);

  const selectedMachine = useMemo(() => {
    return assignedMachines.find((m) => String(m.machine_id) === selectedMachineId) ?? null;
  }, [assignedMachines, selectedMachineId]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login', { replace: true });
  };

  const selectedContainer = useMemo(() => {
    if (selectedMapContainer) return selectedMapContainer;
    if (!selectedMachine) return null;
    return containers.find((c) => Number(c.area_id) === Number(selectedMachine.Area_id)) ?? null;
  }, [containers, selectedMachine, selectedMapContainer]);

  const handleMapContainerSelect = (container: WasteContainer) => {
    setSelectedMapContainer(container);
    setMapWarning(null);
    setError(null);

    const machineInArea = machines.find((m) => Number(m.Area_id) === Number(container.area_id));
    if (machineInArea) {
      setSelectedMachineId(String(machineInArea.machine_id));
    }

    const measuredWeight = container.current_kg ?? 0;
    setWeight(String(measuredWeight));
    setSuccess(`Selected container ${container.area_name || container.container_name} with weight ${measuredWeight} kg`);
    setCollecting(true);
    setIsCollectModalOpen(true);
  };

  const handleCollectFromMap = async () => {
    // Fetch latest containers, then open collect modal and prefill from the first container (if any)
    setError(null);
    setMapWarning(null);
    let latest = containers;
    try {
      latest = await getWasteContainers();
      setContainers(latest);
    } catch (e) {
      // ignore fetch errors and fall back to existing containers
    }

    const linkedContainer = latest && latest.length > 0 ? latest[0] : null;
    if (linkedContainer) {
      setSelectedMapContainer(linkedContainer);
      const measuredWeight = linkedContainer.current_kg ?? 0;
      setWeight(String(measuredWeight));
      setSuccess(`Fetched container weight ${measuredWeight} kg from ${linkedContainer.area_name || linkedContainer.container_name}`);
    } else {
      setSelectedMapContainer(null);
      setWeight('');
      setSuccess(null);
    }

    setCollecting(true);
    setIsCollectModalOpen(true);
  };

  const handleClearCollect = () => {
    setCollecting(false);
    setSuccess(null);
  };

  useEffect(() => {
    if (!selectedMachineId && assignedMachines.length > 0) {
      setSelectedMachineId(String(assignedMachines[0].machine_id));
    }
  }, [assignedMachines, selectedMachineId]);

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setSelectedMapContainer(null);
    setIsMachineModalOpen(false);
    setError(null);
    setMapWarning(null);
  };

  const handleWeightChange = (value: string) => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setWeight(parts[0] + '.' + parts.slice(1).join(''));
    } else if (parts.length === 2) {
      setWeight(parts[0] + '.' + parts[1].slice(0, 2));
    } else {
      setWeight(cleaned);
    }
  };

  const handleSave = async () => {
    if (!selectedMachineId || !weight) {
      setError('Please select a machine and enter weight');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    const selectedOperatorId = Number(
      user?.Account_id ?? user?.account_id ?? user?.AccountId ?? user?.id ?? selectedMachine?.operator_account_id
    );

    if (!selectedOperatorId || isNaN(selectedOperatorId)) {
      setError('Operator ID is missing or invalid. Please log in with a valid operator account.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createWasteInput(selectedMachineId, weightNum, selectedOperatorId);
      setSuccess('Waste input saved successfully');
      setWeight('');
      setSelectedMapContainer(null);
      setIsCollectModalOpen(false);
      setCollecting(false);
      // Refresh containers data
      const updatedContainers = await getWasteContainers();
      setContainers(updatedContainers);
    } catch (err: any) {
      setError(err.message || 'Failed to save waste input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Operator Emergency Access
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Waste Input
            </h2>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <img
                  src={user?.Profile_image_path ?? user?.profile_image_path ?? 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user?.FirstName || user?.Username || 'Operator').toString())}
                  alt="Operator"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="text-base font-semibold text-gray-800">
                    Hello, {user?.FirstName || user?.Username || 'Operator'}
                    {user?.LastName ? ` ${user.LastName}` : ''}
                  </div>
                  <div className="text-sm text-gray-600">Barangay: {cleanBarangay(user?.Barangay_Name ?? user?.Barangay)}</div>
                  <div className="text-xs text-gray-500 mt-1">Assigned machines: {assignedMachines.length}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Machine</label>
                <button
                  type="button"
                  onClick={() => setIsMachineModalOpen(true)}
                  className="w-full text-left px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {selectedMachine ? `${selectedMachine.Name} (ID: ${selectedMachine.machine_id})` : 'Choose a machine...'}
                </button>
                {assignedMachines.length === 0 && (
                  <div className="text-xs text-yellow-700 mt-2">No machines are assigned to your account yet.</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="Enter weight in kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Waste Input'}
              </button>

              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm mt-2">
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Waste Collection Map</h2>
              <button
                type="button"
                onClick={handleCollectFromMap}
                className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm"
              >
                Collect waste
              </button>
            </div>

            {collecting && (
              <div className="mb-3 text-sm text-green-600">Container weight auto-filled from map container (modal selection will stay active).</div>
            )}

            {/* map warnings intentionally removed to keep UX focused on the collect modal */}

            {/* Removed Selected Machine / Assigned Area / Linked Container display per request */}

            <div className="h-96">
              <OperatorEmergencyMap
                containers={containers}
                selectedContainer={selectedContainer}
                onContainerSelect={handleMapContainerSelect}
              />
            </div>
          </div>
        </div>
      </div>

      <FormModal isOpen={isMachineModalOpen} onClose={() => setIsMachineModalOpen(false)} title="Choose Assigned Machine" width="500px">
        <div className="space-y-3">
          {assignedMachines.length > 0 ? (
            assignedMachines.map((machine) => (
              <button
                type="button"
                key={machine.machine_id}
                onClick={() => handleSelectMachine(String(machine.machine_id))}
                className="w-full text-left px-4 py-3 border rounded-lg hover:bg-green-50"
              >
                <div className="font-medium text-gray-800">{machine.Name}</div>
                <div className="text-xs text-gray-500">ID: {machine.machine_id}</div>
                <div className="text-xs text-gray-500">Area: {machine.Area_Name ?? 'N/A'}</div>
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500">No machines are assigned to you yet. Please contact admin.</div>
          )}
        </div>
      </FormModal>

      <FormModal isOpen={isCollectModalOpen} onClose={() => setIsCollectModalOpen(false)} title="Collect waste near you" width="500px">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Choose Container</label>
            {containers && containers.length > 0 ? (
              <select
                value={selectedMapContainer ? String(selectedMapContainer.container_id) : ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const c = containers.find((x) => Number(x.container_id) === id) ?? null;
                  setSelectedMapContainer(c);
                  const measuredWeight = c?.current_kg ?? 0;
                  setWeight(c ? String(measuredWeight) : '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">-- Select a container --</option>
                {containers.map((c) => (
                  <option key={c.container_id} value={String(c.container_id)}>
                    {c.container_name ?? c.area_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500">No containers available.</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Weight collected</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-600">kg</span>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </FormModal>
    </div>
  );
}