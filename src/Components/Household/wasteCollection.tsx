import React, { useState, useEffect } from "react";
import SearchBar from "../common/SearchBar";
import { X, MapPin, Calendar, Trash2, History, Weight, List, Table, FileDown, Printer, Sparkles } from "lucide-react";
import WasteCollectionMap from "./WasteCollectionMap";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useWasteContainers } from "../../hooks/sibolMachine/useWasteContainers";
import { getAreaLogs } from "../../services/wasteContainerService";
import type { WasteContainer, AreaLog } from "../../services/wasteContainerService";
import wasteIcon from './wasteIcon';
import lilyImage from '../../assets/images/lili.png';
import InfoModal from '../common/InfoModal';
import CustomScrollbar from '../common/CustomScrollbar';

// Import export libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const WasteCollectionTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWaste, setSelectedWaste] = useState<WasteContainer | null>(null);
  const [logs, setLogs] = useState<AreaLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logViewMode, setLogViewMode] = useState<'timeline' | 'table'>('timeline');
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const { wasteContainers, loading, error, fetchContainers } = useWasteContainers();

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  // Fetch logs when a container is selected
  useEffect(() => {
    if (selectedWaste) {
      const fetchLogs = async () => {
        setLogsLoading(true);
        try {
          const fetchedLogs = await getAreaLogs(selectedWaste.area_id);
          setLogs(fetchedLogs);
        } catch (err) {
          console.error("Failed to fetch logs:", err);
          setLogs([]); // Clear logs on error
        } finally {
          setLogsLoading(false);
        }
      };
      fetchLogs();
    } else {
      // Reset view mode when modal closes
      setLogViewMode('timeline');
    }
  }, [selectedWaste]);

  // --- EXPORT FUNCTIONS ---
  const exportToPDF = () => {
    if (!selectedWaste) return;
    const doc = new jsPDF();
    doc.text(`Waste Input History for ${selectedWaste.area_name}`, 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Time', 'Weight (kg)', 'Operator']],
      body: logs.map(log => [log.date, log.time, Number(log.weight).toFixed(2), log.operator_name]),
    });

    doc.save(`waste_history_${selectedWaste.area_name}.pdf`);
  };

  const exportToExcel = () => {
    if (!selectedWaste) return;
    const worksheetData = logs.map(log => ({
      Date: log.date,
      Time: log.time,
      'Weight (kg)': Number(log.weight).toFixed(2),
      Operator: log.operator_name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Waste History');
    XLSX.writeFile(workbook, `waste_history_${selectedWaste.area_name}.xlsx`);
  };

  const filteredData = wasteContainers.filter((item) =>
    item.latitude && item.longitude &&
    [item.container_name, item.area_name, item.deployment_date]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const mapCenter: [number, number] = [14.656, 120.982];

  if (loading) {
    return <div className="p-8 text-center">Loading map data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  // Modal Content Component
  const InfoModalContent = () => (
    <div className="space-y-5">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
            <Sparkles size={20} className="text-[#355842]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Welcome to Waste Collection!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              This interactive map helps you track and monitor all waste container locations across your area. 
              Discover real-time data, collection history, and detailed information about each container.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="text-[#355842]">✨</span> Key Features
        </h3>
        
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Interactive Map View</p>
              <p className="text-xs text-gray-600 mt-1">
                Explore container locations with zoom, pan, and click-to-view details functionality.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <History size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Collection History</p>
              <p className="text-xs text-gray-600 mt-1">
                View detailed waste input logs with dates, times, weights, and operator information.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <FileDown size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Export Reports</p>
              <p className="text-xs text-gray-600 mt-1">
                Download collection data in Excel or PDF format for your records and analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Smart Search</p>
              <p className="text-xs text-gray-600 mt-1">
                Quickly find containers by name, area, or deployment date using the search bar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-gradient-to-br from-[#355842]/5 to-[#4a7c5d]/5 rounded-xl p-5 border border-[#355842]/20">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span> How to Use
        </h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#355842] flex-shrink-0">1.</span>
            <span>Click on any marker on the map to view container details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#355842] flex-shrink-0">2.</span>
            <span>Use the search bar to filter containers by location or name</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#355842] flex-shrink-0">3.</span>
            <span>View collection history in timeline or table format</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#355842] flex-shrink-0">4.</span>
            <span>Export data for reporting and analysis purposes</span>
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="text-center pt-3">
        <p className="text-xs text-gray-500">
          Need help? Contact your system administrator for support.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-2 lg:p-3">
      {/* Main Layout - Left Sidebar and Right Map */}
      <div className="flex gap-4 h-[calc(100vh-240px)]">
        {/* Left Side - Search and Legends */}
        <div className="w-80 flex flex-col gap-3">
          {/* Search Box */}
          <div className="bg-white rounded-xl shadow-md p-3">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by container, area..."
              className="w-full"
            />
          </div>

          {/* Legends */}
          <div className="bg-white rounded-xl shadow-md p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              Map Legends
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-[#355842] rounded-lg flex items-center justify-center shadow-sm">
                  <Trash2 size={18} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Active Container</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Placeholder 1</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Placeholder 2</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-red-500 rounded-lg shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Placeholder 3</span>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#355842]">{filteredData.length}</span> container{filteredData.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Info Section with Lily */}
            <div className="mt-auto pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowInfoModal(true)}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-[#355842] to-[#4a7c5d] hover:from-[#2d4a37] hover:to-[#3d6a4d] rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg group"
              >
                <div className="relative">
                  <img 
                    src={lilyImage}
                    alt="Lily Mascot" 
                    className="w-12 h-12 rounded-full bg-white p-0.5 object-cover"
                  />
                  <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm flex items-center gap-1">
                    Learn About This Tab
                    <span className="text-xs opacity-75">✨</span>
                  </p>
                  <p className="text-white/80 text-xs">Click me to know more!</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border-2 border-[#355842] shadow-lg">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredData.map((item) => (
              <Marker
                key={item.container_id}
                position={[item.latitude, item.longitude]}
                icon={wasteIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedWaste(item);
                  },
                }}
              >
                <Tooltip>
                  <div className="w-72 p-2">
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#355842]">
                          <path d="M9 2L8 3H4V5H20V3H16L15 2H9ZM5 7V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V7H5ZM9 9H11V21H9V9ZM13 9H15V21H13V9Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-x-2">
                          <p className="font-semibold text-[#355842] text-sm truncate flex items-center">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            {item.area_name}
                          </p>
                          <p className="text-xs text-[#355842]/90 text-right font-medium">
                            {item.status}
                          </p>
                        </div>
                        <p className="font-semibold text-[#355842] text-lg text-left truncate mt-2">
                          {item.container_name}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 pt-2 mt-2 border-t border-gray-200">
                      Click marker for more details
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {filteredData.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <p className="text-center text-gray-500 italic">
                No waste containers found.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Waste Collection Hub"
        subtitle="Your Guide to Smart Waste Management"
      >
        <InfoModalContent />
      </InfoModal>

      {/* Container Details Modal */}
      {selectedWaste && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b bg-white">
              <h2 className="text-xl font-bold text-gray-800">{selectedWaste.container_name}</h2>
              <p className="text-sm text-gray-500">{selectedWaste.area_name}</p>
            </div>
            <button
              onClick={() => setSelectedWaste(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1 shadow-sm"
            >
              <X size={24} />
            </button>
            <CustomScrollbar className="p-6 bg-white" maxHeight="max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full"><Trash2 size={18} className="text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800">{selectedWaste.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-full"><Calendar size={18} className="text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Deployment Date</p>
                    <p className="font-semibold text-gray-800">{selectedWaste.deployment_date}</p>
                  </div>
                </div>
              </div>

              {/* Logs Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-[#355842] flex items-center gap-2">
                    <History size={16} /> Waste Input History
                  </h3>
                  <button 
                    onClick={() => setLogViewMode(logViewMode === 'timeline' ? 'table' : 'timeline')}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    {logViewMode === 'timeline' ? <Table size={14} /> : <List size={14} />}
                    <span>View as {logViewMode === 'timeline' ? 'Table' : 'Timeline'}</span>
                  </button>
                </div>

                {/* Conditional Rendering for Timeline or Table */}
                {logViewMode === 'timeline' ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 border-l-2 border-gray-200/80 ml-2">
                    {logsLoading ? ( <p className="text-sm text-gray-500 text-center">Loading logs...</p> ) 
                    : logs.length > 0 ? (
                      logs.map((log) => (
                        <div key={log.input_id} className="relative pl-6">
                          <div className="absolute left-[-7px] top-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Weight size={14} /> 
                            <span className="font-bold">{Number(log.weight).toFixed(2)} kg</span> collected by {log.operator_name}
                          </p>
                          <p className="text-xs text-gray-500">{log.date} at {log.time}</p>
                        </div>
                      ))
                    ) : ( <p className="text-sm text-gray-500 pl-4">No waste input history for this area.</p> )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-end gap-2 mb-2">
                      <button onClick={exportToExcel} className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition-colors">
                        <FileDown size={14} /> Excel
                      </button>
                      <button onClick={exportToPDF} className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors">
                        <Printer size={14} /> PDF
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase sticky top-0">
                          <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Weight (kg)</th>
                            <th className="px-4 py-2">Operator</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {logsLoading ? (
                            <tr><td colSpan={4} className="text-center p-4 text-gray-500">Loading logs...</td></tr>
                          ) : logs.length > 0 ? (
                            logs.map(log => (
                              <tr key={log.input_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-800">{log.date}</td>
                                <td className="px-4 py-2 text-gray-800">{log.time}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{Number(log.weight).toFixed(2)}</td>
                                <td className="px-4 py-2 text-gray-800">{log.operator_name}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={4} className="text-center p-4 text-gray-500">No waste input history.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#355842] mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Container Location
                </h3>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <WasteCollectionMap
                    latitude={selectedWaste.latitude}
                    longitude={selectedWaste.longitude}
                    area={selectedWaste.area_name}
                    interactive={false}
                  />
                </div>
              </div>
            </CustomScrollbar>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteCollectionTab;
