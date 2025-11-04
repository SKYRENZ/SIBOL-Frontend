import React, { useState, useEffect } from "react";
import SearchBar from "../common/SearchBar";
import { X, MapPin, Calendar, Trash2, History, Weight, List, Table, FileDown, Printer } from "lucide-react"; // Add new icons
import WasteCollectionMap from "./WasteCollectionMap";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useWasteContainers } from "../../hooks/sibolMachine/useWasteContainers";
import { getAreaLogs } from "../../services/wasteContainerService";
import type { WasteContainer, AreaLog } from "../../services/wasteContainerService";
import wasteIcon from './wasteIcon';

// Import export libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Changed import
import * as XLSX from 'xlsx';

const WasteCollectionTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWaste, setSelectedWaste] = useState<WasteContainer | null>(null);
  const [logs, setLogs] = useState<AreaLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logViewMode, setLogViewMode] = useState<'timeline' | 'table'>('timeline'); // State for view mode
  
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
    const doc = new jsPDF(); // Create a standard jsPDF instance
    doc.text(`Waste Input History for ${selectedWaste.area_name}`, 14, 15);
    
    autoTable(doc, { // Call autoTable as a function, passing the doc
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

  const mapCenter: [number, number] = [14.656, 120.982]; // Centered on Caloocan

  if (loading) {
    return <div className="p-8 text-center">Loading map data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-sm">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by container, area..."
            className="w-full"
          />
        </div>
      </div>

      {/* Main Map View */}
      <div className="h-[65vh] w-full rounded-2xl shadow-lg overflow-hidden relative z-0 border border-gray-200/50">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
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
      </div>

      {filteredData.length === 0 && !loading && (
        <p className="col-span-full text-center text-gray-500 italic py-10">
          No waste containers found.
        </p>
      )}

      {/* Modal */}
      {selectedWaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-h-[85vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">{selectedWaste.container_name}</h2>
              <p className="text-sm text-gray-500">{selectedWaste.area_name}</p>
            </div>
            <button
              onClick={() => setSelectedWaste(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="p-6 overflow-y-auto">
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
                <WasteCollectionMap
                  latitude={selectedWaste.latitude}
                  longitude={selectedWaste.longitude}
                  area={selectedWaste.area_name}
                  interactive={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteCollectionTab;
