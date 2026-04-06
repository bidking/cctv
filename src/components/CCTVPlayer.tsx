import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CCTVPlayerProps {
  url: string;
  location: string;
}

export const CCTVPlayer: React.FC<CCTVPlayerProps> = ({ url, location }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'LOADING'>('LOADING');
  const [stats, setStats] = useState({ fps: 0, latency: 0 });

  const initPlayer = () => {
    if (!videoRef.current) return;
    
    // Cleanup existing instance before re-init
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setStatus('LOADING');
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
      });

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {
          console.warn('Auto-play blocked');
        });
        setStatus('ONLINE');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Fatal Error:', data.type, data.details);
          setStatus('OFFLINE');
          
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });

      // Stats update loop
      let lastTime = performance.now();
      let frames = 0;
      let animationId: number;

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
        animationId = requestAnimationFrame(updateStats);
      };
      animationId = requestAnimationFrame(updateStats);

      return () => {
        cancelAnimationFrame(animationId);
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari/iOS)
      videoRef.current.src = url;
      const onLoaded = () => {
        videoRef.current?.play();
        setStatus('ONLINE');
      };
      const onError = () => setStatus('OFFLINE');
      
      videoRef.current.addEventListener('loadedmetadata', onLoaded);
      videoRef.current.addEventListener('error', onError);
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
        videoRef.current?.removeEventListener('error', onError);
      };
    }
  };

  useEffect(() => {
    const cleanup = initPlayer();
    return () => {
      if (cleanup) cleanup();
    };
  }, [url]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {
        // Fallback for iOS
        if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      });
    }
  };

  const reload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
          <span>{stats.fps || '--'} FPS</span>
          <span className="w-px h-2 bg-white/10" />
          <span>{stats.latency || '--'}MS</span>
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
              onClick={(e) => reload(e)}
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

      {/* Footer Controls - Always visible on touch, hover on desktop */}
      <div className="absolute bottom-0 left-0 right-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform bg-black/60 backdrop-blur-md p-1.5 flex justify-end gap-1 z-30">
        <button 
          onClick={(e) => reload(e)}
          className="p-2 md:p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
          aria-label="Reload"
        >
          <RefreshCw size={14} className="md:w-3 md:h-3" />
        </button>
        <button 
          onClick={toggleFullscreen}
          className="p-2 md:p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
          aria-label="Fullscreen"
        >
          <Maximize2 size={14} className="md:w-3 md:h-3" />
        </button>
      </div>

      {/* Timestamp Overlay */}
      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/20 z-10 pointer-events-none uppercase">
        {new Date().toLocaleTimeString('en-GB', { hour12: false })} / {new Date().toLocaleDateString('en-GB')}
      </div>
    </motion.div>
  );
};
