import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { CreateContainerRequest } from '../../services/wasteContainerService';
import { buildOrganicPackageFeatures, buildVoronoiPackageFeatures } from '../../utils/geo';
import { BARANGAY_176_E_PACKAGE_LABELS } from './data/barangay176EPackages';

interface AddWasteContainerFormProps {
  onSubmit: (payload: CreateContainerRequest & { latitude?: number; longitude?: number }) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const DEFAULT_CENTER: [number, number] = [14.656, 120.982];
// bias toward the Philippines to improve suggestion relevance/perf
const PH_CENTER = { lat: 12.879721, lon: 121.774017 };
const BARANGAY_176_E_QUERY = 'Barangay 176-E, Caloocan, Metro Manila, Philippines';
const BARANGAY_176_QUERIES = [
  { key: '176-e', label: 'Barangay 176-E', query: 'Barangay 176-E, Caloocan, Metro Manila, Philippines', style: { color: '#1B5E20', fillColor: '#A5D6A7' } },
  { key: '176-a', label: 'Barangay 176-A', query: 'Barangay 176-A, Caloocan, Metro Manila, Philippines', style: { color: '#2E7D32', fillColor: '#B7E1B0' } },
  { key: '176-b', label: 'Barangay 176-B', query: 'Barangay 176-B, Caloocan, Metro Manila, Philippines', style: { color: '#388E3C', fillColor: '#C8E6C9' } },
  { key: '176-c', label: 'Barangay 176-C', query: 'Barangay 176-C, Caloocan, Metro Manila, Philippines', style: { color: '#43A047', fillColor: '#D1EFD0' } },
  { key: '176-d', label: 'Barangay 176-D', query: 'Barangay 176-D, Caloocan, Metro Manila, Philippines', style: { color: '#4CAF50', fillColor: '#DDF5D8' } },
  { key: '176-f', label: 'Barangay 176-F', query: 'Barangay 176-F, Caloocan, Metro Manila, Philippines', style: { color: '#5FBF5B', fillColor: '#E6F7E3' } },
];

type BoundaryGeoJSON = any;

const baseBoundaryStyle = {
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.25,
};

const packageBoundaryStyle = {
  weight: 2,
  opacity: 0.85,
  fillOpacity: 0.25,
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
      map.fitBounds(bounds, { padding: [16, 16] });
      map.setMaxBounds(bounds.pad(0.05));
    }
  }, [boundary, map]);

  return null;
};

function isPointInRing(point: [number, number], ring: number[][]) {
  // point: [lon, lat]
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / ((yj - yi) || 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInPolygon(point: [number, number], polygon: number[][][]) {
  if (!polygon.length) return false;
  const [outer, ...holes] = polygon;
  if (!isPointInRing(point, outer)) return false;
  for (const hole of holes) {
    if (isPointInRing(point, hole)) return false;
  }
  return true;
}

function isPointInBoundary(point: [number, number], boundary: BoundaryGeoJSON | null) {
  if (!boundary?.geometry) return false;
  const geom = boundary.geometry;
  if (geom.type === 'Polygon') {
    return isPointInPolygon(point, geom.coordinates as number[][][]);
  }
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as number[][][][]).some((poly) => isPointInPolygon(point, poly));
  }
  return false;
}

