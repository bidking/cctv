import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Hacker Icon
const hackerIcon = L.divIcon({
  className: 'custom-hacker-marker',
  html: `<div class="w-4 h-4 bg-neon-green rounded-full border-2 border-black shadow-[0_0_10px_#00ff41] animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface CCTVMapProps {
  streams: any[];
}

export const CCTVMap: React.FC<CCTVMapProps> = ({ streams }) => {
  // Center of Bogor/Cibinong area
  const center: [number, number] = [-6.55, 106.83];

  return (
    <div className="w-full h-full bg-neutral-900 border border-white/10 rounded overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {streams.map((stream) => (
          <Marker 
            key={stream.id} 
            position={stream.coords} 
            icon={hackerIcon}
          >
            <Popup className="hacker-popup">
              <div className="bg-neutral-900 text-neon-green p-2 font-mono text-[10px] border border-neon-green/30 rounded">
                <div className="font-bold border-b border-neon-green/20 mb-1 pb-1 uppercase">{stream.name}</div>
                <div className="text-white/60">ID: {stream.id}</div>
                <div className="text-white/60">CAT: {stream.category}</div>
                <div className="mt-2 text-[8px] text-neon-green/50">STREAMING LIVE...</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-[1001] opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Map Overlay Info */}
      <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md p-3 border border-neon-green/30 font-mono text-[10px] text-neon-green pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-[0_0_5px_#00ff41]" />
          <span className="font-bold tracking-widest">GEOSPATIAL TRACKING ACTIVE</span>
        </div>
        <div className="text-white/40">TOTAL NODES: {streams.length}</div>
        <div className="text-white/40">REGION: BOGOR_REGENCY_ID</div>
      </div>
    </div>
  );
};
