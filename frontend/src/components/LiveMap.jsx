import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Star, MapPin, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

// Custom Map Helper to Auto-fit or Center
function MapController({ center, radiusKm }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 12, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Leaflet default icon fix for React
delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (category, isSelected = false) => {
  let bgColor = '#16a34a'; // brand green
  let label = 'H';
  if (category === 'pg') {
    bgColor = '#2563eb'; // blue
    label = 'PG';
  } else if (category === 'hotel') {
    bgColor = '#d97706'; // amber
    label = 'HT';
  } else if (category === 'villa') {
    bgColor = '#7c3aed'; // purple
    label = 'VL';
  }

  return L.divIcon({
    className: 'custom-property-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 9999px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 2px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        cursor: pointer;
      ">
        <span>${label}</span>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
};

const userGpsIcon = L.divIcon({
  className: 'user-gps-pin',
  html: `
    <div style="position: relative; width: 20px; height: 20px;">
      <div class="gps-pulse" style="
        position: absolute;
        inset: -6px;
        background-color: #3b82f6;
        border-radius: 9999px;
        opacity: 0.4;
      "></div>
      <div style="
        width: 20px;
        height: 20px;
        background-color: #2563eb;
        border: 3px solid white;
        border-radius: 9999px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function LiveMap({ properties = [], userLocation, radiusKm, onSelectProperty, currency = 'INR' }) {
  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : properties.length > 0
      ? [properties[0].latitude, properties[0].longitude]
      : [12.9716, 77.5946]; // Default to Bangalore

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 my-4">
      
      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>PG</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>House</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span>Hotel</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={defaultCenter} radiusKm={radiusKm} />

        {/* User GPS Location Marker & Search Radius Circle */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
              <Popup>
                <div className="p-2 text-xs font-bold text-slate-900">
                  📍 You Are Here
                  <p className="text-[10px] text-slate-500 font-normal">Active GPS Location</p>
                </div>
              </Popup>
            </Marker>

            {radiusKm && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#16a34a',
                  fillColor: '#22c55e',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 8'
                }}
              />
            )}
          </>
        )}

        {/* Property Listing Markers */}
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude, prop.longitude]}
            icon={createCustomIcon(prop.category)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="w-60 overflow-hidden rounded-xl bg-white">
                <div className="h-28 w-full relative">
                  <img
                    src={prop.photos && prop.photos[0] ? prop.photos[0] : ''}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-bold text-[10px] uppercase">
                    {prop.category}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>{prop.rating || '4.8'}</span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {prop.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {prop.locality}, {prop.city}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-brand-600">
                      {formatCurrency(prop.price, currency)}
                    </span>
                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>
  );
}
