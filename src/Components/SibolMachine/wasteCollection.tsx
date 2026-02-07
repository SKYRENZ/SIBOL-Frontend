import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import SearchBar from "../common/SearchBar";
import { X, MapPin, Calendar, Trash2, History, Weight, List, Table, FileDown, Printer, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import WasteCollectionMap from "./WasteCollectionMap";
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import wasteIcon from './wasteIcon';
import InfoModal from '../common/InfoModal';
import CustomScrollbar from '../common/CustomScrollbar';
import AddWasteContainerForm from './AddWasteContainerForm';
import FormModal from '../common/FormModal';
import { buildOrganicPackageFeatures, buildVoronoiPackageFeatures } from '../../utils/geo';
import { BARANGAY_176_E_PACKAGE_LABELS } from './data/barangay176EPackages';

// Custom Hooks
import { useWasteContainer } from '../../hooks/wasteContainer/useWasteContainer';
import { useUIState } from '../../hooks/common/useUIState';
import { useSearchFilter } from '../../hooks/common/useSearchFilter';
import { useExport } from '../../hooks/common/useExport';
import type { WasteContainer } from "../../services/wasteContainerService";

export interface WasteCollectionTabProps {
  parentSearchTerm?: string;
}

type BoundaryGeoJSON = any;

const BARANGAY_176_QUERIES = [
  { key: '176-e', label: 'Barangay 176-E', query: 'Barangay 176-E, Caloocan, Metro Manila, Philippines', style: { color: '#1B5E20', fillColor: '#A5D6A7' } },
  { key: '176-a', label: 'Barangay 176-A', query: 'Barangay 176-A, Caloocan, Metro Manila, Philippines', style: { color: '#2E7D32', fillColor: '#B7E1B0' } },
  { key: '176-b', label: 'Barangay 176-B', query: 'Barangay 176-B, Caloocan, Metro Manila, Philippines', style: { color: '#388E3C', fillColor: '#C8E6C9' } },
  { key: '176-c', label: 'Barangay 176-C', query: 'Barangay 176-C, Caloocan, Metro Manila, Philippines', style: { color: '#43A047', fillColor: '#D1EFD0' } },
  { key: '176-d', label: 'Barangay 176-D', query: 'Barangay 176-D, Caloocan, Metro Manila, Philippines', style: { color: '#4CAF50', fillColor: '#DDF5D8' } },
  { key: '176-f', label: 'Barangay 176-F', query: 'Barangay 176-F, Caloocan, Metro Manila, Philippines', style: { color: '#5FBF5B', fillColor: '#E6F7E3' } },
];

const baseBoundaryStyle = {
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.45,
};

const packageBoundaryStyle = {
  weight: 2,
  opacity: 0.85,
  fillOpacity: 0.35,
  color: '#8D6E63',
  fillColor: '#E8D2B4',
};


const MapAutoFit: React.FC<{ boundary: BoundaryGeoJSON | null }> = ({ boundary }) => {
  const map = useMap();

  useEffect(() => {
    if (!boundary) return;
    const layer = L.geoJSON(boundary as any);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [boundary, map]);

  return null;
};

const BoundaryLabel: React.FC<{
  boundary: BoundaryGeoJSON | null;
  label: string;
  hideAtZoom?: number;
}> = ({ boundary, label, hideAtZoom = 16 }) => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [zoom, setZoom] = useState<number>(map.getZoom());

  useEffect(() => {
    if (!boundary) return;
    const layer = L.geoJSON(boundary as any);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      setPosition(bounds.getCenter());
    }
  }, [boundary]);

  useEffect(() => {
    const handler = () => setZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => {
      map.off('zoomend', handler);
    };
  }, [map]);

  if (!position || zoom >= hideAtZoom) return null;

  return (
    <Marker
      position={position}
      icon={L.divIcon({
        className: 'barangay-label',
        html: `<span class="barangay-label__text">${label}</span>`,
      })}
      interactive={false}
    />
  );
};

