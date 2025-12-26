import React, { useRef, useEffect, useState } from 'react';
import { Channel, PlayerState } from '../types';
import { HLS_CONFIG } from '../constants';
import Hls from 'hls.js';

interface PlayerProps {
  channel: Channel | null;
  onStateChange: (state: PlayerState) => void;
  onNext: () => void;
  onPrev: () => void;
}

const Player: React.FC<PlayerProps> = ({ channel, onStateChange, onNext, onPrev }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [internalState, setInternalState] = useState<PlayerState>(PlayerState.IDLE);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  const updateState = (state: PlayerState) => {
    setInternalState(state);
    onStateChange(state);
  };

  const showControls = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (internalState === PlayerState.PLAYING) {
        setIsControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    setError(null);
    updateState(PlayerState.LOADING);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const url = channel.url;

    if (Hls.isSupported()) {
      const hls = new Hls(HLS_CONFIG);
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
        updateState(PlayerState.PLAYING);
      });

      hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('No se pudo cargar el canal. El enlace podría estar caído.');
              updateState(PlayerState.ERROR);
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        if (video.paused && !video.ended) updateState(PlayerState.BUFFERING);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        updateState(PlayerState.PLAYING);
      });
    } else {
      setError('Tu navegador no soporta HLS.');
      updateState(PlayerState.ERROR);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => updateState(PlayerState.BUFFERING);
    const handlePlaying = () => updateState(PlayerState.PLAYING);
    const handlePause = () => updateState(PlayerState.IDLE);
    const handleError = () => {
      setError('Error de reproducción en el navegador.');
      updateState(PlayerState.ERROR);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setIsMuted(v === 0);
    }
  };

  const toggleFullscreen = () => {
    const playerContainer = videoRef.current?.parentElement;
    if (!playerContainer) return;
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-500 p-8 text-center max-w-md">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-300 mb-2">Listo para transmitir</h2>
        <p className="text-sm">Selecciona un canal de la lista para comenzar la reproducción.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center group bg-black"
      onMouseMove={showControls}
      onClick={showControls}
    >
      <video 
        ref={videoRef}
        className="w-full h-full max-h-screen object-contain pointer-events-none shadow-2xl video-glow"
        playsInline
      />

      {internalState === PlayerState.BUFFERING && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-xs font-medium tracking-widest text-indigo-400 uppercase">Cargando Buffer...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold mb-2">¡Ups! Algo salió mal</h3>
          <p className="text-sm text-zinc-400 mb-6 max-w-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className={`
        absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col gap-4 transition-all duration-300
        ${isControlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <button onClick={onPrev} className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Anterior">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
                </button>
                <button 
                  onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  {internalState === PlayerState.IDLE ? (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  )}
                </button>
                <button onClick={onNext} className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Siguiente">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
             </div>

             <div className="hidden sm:flex items-center gap-3 ml-4">
               <button onClick={toggleMute} className="text-zinc-300 hover:text-white transition-colors">
                 {isMuted || volume === 0 ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                 ) : (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                 )}
               </button>
               <input 
                 type="range" 
                 min="0" max="1" step="0.01" 
                 value={isMuted ? 0 : volume} 
                 onChange={handleVolumeChange}
                 className="w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white"
               />
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-zinc-800">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Live Stream</span>
            </div>
            <button onClick={toggleFullscreen} className="p-2 text-zinc-300 hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;