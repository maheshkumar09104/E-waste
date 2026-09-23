import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet default marker icon path bug in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Selected Pickup Location</Popup>
    </Marker>
  ) : null;
}

export const MapPicker = ({ location, onLocationSelect, interactive = true, centerMarkers = [] }) => {
  const defaultPos = location || { lat: 12.9716, lng: 77.5946 };
  const [position, setPosition] = useState(defaultPos);

  const handleSelect = (pos) => {
    setPosition(pos);
    if (onLocationSelect) {
      onLocationSelect(pos);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          handleSelect(coords);
        },
        () => {
          alert('Could not retrieve current location.');
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          Location Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </span>
        {interactive && (
          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline transition"
          >
            <Navigation className="w-3 h-3" />
            Use My Current GPS
          </button>
        )}
      </div>

      <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-700 shadow-inner relative">
        <MapContainer
          center={[defaultPos.lat, defaultPos.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {interactive ? (
            <LocationMarker position={position} setPosition={handleSelect} />
          ) : (
            <Marker position={[defaultPos.lat, defaultPos.lng]}>
              <Popup>Pickup Location</Popup>
            </Marker>
          )}

          {centerMarkers.map((center, idx) => (
            <Marker
              key={center.id || idx}
              position={[center.geo_location.lat, center.geo_location.lng]}
            >
              <Popup>
                <div className="p-1 text-slate-900">
                  <strong className="block text-sm">{center.name}</strong>
                  <span className="text-xs text-slate-600">{center.location}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
