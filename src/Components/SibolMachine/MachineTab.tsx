import React from 'react';

import type { Machine } from '../../services/machineService';

interface MachineTabProps {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  onEdit: (machine: Machine) => void;
  onAdd: () => void;
  filterTypes?: string[]; // ✅ Added
}

const MachineTab: React.FC<MachineTabProps> = ({ 
  machines,
  loading, 
  error, 
  onEdit,
  onAdd,
}) => {
  const stage3DrumImage = new URL('../../assets/images/Stage3Drum.png', import.meta.url).href;

  const getStatusBadgeClass = (statusName?: string) => {
    const status = statusName?.toLowerCase();
    const statusClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      'under maintenance': 'bg-yellow-100 text-yellow-800',
      'no status': 'bg-gray-100 text-gray-800'
    };

    return statusClasses[status ?? 'no status'] ?? statusClasses['no status'];
  };

  const getCardBorderClass = (statusName?: string) => {
    const status = statusName?.toLowerCase();
    const borderClasses: Record<string, string> = {
      active: 'border-green-400',
      inactive: 'border-red-400',
      'under maintenance': 'border-yellow-400',
      'no status': 'border-gray-200'
    };

    return borderClasses[status ?? 'no status'] ?? borderClasses['no status'];
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          🔄 Loading machines...
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button
          onClick={onAdd}
          className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Add Machine
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No machines found. Click &apos;Add Machine&apos; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {machines.map((machine) => (
                <div
                  key={machine.machine_id}
                  className={`border-2 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:scale-105 cursor-pointer ${getCardBorderClass(machine.status_name)}`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={stage3DrumImage}
                      alt="Stage 3 Drum"
                      className="w-32 h-32 object-contain flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Machine #{machine.machine_id}</p>
                      <h3 className="text-xl font-semibold text-gray-800 truncate">{machine.Name}</h3>

                      <div className="space-y-2 text-sm my-3">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Area: </span>
                          {machine.Area_Name || `Area ${machine.Area_id}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">Operator: </span>
                          {machine.operator_name ? (
                            machine.operator_profile_picture ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={machine.operator_profile_picture}
                                  alt={machine.operator_name}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                />
                                <span className="text-gray-600">{machine.operator_name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center">
                                  <span className="text-xs text-gray-600 font-medium">
                                    {machine.operator_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-gray-600">{machine.operator_name}</span>
                              </div>
                            )
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </div>
                        <p>
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(machine.status_name)}`}>
                            {machine.status_name || 'No Status'}
                          </span>
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => onEdit(machine)}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-full hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
    </div>
  );
};

export default MachineTab;
