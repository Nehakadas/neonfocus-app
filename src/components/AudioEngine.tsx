import { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Moon, CloudRain, Radio } from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioEngineProps {
  isActive: boolean;
}

const SOUNDSCAPES = [
  { id: 'rain', name: 'Rainfall', icon: CloudRain, url: '/rain.mp3', color: '#60A5FA' },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: Radio, url: '/lofi-beat.mp3', color: '#A855F7' },
  { id: 'white', name: 'White Noise', icon: Moon, url: '/white-noise.mp3', color: '#94A3B8' }
];
export function AudioEngine({ isActive }: AudioEngineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    if (selectedId && !isMuted) {
      const sound = SOUNDSCAPES.find(s => s.id === selectedId);
      if (sound) {
        // Stop any currently playing track before playing the new one
        audioRef.current.pause();
        audioRef.current.src = sound.url;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(e => console.error("Audio playback error", e));
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [selectedId, isMuted, volume]);
    return () => {
      audioRef.current?.pause();
    };
  }, [selectedId, isActive, isMuted, volume]);

  return (
    <div className="flex flex-col gap-4 bg-neon-card p-6 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Music size={18} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Soundscape</h3>
        </div>
        <button 
           onClick={() => setIsMuted(!isMuted)}
           className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SOUNDSCAPES.map((sound) => (
          <button
            key={sound.id}
            onClick={() => setSelectedId(selectedId === sound.id ? null : sound.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
              selectedId === sound.id 
                ? "bg-white/10 border-white/20 shadow-glow-purple" 
                : "bg-white/5 border-transparent hover:bg-white/8"
            )}
          >
            <sound.icon size={18} style={{ color: selectedId === sound.id ? sound.color : '#64748b' }} />
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider",
              selectedId === sound.id ? "text-white" : "text-slate-500"
            )}>
              {sound.name}
            </span>
            {selectedId === sound.id && isActive && (
              <div className="ml-auto flex gap-0.5 items-end h-3">
                <div className="w-1 bg-neon-purple animate-bounce" style={{ animationDuration: '0.8s' }} />
                <div className="w-1 bg-neon-purple animate-bounce" style={{ animationDuration: '1.2s' }} />
                <div className="w-1 bg-neon-purple animate-bounce" style={{ animationDuration: '1s' }} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="px-2 mt-2">
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-purple focus:outline-none"
        />
      </div>
    </div>
  );
}
