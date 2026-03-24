import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WasteContainer } from '../services/wasteContainerService';
import { WasteIconSVG } from './SibolMachine/WasteIconSVG';
import { searchBoundaryGeoJSON } from '../services/geocodeService';
import { centroid } from '@turf/turf';
import bbox from '@turf/bbox';

interface OperatorEmergencyMapProps {
  containers: WasteContainer[];
  selectedContainer?: WasteContainer | null;
  onContainerSelect?: (container: WasteContainer) => void;
}

const BARANGAY_176_QUERIES = [
  { key: '176-e', label: 'Barangay 176-E', query: 'Barangay 176-E, Caloocan, Metro Manila, Philippines', color: '#1B5E20', fillColor: '#A5D6A7' },
  { key: '176-a', label: 'Barangay 176-A', query: 'Barangay 176-A, Caloocan, Metro Manila, Philippines', color: '#2E7D32', fillColor: '#B7E1B0' },
  { key: '176-b', label: 'Barangay 176-B', query: 'Barangay 176-B, Caloocan, Metro Manila, Philippines', color: '#388E3C', fillColor: '#C8E6C9' },
  { key: '176-c', label: 'Barangay 176-C', query: 'Barangay 176-C, Caloocan, Metro Manila, Philippines', color: '#43A047', fillColor: '#D1EFD0' },
  { key: '176-d', label: 'Barangay 176-D', query: 'Barangay 176-D, Caloocan, Metro Manila, Philippines', color: '#4CAF50', fillColor: '#DDF5D8' },
  { key: '176-f', label: 'Barangay 176-F', query: 'Barangay 176-F, Caloocan, Metro Manila, Philippines', color: '#5FBF5B', fillColor: '#E6F7E3' },
];

