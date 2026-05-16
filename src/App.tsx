/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Trophy } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Task, TimerState, TimerSettings, DailyStats } from './types';
import { Timer } from './components/Timer';
import { TaskList } from './components/Tasks';
import { Dashboard } from './components/Dashboard';
import { AudioEngine } from './components/AudioEngine';
import { formatTime } from './lib/utils';

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export default function App() {
  // Persistence
  const [tasks, setTasks] = useLocalStorage<Task[]>('neonfocus_tasks', []);
  const [settings, setSettings] = useLocalStorage<TimerSettings>('neonfocus_settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<DailyStats[]>('neonfocus_stats', []);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Runtime State
  const [timerState, setTimerState] = useState<TimerState>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Initialize Chime
  useEffect(() => {
    chimeRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Update timeLeft when settings change (if timer not running)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[timerState] * 60);
    }
  }, [settings, timerState, isActive]);

  // Document Title update
  useEffect(() => {
    const stateLabel = timerState === 'focus' ? 'Focus' : 'Break';
    document.title = isActive ? `(${formatTime(timeLeft)}) ${stateLabel} | NeonFocus` : 'NeonFocus';
  }, [timeLeft, timerState, isActive]);

  const updateStats = useCallback((minutes: number, taskFinished: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const existing = prev.find(s => s.date === today);
      if (existing) {
        return prev.map(s => s.date === today 
          ? { ...s, minutes: s.minutes + minutes, tasksCompleted: s.tasksCompleted + (taskFinished ? 1 : 0) }
          : s
        );
      }
      return [...prev, { date: today, minutes, tasksCompleted: taskFinished ? 1 : 0 }];
    });
  }, [setStats]);

  const switchSession = useCallback(() => {
    setIsActive(false);
    chimeRef.current?.play().catch(() => {});

    if (timerState === 'focus') {
      // Logic for focus session completion
      updateStats(settings.focus, false);
      
      if (activeTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === activeTaskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
        ));
      }

      // Check if long break is needed (e.g. after 4 poms, but let's simple switch for now)
      setTimerState('shortBreak');
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setTimerState('focus');
      setTimeLeft(settings.focus * 60);
    }
  }, [timerState, settings, activeTaskId, updateStats, setTasks]);

  // Timer Tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      switchSession();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, switchSession]);

  // Task Actions
  const handleAddTask = (title: string, pomodoros: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      pomodoros,
      completedPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  const handleToggleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (!task.completed) {
      updateStats(0, true);
    }
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  return (
    <div className="min-h-screen bg-neon-bg flex flex-col text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-pink blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <nav className="flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-purple flex items-center justify-center shadow-glow-purple">
            <span className="font-bold text-lg leading-none">N</span>
          </div>
          <span className="font-bold tracking-tighter text-xl">NeonFocus</span>
        </div>
        <div className="flex items-center gap-4">
           <button 
             id="dashboard-toggle"
             onClick={() => setIsDashboardOpen(true)}
             className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
           >
             <Trophy size={16} className="text-orange-400" />
             Stats
           </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 z-10 pt-4">
        {/* Left Column: Timer & Audio */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
          <section className="bg-neon-card rounded-[40px] border border-white/5 flex flex-col items-center justify-center min-h-[500px]">
             <Timer 
               seconds={timeLeft}
               totalSeconds={settings[timerState] * 60}
               state={timerState}
               isActive={isActive}
               onToggle={() => setIsActive(!isActive)}
               onReset={() => {
                 setIsActive(false);
                 setTimeLeft(settings[timerState] * 60);
               }}
               onSkip={switchSession}
               onOpenSettings={() => setIsSettingsOpen(true)}
               activeTaskTitle={activeTask?.title}
             />
          </section>
          
          <AudioEngine isActive={isActive && timerState === 'focus'} />
        </div>

        {/* Right Column: Tasks & Dashboard */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
           <Dashboard stats={stats} dailyGoal={4} />
           
           <div className="bg-neon-card p-8 rounded-[40px] border border-white/5 flex-1 min-h-[400px]">
             <TaskList 
               tasks={tasks}
               activeTaskId={activeTaskId}
               onAddTask={handleAddTask}
               onToggleComplete={handleToggleComplete}
               onDeleteTask={handleDeleteTask}
               onSetActive={(id) => setActiveTaskId(id)}
             />
           </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neon-card border border-white/10 p-8 rounded-3xl w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <Settings2 size={24} className="text-neon-purple" />
                   <h2 className="text-2xl font-bold">Preferences</h2>
                </div>
                <button 
                  id="close-settings"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-6">
                {(['focus', 'shortBreak', 'longBreak'] as const).map(key => (
                  <div key={key}>
                    <label className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                      {key.replace(/([A-Z])/g, ' $1')} (Minutes)
                    </label>
                    <input 
                      type="number"
                      value={settings[key]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setSettings({ ...settings, [key]: val });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/20 transition-all"
                    />
                  </div>
                ))}
              </div>

              <button 
                id="apply-settings"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-neon-purple py-4 rounded-xl mt-8 font-bold shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all"
              >
                Apply Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDashboardOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-neon-bg border-l border-white/10 z-[60] shadow-2xl p-8 overflow-y-auto"
          >
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tighter">Performance Hub</h2>
                <button 
                   id="close-dashboard"
                   onClick={() => setIsDashboardOpen(false)}
                   className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                   <X />
                </button>
             </div>
             <Dashboard stats={stats} dailyGoal={4} />
             
             <div className="mt-12 space-y-8">
                <section>
                   <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Activity Log</h3>
                   <div className="space-y-3">
                      {stats.slice().reverse().map((s) => (
                        <div key={s.date} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="font-mono text-sm">{s.date}</div>
                           <div className="flex items-center gap-6">
                              <div className="text-xs text-slate-400">
                                <span className="text-neon-purple font-bold">{s.minutes}</span> mins
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="text-neon-pink font-bold">{s.tasksCompleted}</span> tasks
                              </div>
                           </div>
                        </div>
                      ))}
                      {stats.length === 0 && <p className="text-center text-slate-600 py-8 italic">No activity recorded yet.</p>}
                   </div>
                </section>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

