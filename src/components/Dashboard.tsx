import React, { useState, useEffect } from 'react';
import { CCTVPlayer } from './CCTVPlayer';
import { CCTVMap } from './CCTVMap';
import { Terminal, Shield, Cpu, Wifi, Clock, LayoutGrid, Settings, Map as MapIcon, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CCTV_STREAMS = [
  // BOGOR KOTA (Manual)
  {
    id: 'kujang',
    category: 'BOGOR',
    name: 'TUGU KUJANG BOGOR',
    url: 'https://restreamer2.kotabogor.go.id/memfs/5a5cf878-9d9b-4400-a73a-27a5b24a6ec4_output_0.m3u8?session=DiYkH3SkSbH8ByHuTAMnQa',
    coords: [-6.6015, 106.8048] as [number, number]
  },
  {
    id: 'juanda',
    category: 'BOGOR',
    name: 'JUANDA ARAH SURKEN',
    url: 'https://restreamer3.kotabogor.go.id/memfs/f6b50f38-9184-418e-b3f9-05faaa9b387d_output_0.m3u8?session=Ev2qVgRVuiJAkdzbMbTGpi',
    coords: [-6.5944, 106.7972] as [number, number]
  },
  // SENTUL
  { id: 'sentul-1', category: 'SENTUL', name: 'SIMPANG SENTUL 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL1/video1_stream.m3u8', coords: [-6.518387, 106.836096] as [number, number] },
  { id: 'sentul-2', category: 'SENTUL', name: 'SIMPANG SENTUL 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL2/video1_stream.m3u8', coords: [-6.518387, 106.836096] as [number, number] },
  { id: 'sentul-3', category: 'SENTUL', name: 'SIMPANG SENTUL 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL3/video1_stream.m3u8', coords: [-6.518387, 106.836096] as [number, number] },
  { id: 'sentul-4', category: 'SENTUL', name: 'SIMPANG SENTUL 4', url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL4/video1_stream.m3u8', coords: [-6.518387, 106.836096] as [number, number] },
  { id: 'sentul-ptz', category: 'SENTUL', name: 'SIMPANG SENTUL PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL/video1_stream.m3u8', coords: [-6.518387, 106.836096] as [number, number] },
  // PEMDA
  { id: 'pemda-ptz', category: 'CIBINONG', name: 'SIMPANG PEMDA PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA/video1_stream.m3u8', coords: [-6.485058, 106.843667] as [number, number] },
  { id: 'pemda-1', category: 'CIBINONG', name: 'SIMPANG PEMDA 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA1/video1_stream.m3u8', coords: [-6.485058, 106.843667] as [number, number] },
  { id: 'pemda-2', category: 'CIBINONG', name: 'SIMPANG PEMDA 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA2/video1_stream.m3u8', coords: [-6.485058, 106.843667] as [number, number] },
  { id: 'pemda-3', category: 'CIBINONG', name: 'SIMPANG PEMDA 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA3/video1_stream.m3u8', coords: [-6.485058, 106.843667] as [number, number] },
  // PDAM
  { id: 'pdam-ptz', category: 'CIBINONG', name: 'SIMPANG PDAM PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM/video1_stream.m3u8', coords: [-6.482619, 106.817786] as [number, number] },
  { id: 'pdam-1', category: 'CIBINONG', name: 'SIMPANG PDAM 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM1/video1_stream.m3u8', coords: [-6.482619, 106.817786] as [number, number] },
  { id: 'pdam-2', category: 'CIBINONG', name: 'SIMPANG PDAM 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM2/video1_stream.m3u8', coords: [-6.482619, 106.817786] as [number, number] },
  { id: 'pdam-3', category: 'CIBINONG', name: 'SIMPANG PDAM 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM3/video1_stream.m3u8', coords: [-6.482619, 106.817786] as [number, number] },
  { id: 'pdam-4', category: 'CIBINONG', name: 'SIMPANG PDAM 4', url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM4/video1_stream.m3u8', coords: [-6.482619, 106.817786] as [number, number] },
  // CIBINONG
  { id: 'cibinong-ptz', category: 'CIBINONG', name: 'SIMPANG CIBINONG PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIBINONG/video1_stream.m3u8', coords: [-6.465406, 106.855573] as [number, number] },
  // CIKARET
  { id: 'cikaret-ptz', category: 'CIBINONG', name: 'SIMPANG CIKARET PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIKARET/video1_stream.m3u8', coords: [-6.477931, 106.84496] as [number, number] },
  // CIAWI
  { id: 'ciawi-ptz', category: 'CIAWI', name: 'SIMPANG CIAWI PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIAWI/video1_stream.m3u8', coords: [-6.655799, 106.847146] as [number, number] },
  { id: 'ciawi-1', category: 'CIAWI', name: 'SIMPANG CIAWI 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIAWI1/video1_stream.m3u8', coords: [-6.655799, 106.847146] as [number, number] },
  { id: 'ciawi-2', category: 'CIAWI', name: 'SIMPANG CIAWI 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIAWI2/video1_stream.m3u8', coords: [-6.655799, 106.847146] as [number, number] },
  { id: 'ciawi-3', category: 'CIAWI', name: 'SIMPANG CIAWI 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIAWI3/video1_stream.m3u8', coords: [-6.655799, 106.847146] as [number, number] },
  // GADOG
  { id: 'gadog-ptz', category: 'PUNCAK', name: 'SIMPANG GADOG PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/GADOG/video1_stream.m3u8', coords: [-6.655415, 106.859108] as [number, number] },
  { id: 'gadog-1', category: 'PUNCAK', name: 'SIMPANG GADOG 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/GADOG1/video1_stream.m3u8', coords: [-6.655415, 106.859108] as [number, number] },
  { id: 'gadog-2', category: 'PUNCAK', name: 'SIMPANG GADOG 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/GADOG2/video1_stream.m3u8', coords: [-6.655415, 106.859108] as [number, number] },
  { id: 'gadog-3', category: 'PUNCAK', name: 'SIMPANG GADOG 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/GADOG3/video1_stream.m3u8', coords: [-6.655415, 106.859108] as [number, number] },
  // KANTOR DISHUB
  { id: 'dishub-ptz', category: 'CIBINONG', name: 'SIMPANG KANTOR DISHUB PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/KANTORDISHUB/video1_stream.m3u8', coords: [-6.530293, 106.82958] as [number, number] },
  // TAMAN SAFARI
  { id: 'safari-ptz', category: 'PUNCAK', name: 'TAMAN SAFARI PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/TAMANSAFARI/video1_stream.m3u8', coords: [-6.687401, 106.94012] as [number, number] },
  // BAPPENDA
  { id: 'bappenda-ptz', category: 'CIBINONG', name: 'SIMPANG BAPPENDA PTZ', url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA/video1_stream.m3u8', coords: [-6.484866, 106.835879] as [number, number] },
  { id: 'bappenda-1', category: 'CIBINONG', name: 'SIMPANG BAPPENDA 1', url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA1/video1_stream.m3u8', coords: [-6.484866, 106.835879] as [number, number] },
  { id: 'bappenda-2', category: 'CIBINONG', name: 'SIMPANG BAPPENDA 2', url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA2/video1_stream.m3u8', coords: [-6.484866, 106.835879] as [number, number] },
  { id: 'bappenda-3', category: 'CIBINONG', name: 'SIMPANG BAPPENDA 3', url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA3/video1_stream.m3u8', coords: [-6.484866, 106.835879] as [number, number] },
];

export const Dashboard: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isBooting, setIsBooting] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP'>('GRID');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Subtler boot sequence
    const timeout = setTimeout(() => setIsBooting(false), 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  const categories = ['ALL', 'CIBINONG', 'SENTUL', 'CIAWI', 'PUNCAK', 'BOGOR'];
  const filteredStreams = activeCategory === 'ALL' 
    ? CCTV_STREAMS 
    : CCTV_STREAMS.filter(s => s.category === activeCategory);

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Shield className="text-neon-green animate-pulse" size={48} />
          <span className="text-xs tracking-[0.5em] text-neon-green">SYSTEM INITIALIZING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/5 rounded border border-white/10">
            <Shield className="text-neon-green" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              CCTV MONITOR <span className="text-neon-green opacity-50">v2.4</span>
            </h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase">Bogor District Surveillance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            <button 
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${viewMode === 'GRID' ? 'bg-neon-green text-black' : 'text-white/60 hover:text-white'}`}
            >
              <Grid size={12} />
            </button>
            <button 
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${viewMode === 'MAP' ? 'bg-neon-green text-black' : 'text-white/60 hover:text-white'}`}
            >
              <MapIcon size={12} />
            </button>
          </div>

          <div className="flex bg-white/5 p-1 rounded border border-white/10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                  activeCategory === cat 
                    ? 'bg-neon-green text-black' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/80">
            <Clock size={12} className="text-neon-green" />
            {time.toLocaleTimeString('en-GB', { hour12: false })}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStreams.map((stream) => (
              <CCTVPlayer 
                key={stream.id}
                url={stream.url}
                location={stream.name}
              />
            ))}
          </div>
        ) : (
          <div className="h-[calc(100vh-250px)] min-h-[400px]">
            <CCTVMap streams={filteredStreams} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center text-[9px] text-white/20 uppercase tracking-widest py-4 border-t border-white/5">
        <div className="flex gap-6">
          <span>Nodes: {filteredStreams.length}</span>
          <span>Status: Nominal</span>
        </div>
        <span>© 2026 (ASTRO EYE SYSTEM(</span>
      </footer>
    </div>
  );
};
