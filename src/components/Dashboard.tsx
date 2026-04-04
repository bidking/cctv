import React, { useState, useEffect } from 'react';
import { CCTVPlayer } from './CCTVPlayer';
import { Terminal, Shield, Cpu, Wifi, Clock, LayoutGrid, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CCTV_STREAMS = [
  {
    id: 'kujang',
    name: 'TUGU KUJANG BOGOR',
    url: 'https://restreamer2.kotabogor.go.id/memfs/5a5cf878-9d9b-4400-a73a-27a5b24a6ec4_output_0.m3u8?session=DiYkH3SkSbH8ByHuTAMnQa'
  },
  {
    id: 'juanda',
    name: 'JUANDA ARAH SURKEN',
    url: 'https://restreamer3.kotabogor.go.id/memfs/f6b50f38-9184-418e-b3f9-05faaa9b387d_output_0.m3u8?session=Ev2qVgRVuiJAkdzbMbTGpi'
  },
  {
    id: 'cibinong',
    name: 'PA CIBINONG',
    url: 'https://pacibinong.cctvbadilag.my.id/604719PACIBINONG/streams/014468970364727561929927.m3u8'
  },
  // Adding placeholders to fill the grid if needed, or just use these 3
];

export const Dashboard: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isBooting, setIsBooting] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Boot sequence simulation
    const bootLogs = [
      "INITIALIZING KERNEL...",
      "LOADING NETWORK MODULES...",
      "ESTABLISHING SECURE TUNNEL...",
      "DECRYPTING HLS STREAMS...",
      "SYSTEM READY."
    ];
    
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < bootLogs.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${bootLogs[logIndex]}`]);
        logIndex++;
      } else {
        setTimeout(() => setIsBooting(false), 1000);
        clearInterval(logInterval);
      }
    }, 400);

    return () => {
      clearInterval(timer);
      clearInterval(logInterval);
    };
  }, []);

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 font-mono p-4">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-4 text-neon-green">
            <Terminal size={20} />
            <span className="text-sm font-bold tracking-widest">SYSTEM BOOT SEQUENCE</span>
          </div>
          <div className="space-y-1">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-neon-green/80"
              >
                {log}
              </motion.div>
            ))}
          </div>
          <div className="mt-8 h-1 bg-neutral-900 overflow-hidden">
            <motion.div 
              className="h-full bg-neon-green"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neon-green/20 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-neon-green/10 rounded-lg border border-neon-green/30">
            <Shield className="text-neon-green" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-neon-green glitch-text">
              CYBER-EYE <span className="text-neon-blue">v2.4.0</span>
            </h1>
            <p className="text-[10px] text-neon-green/50 tracking-[0.2em]">CENTRAL MONITORING INTERFACE</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neon-green/20 rounded">
            <Cpu size={12} className="text-neon-blue" />
            <span className="text-neon-green/70 uppercase">CPU: 42%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neon-green/20 rounded">
            <Wifi size={12} className="text-neon-green" />
            <span className="text-neon-green/70 uppercase">NET: STABLE</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/40 rounded">
            <Clock size={12} className="text-neon-green" />
            <span className="text-neon-green font-bold">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'ACTIVE NODES', value: CCTV_STREAMS.length, color: 'text-neon-green' },
            { label: 'UPTIME', value: '142:12:04', color: 'text-neon-blue' },
            { label: 'THREAT LEVEL', value: 'LOW', color: 'text-neon-green' },
            { label: 'DATA RATE', value: '12.4 MB/S', color: 'text-neon-blue' },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-900/50 border border-neon-green/10 p-3 rounded flex flex-col gap-1">
              <span className="text-[8px] text-neon-green/40 tracking-widest">{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CCTV_STREAMS.map((stream) => (
            <CCTVPlayer 
              key={stream.id}
              url={stream.url}
              location={stream.name}
            />
          ))}
          
          {/* Empty Slots to fill 6 if desired */}
          {Array.from({ length: Math.max(0, 6 - CCTV_STREAMS.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-video bg-neutral-900/20 border border-dashed border-neon-green/10 rounded-sm flex items-center justify-center group hover:border-neon-green/30 transition-colors">
              <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <LayoutGrid size={24} />
                <span className="text-[10px] tracking-widest">NODE EMPTY</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Status */}
      <footer className="border-t border-neon-green/20 pt-4 flex justify-between items-center text-[9px] text-neon-green/40">
        <div className="flex gap-4">
          <span>SECURE_PROTOCOL: AES-256</span>
          <span>ENCRYPTION: ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span>SYSTEM_NOMINAL</span>
        </div>
      </footer>
    </div>
  );
};
