import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, SkipForward, Settings2 } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { TimerState } from '../types';

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  state: TimerState;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onOpenSettings: () => void;
  activeTaskTitle?: string;
}

export function Timer({ 
  seconds, 
  totalSeconds, 
  state, 
  isActive, 
  onToggle, 
  onReset, 
  onSkip,
  onOpenSettings,
  activeTaskTitle 
}: TimerProps) {
  const percentage = (seconds / totalSeconds) * 100;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getThemeColor = () => {
    switch (state) {
      case 'focus': return '#A855F7';
      case 'shortBreak': return '#EC4899';
      case 'longBreak': return '#EC4899';
      default: return '#A855F7';
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="flex flex-col items-center justify-center p-8 relative">
      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        {/* Background Circle */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 320 320">
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            stroke={themeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${themeColor}66)` }}
          />
        </svg>

        {/* Time Display */}
        <div className="z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs font-mono uppercase tracking-[0.2em] mb-1 opacity-50"
              style={{ color: themeColor }}
            >
              {state === 'focus' ? 'Focus Session' : state === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </motion.div>
          </AnimatePresence>
          <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums">
            {formatTime(seconds)}
          </div>
          {activeTaskTitle && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-slate-400 font-medium max-w-[150px] truncate"
            >
              Working on: <span className="text-white">{activeTaskTitle}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-12 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
        <button
          id="reset-timer"
          onClick={onReset}
          className="p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
          title="Reset Timer"
        >
          <RotateCcw size={20} />
        </button>

        <button
          id="toggle-timer"
          onClick={onToggle}
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{ 
            backgroundColor: themeColor,
            boxShadow: `0 0 20px ${themeColor}66`
          }}
        >
          {isActive ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
        </button>

        <button
          id="skip-timer"
          onClick={onSkip}
          className="p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
          title="Skip to next session"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <button
        id="settings-trigger"
        onClick={onOpenSettings}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Settings2 size={20} />
      </button>
    </div>
  );
}
