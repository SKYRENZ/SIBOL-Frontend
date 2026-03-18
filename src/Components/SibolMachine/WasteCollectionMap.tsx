import React, { useEffect, useState, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import { FillLayer, LineLayer } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WasteIconSVG } from './WasteIconSVG';
import { buildOrganicPackageFeatures, buildVoronoiPackageFeatures } from '../../utils/geo';
import { BARANGAY_176_E_PACKAGE_LABELS } from './data/barangay176EPackages';
import { searchBoundaryGeoJSON } from '../../services/geocodeService';

interface WasteCollectionMapProps {
  latitude: number;
  longitude: number;
  area: string;
  interactive?: boolean;
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

const WasteCollectionMap: React.FC<WasteCollectionMapProps> = ({
  latitude,
  longitude,
  area,
  interactive = true,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const lat = Number(latitude);
  const lon = Number(longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  const fallbackCenter: [number, number] = [120.982, 14.656]; // [lng, lat] for mapbox
  const mapCenter: [number, number] = hasCoords ? [lon, lat] : fallbackCenter;

  const [boundary176e, setBoundary176e] = useState<BoundaryGeoJSON | null>(null);
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryGeoJSON>>({});
  const [packageFeatures, setPackageFeatures] = useState<BoundaryGeoJSON[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchBoundary = async (query: string, attempt = 0): Promise<any | null> => {
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
      try {
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
      } catch {
        // Silent fail
      }
    };

    run();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!boundary176e) {
      setPackageFeatures([]);
      return;
    }
    const voronoiFeatures = buildVoronoiPackageFeatures(boundary176e, BARANGAY_176_E_PACKAGE_LABELS);
    if (voronoiFeatures.length) {
      setPackageFeatures(voronoiFeatures);
    } else {
      const organicFeatures = buildOrganicPackageFeatures(boundary176e, BARANGAY_176_E_PACKAGE_LABELS);
      setPackageFeatures(organicFeatures);
    }
  }, [boundary176e]);

  // No auto-fit: stay zoomed in on the container marker in 3D

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const isMapboxEnabled = mapboxToken.length > 0;

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      {!isMapboxEnabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
          <p className="text-gray-600 font-medium px-4 text-center">Missing Mapbox Access Token.<br /><span className="text-xs">Provide VITE_MAPBOX_TOKEN in .env</span></p>
        </div>
      )}
      <Map
        ref={mapRef}
        attributionControl={false}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: mapCenter[0],
          latitude: mapCenter[1],
          zoom: 16.5,
          pitch: 60,
          bearing: -20,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        interactive={interactive}
        dragPan={interactive}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        dragRotate={interactive}
      >
        {interactive && <NavigationControl position="top-right" visualizePitch />}

        {/* 3D Buildings Layer */}
        <Layer
          id="3d-buildings"
          source="composite"
          source-layer="building"
          filter={['==', 'extrude', 'true']}
          type="fill-extrusion"
          minzoom={15}
          paint={{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6
          }}
        />

        {/* Barangay Boundaries */}
        {BARANGAY_176_QUERIES.map((b) => {
          if (!boundaries[b.key]) return null;
          return (
            <Source key={`src-${b.key}`} type="geojson" data={boundaries[b.key]}>
              <Layer
                id={`fill-${b.key}`}
                type="fill"
                paint={{
                  'fill-color': b.style.fillColor,
                  'fill-opacity': 0.25
                }}
              />
              <Layer
                id={`line-${b.key}`}
                type="line"
                paint={{
                  'line-color': b.style.color,
                  'line-width': 2,
                  'line-opacity': 0.9
                }}
              />
            </Source>
          );
        })}

        {/* Package Features inside 176-E */}
        {packageFeatures.length > 0 && (
          <Source type="geojson" data={{ type: 'FeatureCollection', features: packageFeatures } as any}>
            <Layer
              id="package-fill"
              type="fill"
              paint={{
                'fill-color': '#E8D2B4',
                'fill-opacity': 0.2
              }}
            />
            <Layer
              id="package-line"
              type="line"
              paint={{
                'line-color': '#8D6E63',
                'line-width': 2,
                'line-opacity': 0.8
              }}
            />
            <Layer
              id="package-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'label'],
                'text-size': 12,
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

        {/* Marker */}
        {hasCoords && (
          <Marker longitude={lon} latitude={lat} anchor="bottom">
            <div
              onMouseEnter={() => setShowPopup(true)}
              onMouseLeave={() => setShowPopup(false)}
              className="cursor-pointer transition-transform hover:scale-110 relative"
            >
              <WasteIconSVG />
              {showPopup && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white px-2 py-1 rounded shadow-md text-sm font-semibold whitespace-nowrap z-50">
                  {area}
                </div>
              )}
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default WasteCollectionMap;
