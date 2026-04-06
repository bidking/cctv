import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, RefreshCw, AlertCircle, Activity, Signal } from 'lucide-react';
import { motion } from 'framer-motion';

interface CCTVPlayerProps {
  url: string;
  location: string;
}

export const CCTVPlayer: React.FC<CCTVPlayerProps> = ({ url, location }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'LOADING'>('LOADING');
  const [stats, setStats] = useState({ fps: 0, latency: 0 });
  const [errorCount, setErrorCount] = useState(0);

  const initPlayer = () => {
    if (!videoRef.current) return;
    
    setStatus('LOADING');
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {
          // Auto-play might be blocked
          console.warn('Auto-play blocked');
        });
        setStatus('ONLINE');
        setErrorCount(0);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setStatus('OFFLINE');
          setErrorCount(prev => prev + 1);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      // Simple FPS estimation
      let lastTime = performance.now();
      let frames = 0;
      const updateStats = () => {
        const now = performance.now();
        frames++;
        if (now - lastTime >= 1000) {
          setStats({
            fps: frames,
            latency: Math.round(hls.latency * 1000) || 0
          });
          frames = 0;
          lastTime = now;
        }
        if (status === 'ONLINE') requestAnimationFrame(updateStats);
      };
      requestAnimationFrame(updateStats);

      return () => hls.destroy();
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play();
        setStatus('ONLINE');
      });
      videoRef.current.addEventListener('error', () => setStatus('OFFLINE'));
    }
  };

  useEffect(() => {
    const cleanup = initPlayer();
    return () => {
      if (cleanup) cleanup();
    };
  }, [url]);

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const reload = () => {
    initPlayer();
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative group bg-neutral-950 border border-white/10 overflow-hidden rounded aspect-video flex flex-col hover:border-neon-green/50 transition-colors"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-md p-2 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'ONLINE' ? 'bg-neon-green shadow-[0_0_4px_#00ff41]' : status === 'OFFLINE' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase truncate max-w-[180px]">
            {location}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-white/40 font-mono">
          <span>{stats.fps} FPS</span>
          <span className="w-px h-2 bg-white/10" />
          <span>{stats.latency}MS</span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          muted
          playsInline
        />
        
        {/* Subtler Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* Status Overlays */}
        {status === 'OFFLINE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white/80 z-20">
            <AlertCircle size={24} className="mb-2 text-red-500/50" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Connection Lost</span>
            <button 
              onClick={reload}
              className="mt-4 px-3 py-1 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Reconnect
            </button>
          </div>
        )}

        {status === 'LOADING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
            <div className="w-4 h-4 border-2 border-neon-green/20 border-t-neon-green rounded-full animate-spin mb-2" />
            <span className="text-[8px] tracking-[0.2em] text-white/40 uppercase">Linking...</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform bg-black/60 backdrop-blur-md p-1.5 flex justify-end gap-1 z-30">
        <button 
          onClick={reload}
          className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
        >
          <RefreshCw size={12} />
        </button>
        <button 
          onClick={toggleFullscreen}
          className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Timestamp Overlay */}
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/20 z-10 pointer-events-none uppercase">
        {new Date().toLocaleTimeString('en-GB', { hour12: false })} / {new Date().toLocaleDateString('en-GB')}
      </div>
    </motion.div>
  );
};