const WasteCollectionTab: React.FC<WasteCollectionTabProps> = ({ parentSearchTerm = '' }) => {
  const mapRef = useRef<any | null>(null);
  const [boundary176e, setBoundary176e] = useState<BoundaryGeoJSON | null>(null);
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryGeoJSON>>({});
  const [boundaryLoading, setBoundaryLoading] = useState<boolean>(true);
  const [packageFeatures, setPackageFeatures] = useState<BoundaryGeoJSON[]>([]);
  const [showContainersModal, setShowContainersModal] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null);

  // ✅ 1. Redux State & Actions (via custom hook)
  const {
    containers,
    selectedContainer,
    logs,
    loading,
    logsLoading,
    error,
    selectContainer,
    addContainer,
    updateSearch,
    refresh,
  } = useWasteContainer();

  // ✅ 2. UI State (local, reusable)
  const { modals, ui, openModal, closeModal, toggleSidebar, setViewMode } = useUIState();

  // ✅ 3. Search/Filter Logic (reusable)
  const { searchTerm, setSearchTerm, filteredData } = useSearchFilter<WasteContainer>(
    containers,
    (item) => [item.container_name, item.area_name, item.deployment_date || '']
  );

  // ✅ 4. Export Logic (reusable)
  const { exportToPDF, exportToExcel } = useExport();

  // Sync parent search term
  React.useEffect(() => {
    if (parentSearchTerm) {
      setSearchTerm(parentSearchTerm);
      updateSearch(parentSearchTerm);
    }
  }, [parentSearchTerm]);

  useEffect(() => {
    let isMounted = true;

    const CACHE_PREFIX = 'sibol.boundary.';
    const TTL_MS = 7 * 24 * 60 * 60 * 1000;

    const hashString = (input: string) => {
      let hash = 5381;
      for (let i = 0; i < input.length; i += 1) {
        hash = (hash * 33) ^ input.charCodeAt(i);
      }
      return (hash >>> 0).toString(16);
    };

    const cacheKey = (query: string) => `${CACHE_PREFIX}${hashString(query)}`;

    const getCachedBoundary = (query: string): any | null => {
      try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(cacheKey(query));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { ts: number; feature: any };
        if (!parsed || typeof parsed.ts !== 'number') return null;
        if (Date.now() - parsed.ts > TTL_MS) return null;
        return parsed.feature ?? null;
      } catch {
        return null;
      }
    };

    const setCachedBoundary = (query: string, feature: any) => {
      try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(cacheKey(query), JSON.stringify({ ts: Date.now(), feature }));
      } catch {
        // ignore
      }
    };

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchBoundary = async (query: string, attempt = 0): Promise<any | null> => {
      const cached = getCachedBoundary(query);
      if (cached) return cached;

      const url = `https://nominatim.openstreetmap.org/search?format=geojson&polygon_geojson=1&limit=1&q=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      if (!res.ok) {
        if (attempt < 2 && (res.status === 429 || res.status >= 500)) {
          await sleep(400 + attempt * 300);
          return fetchBoundary(query, attempt + 1);
        }
        return null;
      }
      const data = await res.json();
      const feature = data?.features?.[0] ?? null;
      if (feature) setCachedBoundary(query, feature);
      return feature;
    };

    const run = async () => {
      try {
        setBoundaryLoading(true);
        const results: { key: string; feature: any | null }[] = [];
        for (const b of BARANGAY_176_QUERIES) {
          if (!isMounted) return;
          const feature = await fetchBoundary(b.query);
          results.push({ key: b.key, feature });
          await sleep(250);
        }
        if (!isMounted) return;
        const next: Record<string, BoundaryGeoJSON> = {};
        results.forEach((r) => {
          if (r.feature?.geometry) next[r.key] = r.feature;
        });
        setBoundaries(next);
        if (next['176-e']) setBoundary176e(next['176-e']);
        setBoundaryLoading(false);
      } catch {
        // Silent fail: fall back to default map center
        if (isMounted) setBoundaryLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!boundary176e) {
      setPackageFeatures([]);
      return;
    }
    const voronoiFeatures = buildVoronoiPackageFeatures(boundary176e, BARANGAY_176_E_PACKAGE_LABELS);
    if (voronoiFeatures.length) {
      setPackageFeatures(voronoiFeatures);
      return;
    }
    const organicFeatures = buildOrganicPackageFeatures(boundary176e, BARANGAY_176_E_PACKAGE_LABELS);
    setPackageFeatures(organicFeatures);
  }, [boundary176e]);

  useEffect(() => {
    if (!pendingSelectId || containers.length === 0) return;
    const created = containers.find((c) => c.container_id === pendingSelectId);
    if (!created) return;

    selectContainer(created);
    setPendingSelectId(null);

    const lat = Number(created.latitude);
    const lon = Number(created.longitude);
    const map = mapRef.current as any;
    if (Number.isFinite(lat) && Number.isFinite(lon) && map) {
      if (typeof map.flyTo === 'function') {
        map.flyTo([lat, lon], 17, { duration: 0.8 });
      } else if (typeof map.setView === 'function') {
        map.setView([lat, lon], 17);
      }
    }
  }, [pendingSelectId, containers, selectContainer]);

  const handleGoToContainer = (container: WasteContainer) => {
    selectContainer(container);
    setShowContainersModal(false);

    const lat = Number(container.latitude);
    const lon = Number(container.longitude);
    const map = mapRef.current as any;
    if (Number.isFinite(lat) && Number.isFinite(lon) && map) {
      if (typeof map.flyTo === 'function') {
        map.flyTo([lat, lon], 17, { duration: 0.8 });
      } else if (typeof map.setView === 'function') {
        map.setView([lat, lon], 17);
      }
    }
  };

  // Handle container creation
  const handleAddContainer = async (payload: any) => {
    const result = await addContainer(payload);
    if (result.success) {
      closeModal('add');
      if (result.data?.container_id) {
        setPendingSelectId(result.data.container_id);
      }
      refresh();
      alert('Container created successfully!');
      return true;
    } else {
      alert(`Failed: ${result.error}`);
      return false;
    }
  };

  // Handle export PDF
  const handleExportPDF = () => {
    if (!selectedContainer) return;
    
    exportToPDF(
      `Waste Input History for ${selectedContainer.area_name}`,
      ['Date', 'Time', 'Weight (kg)', 'Operator'],
      logs.map(log => [log.date, log.time, Number(log.weight).toFixed(2), log.operator_name]),
      `waste_history_${selectedContainer.area_name}`
    );
  };

  // Handle export Excel
  const handleExportExcel = () => {
    if (!selectedContainer) return;
    
    const data = logs.map(log => ({
      Date: log.date,
      Time: log.time,
      'Weight (kg)': Number(log.weight).toFixed(2),
      Operator: log.operator_name,
    }));

    exportToExcel(
      data,
      'Waste History',
      `waste_history_${selectedContainer.area_name}`
    );
  };

  const mapCenter: [number, number] = [14.656, 120.982];

  const combinedBoundary = useMemo(() => {
    const features = Object.values(boundaries).filter(Boolean);
    if (!features.length) return null;
    return { type: 'FeatureCollection', features };
  }, [boundaries]);

  if (loading && containers.length === 0) {
    return <div className="p-8 text-center">Loading map data...</div>;
  }

  if (error && containers.length === 0) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

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
    <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-white flex flex-col">
      {/* Floating Controls */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-[1000] space-y-3 transition-all duration-300 ${ui.sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
        {/* Search Box */}
        <div className="rounded-xl shadow-lg p-2 border-2 border-[#2E523A] bg-white/12 backdrop-blur-sm">
          <div className="rounded-md p-0">
            <div className="w-full bg-white/95 placeholder-gray-400 text-gray-800 border border-[#2E523A]/25 py-2 px-3 text-sm rounded-md shadow-sm">
              <SearchBar
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  updateSearch(val);
                }}
                placeholder="Search by container, area..."
              />
            </div>
          </div>
        </div>
 
        {/* Legends + Add button */}
        <div className="relative rounded-xl shadow-lg p-0 border border-gray-200 bg-white h-auto max-h-96 overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-gradient-to-r from-[#2E523A] to-[#4a7c5d] text-white rounded-t-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0" />
            </svg>
            <span className="font-semibold text-sm">Map Legends</span>
            <button
              onClick={() => modals.add ? closeModal('add') : openModal('add')}
              className="ml-auto bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-md border border-white/10"
            >
              {modals.add ? 'Close' : 'Add Container'}
            </button>
          </div>

          <div className="p-4 bg-white flex-1 overflow-y-auto space-y-3">
            <button
              onClick={() => setShowContainersModal(true)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              aria-label="View available containers"
            >
              <div className="w-8 h-8 bg-[#e7f4ec] rounded-lg flex items-center justify-center shadow-sm">
                <Trash2 size={18} className="text-[#235034]" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Active Container</span>
                <p className="text-xs text-gray-500">Tap to view all containers</p>
              </div>
            </button>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{filteredData.length}</span> container{filteredData.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
 
        {/* Info Section */}
        <div className="flex-shrink-0">
          <button
            onClick={() => openModal('info')}
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
 
      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-[1001] bg-gradient-to-r from-[#2E523A] to-[#4a7c5d] rounded-lg shadow-lg p-2 border border-[#2E523A] hover:opacity-95 transition-all"
        style={{ marginLeft: ui.sidebarOpen ? '320px' : '0' }}
        aria-label="Toggle sidebar"
      >
        {ui.sidebarOpen ? <ChevronLeft size={20} className="text-white" /> : <ChevronRight size={20} className="text-white" />}
      </button>

      {/* Map */}
      <div className="flex-1 w-full h-full transition-all duration-300">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          ref={mapRef as any}
        >
          <MapAutoFit boundary={combinedBoundary ?? boundary176e ?? null} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {BARANGAY_176_QUERIES.map((b) => (
            boundaries[b.key] ? (
              <GeoJSON
                key={b.key}
                data={boundaries[b.key]}
                style={{ ...baseBoundaryStyle, ...b.style }}
                onEachFeature={(_, layer) => {
                  const baseStyle = { ...baseBoundaryStyle, ...b.style };
                  layer.setStyle(baseStyle);
                  layer.bindTooltip(b.label, {
                    sticky: true,
                    className: 'barangay-tooltip',
                    direction: 'center',
                    opacity: 0.95,
                  });
                  layer.on({
                    mouseover: () => layer.setStyle({ ...baseStyle, weight: 3, fillOpacity: 0.55 }),
                    mouseout: () => layer.setStyle(baseStyle),
                    click: (e: any) => {
                      e?.originalEvent?.preventDefault?.();
                      layer.setStyle({ ...baseStyle, weight: 4, fillOpacity: 0.6 });
                      layer.openTooltip();
                    },
                  });
                }}
                interactive
              />
            ) : null
          ))}

          <BoundaryLabel boundary={boundary176e} label="Barangay 176-E" hideAtZoom={16} />

          {packageFeatures.length ? (
            <GeoJSON
              data={{ type: 'FeatureCollection', features: packageFeatures }}
              style={packageBoundaryStyle}
              onEachFeature={(feature, layer) => {
                const label = feature?.properties?.label || 'Package';
                layer.setStyle(packageBoundaryStyle);
                layer.bindTooltip(label, {
                  sticky: true,
                  className: 'package-tooltip',
                  direction: 'center',
                  opacity: 0.95,
                });
                layer.on({
                  mouseover: () => layer.setStyle({ ...packageBoundaryStyle, weight: 3, fillOpacity: 0.45 }),
                  mouseout: () => layer.setStyle(packageBoundaryStyle),
                  click: (e: any) => {
                    e?.originalEvent?.preventDefault?.();
                    layer.setStyle({ ...packageBoundaryStyle, weight: 4, fillOpacity: 0.5 });
                    layer.openTooltip();
                  },
                });
              }}
              interactive
            />
          ) : null}

          {filteredData
            .filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
            .map((item) => (
              <Marker
                key={item.container_id}
                position={[Number(item.latitude), Number(item.longitude)]}
                icon={wasteIcon}
                eventHandlers={{
                  click: () => selectContainer(item),
                }}
              />
            ))}
        </MapContainer>

        {boundaryLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-md border border-green-100">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-green-800 font-medium">Loading your area map…</span>
            </div>
          </div>
        )}

        {filteredData.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <p className="text-center text-gray-500 italic">No waste containers found.</p>
          </div>
        )}
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={modals.info}
        onClose={() => closeModal('info')}
        title="Waste Collection Hub"
        subtitle="Your Guide to Smart Waste Management"
      >
        <InfoModalContent />
      </InfoModal>

      {/* Add Container Modal */}
      <FormModal
        isOpen={modals.add}
        onClose={() => closeModal('add')}
        title="Add Container"
        width="500px"
      >
        <AddWasteContainerForm
          loading={loading}
          onCancel={() => closeModal('add')}
          onSubmit={handleAddContainer}
        />
      </FormModal>

      {/* Containers List Modal */}
      <FormModal
        isOpen={showContainersModal}
        onClose={() => setShowContainersModal(false)}
        title="Available Containers"
        width="640px"
      >
        <div className="space-y-3">
          {containers.length === 0 ? (
            <p className="text-sm text-gray-500">No containers available.</p>
          ) : (
            <div className="space-y-3">
              {containers.map((container) => (
                <div
                  key={container.container_id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#e7f4ec] flex items-center justify-center">
                    <Trash2 size={18} className="text-[#235034]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {container.container_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {container.area_name}
                    </p>
                    {container.full_address && (
                      <p className="text-xs text-gray-400 truncate">{container.full_address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {container.status}
                    </span>
                    <button
                      onClick={() => handleGoToContainer(container)}
                      className="text-xs font-semibold text-white bg-[#2E523A] hover:bg-[#24402b] px-3 py-1.5 rounded-md transition-colors"
                    >
                      View on map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormModal>

      {/* Container Details Modal */}
      {selectedContainer && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <img src="/images/lili.png" alt="Lili" className="w-14 h-14 rounded-full object-cover" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{selectedContainer.container_name}</h2>
                  <p className="text-white/90 text-sm">{selectedContainer.area_name}</p>
                  {selectedContainer.full_address && (
                    <p className="text-white/80 text-xs mt-1 truncate">{selectedContainer.full_address}</p>
                  )}
                </div>

                {selectedContainer.status && selectedContainer.status !== 'Empty' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
                    {selectedContainer.status}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => selectContainer(null)}
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
                    <p className="font-semibold text-gray-800">{selectedContainer.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-full"><Calendar size={18} className="text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Deployment Date</p>
                    <p className="font-semibold text-gray-800">{selectedContainer.deployment_date}</p>
                  </div>
                </div>

                {selectedContainer.full_address && (
                  <div className="sm:col-span-2 flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full"><MapPin size={18} className="text-green-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Full Address</p>
                      <p className="font-semibold text-gray-800">{selectedContainer.full_address}</p>
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
                    onClick={() => setViewMode(ui.viewMode === 'table' ? 'list' : 'table')}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    {ui.viewMode === 'list' ? <Table size={14} /> : <List size={14} />}
                    <span>View as {ui.viewMode === 'list' ? 'Table' : 'Timeline'}</span>
                  </button>
                </div>

                {ui.viewMode === 'list' ? (
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
                      <button onClick={handleExportExcel} className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition-colors">
                        <FileDown size={14} /> Excel
                      </button>
                      <button onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors">
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
                    key={selectedContainer.container_id}
                    latitude={selectedContainer.latitude}
                    longitude={selectedContainer.longitude}
                    area={selectedContainer.area_name}
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
