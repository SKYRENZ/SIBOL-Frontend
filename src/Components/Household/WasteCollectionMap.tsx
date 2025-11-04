import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
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
  weight: number;
}

const WasteCollectionMap: React.FC<WasteCollectionMapProps> = ({
  latitude,
  longitude,
  area,
  weight,
}) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      style={{ height: '300px', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{area}</p>
            <p>Weight: {weight}kg</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default WasteCollectionMap;