const AddWasteContainerForm: React.FC<AddWasteContainerFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [containerName, setContainerName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boundary, setBoundary] = useState<BoundaryGeoJSON | null>(null);
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryGeoJSON>>({});
  const [lastValid, setLastValid] = useState<[number, number] | null>(null);
  const [packageFeatures, setPackageFeatures] = useState<BoundaryGeoJSON[]>([]);

  // autocomplete state
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // keyboard nav

  // map/pin state
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [markerKey, setMarkerKey] = useState<number>(0); // remount marker/map when needed

  // input refs
  const containerNameRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestionBoxStyle, setSuggestionBoxStyle] = useState<{ left: number; top: number; width: number } | null>(null);

  // autofocus container name for beginners
  useEffect(() => {
    // focus when the component mounts
    const t = setTimeout(() => containerNameRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // compute position for suggestion box (called when showing suggestions / on resize / scroll)
  const updateSuggestionBoxPos = () => {
    const el = inputRef.current;
    if (!el) {
      setSuggestionBoxStyle(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setSuggestionBoxStyle({
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY + 4, // small gap
      width: rect.width
    });
  };

  useEffect(() => {
    if (showSuggestions) updateSuggestionBoxPos();
  }, [showSuggestions, suggestions]);

  useEffect(() => {
    const handler = () => updateSuggestionBoxPos();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, []);

  // small helper to fetch suggestions from Nominatim (country-limited to PH) with Photon fallback.
// Nominatim typically returns better street-level results when countrycodes is provided.
const fetchSuggestions = async (q: string) => {
  if (!q.trim()) {
    setSuggestions([]);
    return;
  }
  try {
    // Try Nominatim first (limit to Philippines, include address-level results)
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      q
    )}&addressdetails=1&limit=10&countrycodes=ph`;
    const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'SIBOL-App/1.0' } });
    const nomData = await nomRes.json();

    let items = (nomData || []).map((r: any) => ({
      display_name: r.display_name,
      lat: String(r.lat),
      lon: String(r.lon),
    }));

    // Fallback: Photon with PH bias if Nominatim yields nothing
    if (!items.length) {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lat=${PH_CENTER.lat}&lon=${PH_CENTER.lon}`;
      const phRes = await fetch(photonUrl, { headers: { 'User-Agent': 'SIBOL-App/1.0' } });
      const phData = await phRes.json();
      items = (phData.features || []).map((f: any) => ({
        display_name:
          f.properties.label ||
          f.properties.name ||
          [f.properties.street, f.properties.city, f.properties.country].filter(Boolean).join(', '),
        lat: f.geometry.coordinates[1].toString(),
        lon: f.geometry.coordinates[0].toString(),
      }));
    }

    if (boundary?.geometry) {
      items = items.filter((s) => {
        const latNum = parseFloat(s.lat);
        const lonNum = parseFloat(s.lon);
        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return false;
        return isPointInBoundary([lonNum, latNum], boundary);
      });
    }

    setSuggestions(items);
    setSelectedIndex(-1);
  } catch (err) {
    console.error('Autocomplete error', err);
    setSuggestions([]);
    setSelectedIndex(-1);
  }
};

  // debounced input watcher
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!fullAddress.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(() => fetchSuggestions(fullAddress), 250);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [fullAddress]);

  useEffect(() => {
    let isMounted = true;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchBoundary = async (query: string, attempt = 0) => {
      try {
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
          return;
        }
        const data = await res.json();
        return data?.features?.[0] ?? null;
      } catch {
        // Silent fail: fallback to unrestricted behavior
      }
    };

    const run = async () => {
      const focus = await fetchBoundary(BARANGAY_176_E_QUERY);
      if (isMounted && focus?.geometry) {
        setBoundary(focus);
      }

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
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!boundary) {
      setPackageFeatures([]);
      return;
    }
    const voronoiFeatures = buildVoronoiPackageFeatures(boundary, BARANGAY_176_E_PACKAGE_LABELS);
    if (voronoiFeatures.length) {
      setPackageFeatures(voronoiFeatures);
      return;
    }
    const organicFeatures = buildOrganicPackageFeatures(boundary, BARANGAY_176_E_PACKAGE_LABELS);
    setPackageFeatures(organicFeatures);
  }, [boundary]);

  // keyboard navigation for suggestions
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handlePickSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const resetFields = () => {
    setContainerName('');
    setAreaName('');
    setFullAddress('');
    setLat(null);
    setLon(null);
    setLastValid(null);
    setSuggestions([]);
    setError(null);
    setMarkerKey(k => k + 1);
  };

  const handlePickSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    const nextLat = parseFloat(s.lat);
    const nextLon = parseFloat(s.lon);
    if (boundary?.geometry && !isPointInBoundary([nextLon, nextLat], boundary)) {
      setError('Selected location is outside Barangay 176. Please choose a location within the barangay.');
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }
    setError(null);
    setFullAddress(s.display_name || `${s.lat}, ${s.lon}`);
    setLat(nextLat);
    setLon(nextLon);
    setLastValid([nextLat, nextLon]);
    setShowSuggestions(false);
    setSuggestions([]);
    setMarkerKey(k => k + 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!containerName.trim() || !areaName.trim() || !fullAddress.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    const payload: CreateContainerRequest & { latitude?: number; longitude?: number } = {
      container_name: containerName.trim(),
      area_name: areaName.trim(),
      fullAddress: fullAddress.trim(),
    };
    if (lat !== null && lon !== null) {
      payload.latitude = lat;
      payload.longitude = lon;
    }

    try {
      setSubmitting(true);
      const ok = await onSubmit(payload);
      if (ok) {
        resetFields();
      } else {
        setError('Failed to create container. Check input and try again.');
      }
    } catch (err) {
      console.error('Add container error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // small leaflet marker icon to match project style
  const markerIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#355842" width="28" height="28"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/></svg>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800">Container Name <span className="text-red-500">*</span></label>
        <input
          ref={containerNameRef}
          type="text"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          className="mt-1 block w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#355842]/30 focus:border-[#355842]"
          placeholder="e.g. Block A - Container 1"
          required
          aria-label="Container Name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800">Area Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
          className="mt-1 block w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#355842]/30 focus:border-[#355842]"
          placeholder="e.g. Barangay 1"
          required
          aria-label="Area Name"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-800">Full Address <span className="text-gray-500 text-xs font-normal">(start typing to see suggestions)</span></label>
        <input
          ref={inputRef}
          type="text"
          value={fullAddress}
          onChange={(e) => { setFullAddress(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          onKeyDown={handleInputKeyDown}
          className="mt-1 block w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#355842]/30 focus:border-[#355842]"
          placeholder="Start typing address to see suggestions..."
          required
          autoComplete="off"
          aria-label="Full Address"
        />

        {/* suggestions: portal to body so they float above the map and subheader */}
        {showSuggestions && suggestions.length > 0 && suggestionBoxStyle && ReactDOM.createPortal(
          <ul
            role="listbox"
            aria-label="Address suggestions"
            style={{
              position: 'absolute',
              left: suggestionBoxStyle.left,
              top: suggestionBoxStyle.top,
              width: suggestionBoxStyle.width,
              zIndex: 999999, // very high to ensure it's above maps/subheaders
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            }}
            className="max-h-36 overflow-y-auto bg-white border rounded-md text-sm divide-y divide-gray-100"
          >
            {suggestions.slice(0, 3).map((s, i) => (
              <li
                key={i}
                role="option"
                aria-selected={selectedIndex === i}
                tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); handlePickSuggestion(s); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`px-3 py-2 cursor-pointer ${selectedIndex === i ? 'bg-[#e6f4ee] font-medium text-gray-900' : 'hover:bg-gray-50 text-gray-800'}`}
              >
                {s.display_name}
              </li>
            ))}
          </ul>,
          document.body
        )}
      </div>

      {/* Map preview & draggable marker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pin Location (drag to refine)</label>
        <div className="h-56 rounded-md overflow-hidden border">
          <MapContainer
            key={markerKey}
            center={lat && lon ? [lat, lon] : DEFAULT_CENTER}
            zoom={lat && lon ? 16 : 13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <MapAutoFit boundary={boundary} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
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
                    mouseover: () => layer.setStyle({ ...packageBoundaryStyle, weight: 3, fillOpacity: 0.35 }),
                    mouseout: () => layer.setStyle(packageBoundaryStyle),
                    click: (e: any) => {
                      e?.originalEvent?.preventDefault?.();
                      layer.setStyle({ ...packageBoundaryStyle, weight: 4, fillOpacity: 0.4 });
                      layer.openTooltip();
                    },
                  });
                }}
                interactive
              />
            ) : null}
            <Marker
              position={lat && lon ? [lat, lon] : DEFAULT_CENTER}
              icon={markerIcon as any}
              draggable
              eventHandlers={{
                dragend: (ev: any) => {
                  const m = ev.target;
                  const p = m.getLatLng();
                  if (boundary?.geometry && !isPointInBoundary([p.lng, p.lat], boundary)) {
                    setError('Pinned location must be داخل Barangay 176.');
                    if (lastValid) {
                      setLat(lastValid[0]);
                      setLon(lastValid[1]);
                      setMarkerKey(k => k + 1);
                    }
                    return;
                  }
                  setError(null);
                  setLat(p.lat);
                  setLon(p.lng);
                  setLastValid([p.lat, p.lng]);
                }
              }}
            />
          </MapContainer>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <div>Lat: {lat !== null ? lat.toFixed(6) : '–'}</div>
          <div>Lon: {lon !== null ? lon.toFixed(6) : '–'}</div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { resetFields(); onCancel(); }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
          disabled={submitting || loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-[#355842] text-white rounded-md text-sm hover:bg-[#2e4a36] disabled:opacity-60"
          disabled={submitting || loading}
        >
          {submitting || loading ? 'Saving...' : 'Save Container'}
        </button>
      </div>
    </form>
  );
};

export default AddWasteContainerForm;