const OperatorEmergencyMap: React.FC<OperatorEmergencyMapProps> = ({ containers, selectedContainer, onContainerSelect }) => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [boundaries, setBoundaries] = useState<Record<string, any>>({});
  const mapRef = React.useRef<MapRef | null>(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    setMapboxToken(token);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBoundaries = async () => {
      const next: Record<string, any> = {};
      for (const b of BARANGAY_176_QUERIES) {
        try {
          const data = await searchBoundaryGeoJSON(b.query, 1);
          if (!mounted) return;
          if (data?.features?.[0]) {
            next[b.key] = data.features[0];
          }
        } catch {
          // ignore boundary fetch errors
        }
      }
      if (mounted) setBoundaries(next);
    };
    loadBoundaries();
    return () => { mounted = false; };
  }, []);

  // Fit the map to Barangay 176-E when its boundary is loaded
  useEffect(() => {
    try {
      const boundary176 = boundaries['176-e'];
      if (boundary176 && mapRef.current && typeof mapRef.current.getMap === 'function') {
        const bounds = bbox(boundary176 as any); // [minX, minY, maxX, maxY]
        if (Array.isArray(bounds) && bounds.length === 4) {
          const [minX, minY, maxX, maxY] = bounds;
          const mapbox = mapRef.current.getMap();
          if (mapbox && typeof mapbox.fitBounds === 'function') {
            mapbox.fitBounds([[minX, minY], [maxX, maxY]], { padding: 48, duration: 800 });
          }
        }
      }
    } catch (e) {
      // ignore fit errors
    }
  }, [boundaries]);

  const displayedContainers = selectedContainer ? [selectedContainer] : containers;

  // Calculate map center: prefer 176-e boundary centroid, otherwise average of displayed containers
  const mapCenterAndZoom = React.useMemo(() => {
    // try 176-e
    const boundary176 = boundaries['176-e'];
    if (boundary176 && boundary176.geometry) {
      try {
        // use turf centroid from @turf/turf to compute accurate centroid
        const centroidPt = centroid(boundary176 as any);
        const [lng, lat] = centroidPt?.geometry?.coordinates ?? [120.9842, 14.5995];
        return { latitude: lat, longitude: lng, zoom: 13.2 };
      } catch (e) {
        // fallback to defaults if turf fails
        return { latitude: 14.5995, longitude: 120.9842, zoom: 12 };
      }
    }

    // fallback: average of containers
    const validContainers = displayedContainers.filter(
      c => typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
           !isNaN(c.latitude) && !isNaN(c.longitude)
    );
    if (validContainers.length === 0) {
      return { latitude: 14.5995, longitude: 120.9842, zoom: 12 };
    }
    const avgLat = validContainers.reduce((sum, c) => sum + c.latitude, 0) / validContainers.length;
    const avgLng = validContainers.reduce((sum, c) => sum + c.longitude, 0) / validContainers.length;
    return { latitude: avgLat, longitude: avgLng, zoom: 12 };
  }, [boundaries, displayedContainers]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'full': return '#dc2626'; // red
      case 'collecting': return '#ea580c'; // orange
      case 'empty': return '#16a34a'; // green
      case 'in-maintenance': return '#6b7280'; // gray
      default: return '#16a34a'; // default green
    }
  };

  const WasteIcon = ({ status }: { status?: string }) => {
    const markerColor = getStatusColor(status ?? 'empty');

    return (
      <div
        className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"
        style={{ backgroundColor: markerColor, color: '#ffffff' }}
      >
        <WasteIconSVG className="w-6 h-6" />
      </div>
    );
  };

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Map Unavailable</div>
          <div className="text-sm text-gray-400">Mapbox token not configured</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: mapCenterAndZoom.longitude,
          latitude: mapCenterAndZoom.latitude,
          zoom: mapCenterAndZoom.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" />

        {Object.keys(boundaries).length > 0 && BARANGAY_176_QUERIES.map((b) => {
          const boundary = boundaries[b.key];
          if (!boundary) return null;
          return (
            <Source key={`boundary-${b.key}`} id={`boundary-${b.key}`} type="geojson" data={boundary}>
              <Layer
                id={`fill-${b.key}`}
                type="fill"
                paint={{
                  'fill-color': b.fillColor,
                  'fill-opacity': 0.2,
                }}
              />
              <Layer
                id={`line-${b.key}`}
                type="line"
                paint={{
                  'line-color': b.color,
                  'line-width': 2,
                  'line-opacity': 0.9,
                }}
              />
            </Source>
          );
        })}

        {displayedContainers.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude)).length > 0 && (
          <Source
            id="container-areas"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: displayedContainers
                .filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
                .map(c => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
                  properties: { status: c.status }
                }))
            }}
          >
            <Layer
              id="container-area-circles"
              type="circle"
              paint={{
                'circle-color': ['match', ['downcase', ['get', 'status']],
                  'full', '#dc2626',
                  'collecting', '#ea580c',
                  'empty', '#16a34a',
                  'in-maintenance', '#6b7280',
                  '#16a34a'
                ],
                'circle-radius': 40,
                'circle-opacity': 0.25,
                'circle-stroke-color': ['match', ['downcase', ['get', 'status']],
                  'full', '#b91c1c',
                  'collecting', '#c2410c',
                  'empty', '#16a34a',
                  'in-maintenance', '#374151',
                  '#16a34a'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-opacity': 0.4,
              }}
            />
          </Source>
        )}

        {displayedContainers
          .filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude))
          .map((container) => {
            const isSelected = selectedContainer?.container_id === container.container_id;
            return (
              <Marker
                key={container.container_id}
                longitude={container.longitude}
                latitude={container.latitude}
                anchor="bottom"
              >
                <button
                  type="button"
                  onClick={() => onContainerSelect?.(container)}
                  className={`cursor-pointer relative outline-none focus:ring-2 focus:ring-green-500 ${isSelected ? 'scale-110' : ''}`}
                  aria-label={`Select container ${container.container_name || container.area_name}`}
                >
                  <WasteIcon status={container.status} />
                  <div className="absolute inset-0 rounded-full border-2 border-[#16a34a] opacity-80" />
                  {isSelected && (
                    <div className="absolute -inset-2 rounded-full border-4 border-yellow-400/80" />
                  )}
                </button>
              </Marker>
            );
          })}
      </Map>
    </div>
  );
};

export default OperatorEmergencyMap;