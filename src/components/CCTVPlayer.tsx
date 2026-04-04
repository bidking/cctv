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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group bg-black neon-border overflow-hidden rounded-sm aspect-video flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/60 backdrop-blur-sm p-2 flex justify-between items-center border-b border-neon-green/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-neon-green animate-pulse shadow-[0_0_8px_#00ff41]' : status === 'OFFLINE' ? 'bg-red-500 shadow-[0_0_8px_#ff3131]' : 'bg-yellow-500 animate-bounce'}`} />
          <span className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[150px]">
            {location}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] opacity-70">
          <span className="flex items-center gap-1"><Activity size={10} /> {stats.fps} FPS</span>
          <span className="flex items-center gap-1"><Signal size={10} /> {stats.latency}ms</span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative flex-1 bg-neutral-900 overflow-hidden crt-effect">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        
        {/* Scanline Overlay */}
        <div className="scanline" />

        {/* Status Overlays */}
        {status === 'OFFLINE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-red-500 z-20">
            <AlertCircle size={48} className="mb-2 animate-pulse" />
            <span className="text-sm font-bold tracking-tighter glitch-text">SIGNAL LOST</span>
            <button 
              onClick={reload}
              className="mt-4 px-4 py-1 border border-red-500 text-[10px] hover:bg-red-500 hover:text-black transition-colors"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        {status === 'LOADING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20">
            <RefreshCw size={32} className="animate-spin text-neon-green mb-2" />
            <span className="text-[10px] tracking-widest animate-pulse">ESTABLISHING LINK...</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 p-2 flex justify-end gap-2 z-30">
        <button 
          onClick={reload}
          className="p-1.5 hover:bg-neon-green/20 text-neon-green rounded transition-colors"
          title="Reload Stream"
        >
          <RefreshCw size={14} />
        </button>
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-neon-green/20 text-neon-green rounded transition-colors"
          title="Fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Timestamp Overlay */}
      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-neon-green/70 z-10 pointer-events-none">
        REC: {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
};
