import React, { useState, useEffect } from 'react';
import { CCTVPlayer } from './CCTVPlayer';
import { CCTVMap } from './CCTVMap';
import { Terminal, Shield, Cpu, Wifi, Clock, LayoutGrid, Settings, Map as MapIcon, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CCTV_STREAMS = [
  // BOGOR KOTA
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
  // CIBINONG
  {
    id: 'ccm-1',
    category: 'CIBINONG',
    name: 'LAMPU MERAH CCM',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA/video1_stream.m3u8',
    coords: [-6.4833, 106.8444] as [number, number]
  },
  {
    id: 'ccm-2',
    category: 'CIBINONG',
    name: 'LAMPU MERAH CCM 2',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/PEMDA2/video1_stream.m3u8',
    coords: [-6.4835, 106.8446] as [number, number]
  },
  {
    id: 'flyover-cibinong',
    category: 'CIBINONG',
    name: 'FLY OVER CIBINONG',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/CIBINONG/video1_stream.m3u8',
    coords: [-6.4850, 106.8480] as [number, number]
  },
  {
    id: 'pakansari-1',
    category: 'CIBINONG',
    name: 'LAMPU MERAH PAKANSARI 1',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA/video1_stream.m3u8',
    coords: [-6.4917, 106.8333] as [number, number]
  },
  {
    id: 'pakansari-2',
    category: 'CIBINONG',
    name: 'LAMPU MERAH PAKANSARI 2',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA1/video1_stream.m3u8',
    coords: [-6.4920, 106.8335] as [number, number]
  },
  {
    id: 'pakansari-3',
    category: 'CIBINONG',
    name: 'LAMPU MERAH PAKANSARI 3',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA2/video1_stream.m3u8',
    coords: [-6.4925, 106.8340] as [number, number]
  },
  {
    id: 'pakansari-4',
    category: 'CIBINONG',
    name: 'LAMPU MERAH PAKANSARI 4',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/BAPPENDA3/video1_stream.m3u8',
    coords: [-6.4930, 106.8345] as [number, number]
  },
  {
    id: 'mcd-cibinong',
    category: 'CIBINONG',
    name: 'LAMPU MERAH MCD CIBINONG',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM/video1_stream.m3u8',
    coords: [-6.4800, 106.8400] as [number, number]
  },
  {
    id: 'pdam-cibinong-1',
    category: 'CIBINONG',
    name: 'PDAM CIBINONG 1',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM1/video1_stream.m3u8',
    coords: [-6.4780, 106.8380] as [number, number]
  },
  {
    id: 'pdam-cibinong-2',
    category: 'CIBINONG',
    name: 'PDAM CIBINONG 2',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/PDAM3/video1_stream.m3u8',
    coords: [-6.4770, 106.8370] as [number, number]
  },
  // SENTUL
  {
    id: 'sentul-interaction',
    category: 'SENTUL',
    name: 'SENTUL INTERACTION',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL/video1_stream.m3u8',
    coords: [-6.5583, 106.8667] as [number, number]
  },
  {
    id: 'sentul-1',
    category: 'SENTUL',
    name: 'SENTUL 1',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL1/video1_stream.m3u8',
    coords: [-6.5590, 106.8670] as [number, number]
  },
  {
    id: 'sentul-2',
    category: 'SENTUL',
    name: 'SENTUL 2',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL2/video1_stream.m3u8',
    coords: [-6.5600, 106.8680] as [number, number]
  },
  {
    id: 'sentul-3',
    category: 'SENTUL',
    name: 'SENTUL 3',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL3/video1_stream.m3u8',
    coords: [-6.5610, 106.8690] as [number, number]
  },
  {
    id: 'sentul-4',
    category: 'SENTUL',
    name: 'SENTUL 4',
    url: 'https://itscctv-dishub.bogorkab.go.id/stream/SENTUL4/video1_stream.m3u8',
    coords: [-6.5620, 106.8700] as [number, number]
  },
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

  const categories = ['ALL', 'CIBINONG', 'SENTUL', 'BOGOR'];
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
        <span>© 2026 ASTROLYNX EYE SYSTEM</span>
      </footer>
    </div>
  );
};
