import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import wasteIcon from './wasteIcon'; // Import the custom icon

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

const WasteCollectionMap: React.FC<WasteCollectionMapProps> = ({
  latitude,
  longitude,
  area,
  interactive = true,
}) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
      className="z-0"
      dragging={interactive}
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={wasteIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{area}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default WasteCollectionMap;