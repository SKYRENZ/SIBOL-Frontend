import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import wasteIcon from './wasteIcon'; // Import the custom icon
import { buildOrganicPackageFeatures, buildVoronoiPackageFeatures } from '../../utils/geo';
import { BARANGAY_176_E_PACKAGE_LABELS } from './data/barangay176EPackages';

// Fix for default marker icon (can be removed if no longer needed, but safe to keep)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const WasteCollectionMap: React.FC<WasteCollectionMapProps> = ({
  latitude,
  longitude,
  area,
  interactive = true,
}) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  const fallbackCenter: [number, number] = [14.656, 120.982];
  const mapCenter: [number, number] = hasCoords ? [lat, lon] : fallbackCenter;
  const [boundary176e, setBoundary176e] = useState<BoundaryGeoJSON | null>(null);
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryGeoJSON>>({});
  const [packageFeatures, setPackageFeatures] = useState<BoundaryGeoJSON[]>([]);

  useEffect(() => {
    let isMounted = true;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchBoundary = async (query: string, attempt = 0): Promise<any | null> => {
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
      return data?.features?.[0] ?? null;
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
        // Silent fail: fall back to default marker location
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

  return (
    <MapContainer
      center={mapCenter}
      zoom={16}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
      className="z-0"
      dragging={interactive}
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
    >
      <MapAutoFit boundary={boundary176e ?? null} />
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
      {hasCoords ? (
        <Marker position={[lat, lon]} icon={wasteIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{area}</p>
            </div>
          </Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
};

export default WasteCollectionMap;