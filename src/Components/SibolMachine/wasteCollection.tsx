import React, { useState, useEffect, useRef } from "react";
import type { WasteContainer, AreaLog } from "../../services/wasteContainerService";
import ReactDOM from 'react-dom';
import SearchBar from "../common/SearchBar";
import { X, MapPin, Calendar, Trash2, History, Weight, List, Table, FileDown, Printer, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import WasteCollectionMap from "./WasteCollectionMap";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useWasteContainers } from "../../hooks/sibolMachine/useWasteContainers";
import { getAreaLogs } from "../../services/wasteContainerService";
import wasteIcon from './wasteIcon';
import InfoModal from '../common/InfoModal';
import CustomScrollbar from '../common/CustomScrollbar';
import AddWasteContainerForm from './AddWasteContainerForm'; // added import
import FormModal from '../common/FormModal'; // <-- new import

// Import export libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface WasteCollectionTabProps {
  containers?: WasteContainer[];
  loading?: boolean;
  error?: string | null;
  parentSearchTerm?: string;
}

const WasteCollectionTab: React.FC<WasteCollectionTabProps> = ({ containers: propContainers, loading: propLoading, error: propError, parentSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const mapRef = useRef<any | null>(null);

  const [selectedWaste, setSelectedWaste] = useState<WasteContainer | null>(null);
  const [logs, setLogs] = useState<AreaLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logViewMode, setLogViewMode] = useState<'timeline' | 'table'>('timeline');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // replaced inline sidebar add with center modal
  const [showAddModal, setShowAddModal] = useState(false);

  // include createContainer from hook (hook already used elsewhere)
  const {
    wasteContainers: hookContainers,
    loading: hookLoading,
    error: hookError,
    fetchContainers,
    createContainer
  } = useWasteContainers();

  // prefer props when parent provided, otherwise fallback to hook values
  const wasteContainers = propContainers ?? hookContainers;
  const loading = propLoading ?? hookLoading;
  const error = propError ?? hookError;

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  // keep local search in sync with parent header search
  useEffect(() => {
    setSearchTerm(parentSearchTerm ?? '');
  }, [parentSearchTerm]);

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
          setLogs([]);
        } finally {
          setLogsLoading(false);
        }
      };
      fetchLogs();
    } else {
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

  // handler used by the inline add form in the sidebar (now used by modal)
  const handleSidebarCreate = async (payload: { container_name: string; area_name: string; fullAddress: string; }) => {
    if (!createContainer) {
      alert('Create action is not available.');
      return false;
    }
    const ok = await createContainer(payload);
    if (ok) {
      await fetchContainers();
      setShowAddModal(false); // close center modal
      alert('Waste container created.');
      return true;
    }
    alert(`Failed to create container: ${error ?? 'Unknown error'}`);
    return false;
  };

  return (
    <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-white flex flex-col">
      {/* Floating Controls - Fixed Left Sidebar */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-[1000] space-y-3 transition-all duration-300 ${sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
        {/* Search Box */}
        <div className="rounded-xl shadow-lg p-2 border-2 border-[#2E523A] bg-white/12 backdrop-blur-sm">
          {/* smaller internal padding so input is more compact */}
          <div className="rounded-md p-0">
            <div className="w-full bg-white/95 placeholder-gray-400 text-gray-800 border border-[#2E523A]/25 py-2 px-3 text-sm rounded-md shadow-sm">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by container, area..."
              />
            </div>
          </div>
        </div>
 
        {/* Legends + Add button (now opens centered modal) */}
        <div className="relative rounded-xl shadow-lg p-0 border border-gray-200 bg-white h-auto max-h-96 overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-gradient-to-r from-[#2E523A] to-[#4a7c5d] text-white rounded-t-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0" />
            </svg>
            <span className="font-semibold text-sm">Map Legends</span>
            {/* Open centered Add Container modal */}
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="ml-auto bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-md border border-white/10"
            >
              {showAddModal ? 'Close' : 'Add Container'}
            </button>
          </div>

          {/* Body: show legends (no inline add form anymore) */}
          <div className="p-4 bg-white flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-[#e7f4ec] rounded-lg flex items-center justify-center shadow-sm">
                <Trash2 size={18} className="text-[#235034]" />
              </div>
              <span className="text-sm font-medium text-gray-700">Active Container</span>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{filteredData.length}</span> container{filteredData.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
 
        {/* Info Section with Lily */}
        <div className="flex-shrink-0">
           <button
             onClick={() => setShowInfoModal(true)}
             className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-[#2E523A] to-[#4a7c5d] hover:from-[#27462f] hover:to-[#355842] rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg group text-white"
           >
            <div className="relative flex-shrink-0">
              <img 
                src="/images/lili.png"
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
         </div>
       </div>
 
      {/* Toggle Sidebar Button - left side and green themed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-[1001] bg-gradient-to-r from-[#2E523A] to-[#4a7c5d] rounded-lg shadow-lg p-2 border border-[#2E523A] hover:opacity-95 transition-all"
        style={{ marginLeft: sidebarOpen ? '320px' : '0' }}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronLeft size={20} className="text-white" /> : <ChevronRight size={20} className="text-white" />}
      </button>

      {/* Full Map */}
      {/* keep map visible under the modal (don't hide it) so tiles remain rendered */}
      <div className="flex-1 w-full h-full transition-all duration-300">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          whenReady={(mapInstance: any) => { mapRef.current = mapInstance; }}
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

      {/* Info Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Waste Collection Hub"
        subtitle="Your Guide to Smart Waste Management"
      >
        <InfoModalContent />
      </InfoModal>

      {/* Centered Add Container Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Container"
        width="500px"
      >
        <AddWasteContainerForm
          loading={loading}
          onCancel={() => setShowAddModal(false)}
          onSubmit={handleSidebarCreate}
        />
      </FormModal>

      {/* Container Details Modal - render into document.body to avoid stacking-context issues */}
      {selectedWaste &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header — same green gradient style as InfoModal; hide status when it's 'Empty' */}
              <div className="px-8 py-6 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    {/* made Lili bigger for better visibility */}
                    <img src="/images/lili.png" alt="Lili" className="w-14 h-14 rounded-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{selectedWaste.container_name}</h2>
                    <p className="text-white/90 text-sm">{selectedWaste.area_name}</p>
                    {/* show full address if available */}
                    {selectedWaste.full_address && (
                      <p className="text-white/80 text-xs mt-1 truncate">{selectedWaste.full_address}</p>
                    )}
                  </div>

                  {/* show status only when it's not 'Empty' */}
                  {selectedWaste.status && selectedWaste.status !== 'Empty' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
                      {selectedWaste.status}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedWaste(null)}
                className="absolute top-5 right-5 text-white hover:bg-white/20 transition-colors z-20 rounded-full p-2"
                aria-label="Close details"
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

                  {/* Address card - shows full address if provided by backend */}
                  {selectedWaste.full_address && (
                    <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full"><MapPin size={18} className="text-green-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Full Address</p>
                        <p className="font-semibold text-gray-800">{selectedWaste.full_address}</p>
                      </div>
                    </div>
                  )}
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
                    {/* give the modal map a key so it mounts fresh when opened */}
                    <WasteCollectionMap
                      key={selectedWaste.container_id}
                      latitude={selectedWaste.latitude}
                      longitude={selectedWaste.longitude}
                      area={selectedWaste.area_name}
                      interactive={false}
                    />
                  </div>
                </div>
              </CustomScrollbar>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default WasteCollectionTab;
