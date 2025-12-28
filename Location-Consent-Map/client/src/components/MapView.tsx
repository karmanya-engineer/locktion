import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  lat: number;
  lng: number;
  accuracy: number;
}

export default function MapView({ lat, lng, accuracy }: MapViewProps) {
  // If we don't have a valid location, default to something (e.g., center of US or 0,0)
  // But the parent should handle that.
  
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border shadow-inner bg-slate-100 relative z-0">
       <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            User Location <br /> Accuracy: {Math.round(accuracy)}m
          </Popup>
        </Marker>
        <Circle 
          center={[lat, lng]} 
          radius={accuracy} 
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
        />
      </MapContainer>
    </div>
  );
}
