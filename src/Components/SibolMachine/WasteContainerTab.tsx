import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import type { WasteContainer } from '../../services/wasteContainerService';

interface WasteContainerTabProps {
  containers: WasteContainer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Full': return 'bg-red-100 text-red-800 border-red-200';
    case 'Collecting': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'In-Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

const WasteContainerTab: React.FC<WasteContainerTabProps> = ({ containers, loading, error, searchTerm }) => {
  const filteredContainers = containers.filter(container =>
    container.container_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.area_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-500">🔄 Loading containers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">❌ {error}</div>;
  }

  if (filteredContainers.length === 0) {
    return <div className="text-center py-8 text-gray-500">No waste containers found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredContainers.map(container => (
        <div key={container.container_id} className="bg-white border border-gray-200/80 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-gray-800">{container.container_name}</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClass(container.status)}`}>
                {container.status}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><MapPin size={14} /> <span>{container.area_name}</span></p>
              <p className="flex items-center gap-2"><Calendar size={14} /> <span>Deployed: {container.deployment_date}</span></p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
             <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                View Details
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WasteContainerTab;