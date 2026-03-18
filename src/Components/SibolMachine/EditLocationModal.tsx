import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, MapRef, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, X } from 'lucide-react';
import { getAllAreas, type Area } from '../../services/Schedule/areaService';
import { WasteIconSVG } from './WasteIconSVG';
import { buildOrganicPackageFeatures, buildVoronoiPackageFeatures } from '../../utils/geo';
import { BARANGAY_176_E_PACKAGE_LABELS } from './data/barangay176EPackages';
import { reverseGeocode, searchBoundaryGeoJSON } from '../../services/geocodeService';
import bbox from '@turf/bbox';

const BARANGAY_176_QUERIES = [
  { key: '176-e', label: 'Barangay 176-E', query: 'Barangay 176-E, Caloocan, Metro Manila, Philippines', style: { color: '#1B5E20', fillColor: '#A5D6A7' } },
  { key: '176-a', label: 'Barangay 176-A', query: 'Barangay 176-A, Caloocan, Metro Manila, Philippines', style: { color: '#2E7D32', fillColor: '#B7E1B0' } },
  { key: '176-b', label: 'Barangay 176-B', query: 'Barangay 176-B, Caloocan, Metro Manila, Philippines', style: { color: '#388E3C', fillColor: '#C8E6C9' } },
  { key: '176-c', label: 'Barangay 176-C', query: 'Barangay 176-C, Caloocan, Metro Manila, Philippines', style: { color: '#43A047', fillColor: '#D1EFD0' } },
  { key: '176-d', label: 'Barangay 176-D', query: 'Barangay 176-D, Caloocan, Metro Manila, Philippines', style: { color: '#4CAF50', fillColor: '#DDF5D8' } },
  { key: '176-f', label: 'Barangay 176-F', query: 'Barangay 176-F, Caloocan, Metro Manila, Philippines', style: { color: '#5FBF5B', fillColor: '#E6F7E3' } },
];

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (latitude: number, longitude: number, address: string) => Promise<void>;
  currentLat: number;
  currentLon: number;
  currentAddress?: string;
  containerName: string;
  loading?: boolean;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentLat,
  currentLon,
  currentAddress = '',
  containerName,
  loading = false,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const [latitude, setLatitude] = useState<number | null>(Number(currentLat));
  const [longitude, setLongitude] = useState<number | null>(Number(currentLon));
  const [address, setAddress] = useState<string>(currentAddress);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boundary, setBoundary] = useState<any | null>(null);
  const [boundaries, setBoundaries] = useState<Record<string, any>>({});
  const [packageFeatures, setPackageFeatures] = useState<any[]>([]);
  const [targetBounds, setTargetBounds] = useState<{ minLng: number; minLat: number; maxLng: number; maxLat: number } | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

  // Load areas
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setAreasLoading(true);
        const res = await getAllAreas();
        setAreas(res?.data ?? []);
      } catch (err) {
        console.error('Failed to load areas:', err);
        setAreas([]);
      } finally {
        setAreasLoading(false);
      }
    };

    if (isOpen) {
      loadAreas();
    }
  }, [isOpen]);

  // Fetch all barangay boundaries on mount
  useEffect(() => {
    let isMounted = true;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchBoundary = async (query: string, attempt = 0) => {
      try {
        const data = await searchBoundaryGeoJSON(query, 1);
        return data?.features?.[0] ?? null;
      } catch (err: any) {
        const status = Number(err?.status);
        if (attempt < 2 && (status === 429 || status >= 500)) {
          await sleep(400 + attempt * 300);
          return fetchBoundary(query, attempt + 1);
        }
        return null;
      }
    };

    const run = async () => {
      const focus = await fetchBoundary('Barangay 176-E, Caloocan, Metro Manila, Philippines');
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
      const next: Record<string, any> = {};
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

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setLatitude(Number(currentLat));
      setLongitude(Number(currentLon));
      setAddress(currentAddress);
      setSelectedArea('');
      setTargetBounds(null);
      setError(null);
    }
  }, [isOpen, currentLat, currentLon, currentAddress]);

  // Build package features from boundary
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

  if (!isOpen) return null;

  const handleAreaSelect = (areaName: string) => {
    setSelectedArea(areaName);

    const match = areas.find(a => a.Area_Name === areaName);
    if (match?.Full_Address) {
      setAddress(match.Full_Address);
    }

    // Zoom to Barangay 176-E boundary when area selected
    if (boundary) {
      try {
        const [minLng, minLat, maxLng, maxLat] = bbox(boundary);
        setTargetBounds({ minLng, minLat, maxLng, maxLat });
      } catch (err) {
        console.error('Failed to calculate bbox:', err);
      }
    }
  };

  const handleMapClick = (e: any) => {
    const { lngLat } = e;
    setLongitude(lngLat.lng);
    setLatitude(lngLat.lat);
    // Auto-populate address from coordinates
    updateAddressFromCoords(lngLat.lat, lngLat.lng);
  };

  const updateAddressFromCoords = async (latValue: number, lonValue: number) => {
    try {
      const nomData = await reverseGeocode(latValue, lonValue);
      if (nomData?.display_name) {
        setAddress(nomData.display_name);
        return;
      }

      const photonUrl = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(
        latValue
      )}&lon=${encodeURIComponent(lonValue)}&limit=1`;
      const phRes = await fetch(photonUrl, { headers: { 'User-Agent': 'SIBOL-App/1.0' } });
      if (phRes.ok) {
        const phData = await phRes.json();
        const feature = phData?.features?.[0];
        const label =
          feature?.properties?.label ||
          feature?.properties?.name ||
          [
            feature?.properties?.street,
            feature?.properties?.city,
            feature?.properties?.country,
          ]
            .filter(Boolean)
            .join(', ');
        if (label) {
          setAddress(label);
        }
      }
    } catch {
      // Silent fail for address lookup
    }
  };

  // Zoom map to target bounds when area selected
  useEffect(() => {
    if (targetBounds && mapRef.current) {
      console.log('Zooming to bounds:', targetBounds);
      // Small delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        if (mapRef.current) {
          try {
            const bounds = [
              [targetBounds.minLng, targetBounds.minLat],
              [targetBounds.maxLng, targetBounds.maxLat]
            ] as [[number, number], [number, number]];

            console.log('Calling fitBounds with:', bounds);
            mapRef.current.fitBounds(bounds, {
              padding: 60,
              duration: 1200,
              maxZoom: 15,
              easing: (t: number) => t,
            });
          } catch (err) {
            console.error('Failed to fit bounds:', err);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [targetBounds]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      setError('Please pin a location on the map');
      return;
    }

    setSaving(true);
    try {
      await onSave(latitude, longitude, address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLatitude(Number(currentLat));
    setLongitude(Number(currentLon));
    setAddress(currentAddress);
    setSelectedArea('');
    setTargetBounds(null);
    setError(null);
  };

  const isChanged =
    latitude !== Number(currentLat) ||
    longitude !== Number(currentLon) ||
    address !== currentAddress;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[95%] sm:w-[85%] md:w-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <h2 className="text-base font-bold truncate">{containerName}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving || loading}
            className="text-white hover:bg-white/20 transition-colors rounded-full p-1.5 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Area Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedArea}
                onChange={(e) => handleAreaSelect(e.target.value)}
                disabled={areasLoading || saving || loading}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#355842] focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select an area...</option>
                {Array.isArray(areas) && areas.map((area) => (
                  <option key={area.Area_id} value={area.Area_Name}>
                    {area.Area_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="rounded-lg overflow-hidden border-2 border-gray-200 h-48 relative bg-gray-100">
                {!mapboxToken && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
                    <p className="text-gray-600 text-sm">Missing Mapbox Token</p>
                  </div>
                )}
                <Map
                  ref={mapRef}
                  attributionControl={false}
                  mapboxAccessToken={mapboxToken}
                  initialViewState={{
                    longitude: longitude ?? 120.982,
                    latitude: latitude ?? 14.656,
                    zoom: 15,
                    pitch: 0,
                    bearing: 0,
                  }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  onClick={handleMapClick}
                  style={{ height: '100%', width: '100%' }}
                >
                  <NavigationControl position="top-right" />

                  {/* Show all barangay boundaries */}
                  {BARANGAY_176_QUERIES.map((b) => {
                    if (!boundaries[b.key]) return null;
                    return (
                      <Source key={`src-${b.key}`} type="geojson" data={boundaries[b.key]}>
                        <Layer
                          id={`fill-${b.key}`}
                          type="fill"
                          paint={{
                            'fill-color': b.style.fillColor,
                            'fill-opacity': 0.25,
                          }}
                        />
                        <Layer
                          id={`line-${b.key}`}
                          type="line"
                          paint={{
                            'line-color': b.style.color,
                            'line-width': 2,
                            'line-opacity': 0.9,
                          }}
                        />
                      </Source>
                    );
                  })}

                  {/* Show package features with labels */}
                  {packageFeatures.length > 0 && (
                    <Source type="geojson" data={{ type: 'FeatureCollection', features: packageFeatures } as any}>
                      <Layer
                        id="package-fill"
                        type="fill"
                        paint={{
                          'fill-color': '#E8D2B4',
                          'fill-opacity': 0.25,
                        }}
                      />
                      <Layer
                        id="package-line"
                        type="line"
                        paint={{
                          'line-color': '#8D6E63',
                          'line-width': 2,
                          'line-opacity': 0.85,
                        }}
                      />
                      <Layer
                        id="package-label"
                        type="symbol"
                        layout={{
                          'text-field': ['get', 'label'],
                          'text-size': 11,
                          'text-anchor': 'center'
                        }}
                        paint={{
                          'text-color': '#5D4037',
                          'text-halo-color': '#ffffff',
                          'text-halo-width': 1.5
                        }}
                      />
                    </Source>
                  )}

                  {latitude !== null && longitude !== null && (
                    <Marker
                      longitude={longitude}
                      latitude={latitude}
                      anchor="bottom"
                      draggable={true}
                      onDragEnd={(e) => {
                        setLongitude(e.lngLat.lng);
                        setLatitude(e.lngLat.lat);
                        updateAddressFromCoords(e.lngLat.lat, e.lngLat.lng);
                      }}
                    >
                      <div className="cursor-move transition-transform hover:scale-125 flex items-center justify-center relative">
                        <div className="absolute w-12 h-12 bg-green-500/40 rounded-full border-2 border-green-500"></div>
                        <WasteIconSVG />
                      </div>
                    </Marker>
                  )}
                </Map>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Click on the map or drag the marker to set location</p>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving || loading}
                placeholder="Address will auto-fill when you pin a location..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#355842] focus:outline-none disabled:bg-gray-100 resize-none"
              />
            </div>

            {/* Coordinates Display */}
            {latitude !== null && longitude !== null && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Latitude</p>
                  <p className="text-xs font-mono text-gray-800">{latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Longitude</p>
                  <p className="text-xs font-mono text-gray-800">{longitude.toFixed(6)}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving || loading || !isChanged}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || loading}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading || !isChanged}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocationModal;
