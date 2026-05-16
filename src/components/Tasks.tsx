import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Target } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string, poms: number) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActive: (id: string) => void;
}

export function TaskList({ 
  tasks, 
  activeTaskId, 
  onAddTask, 
  onToggleComplete, 
  onDeleteTask, 
  onSetActive 
}: TaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newPoms, setNewPoms] = useState(1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newPoms);
    setNewTitle('');
    setNewPoms(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto h-full">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight">Focus Tasks</h2>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          {tasks.filter(t => !t.completed).length} active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          id="task-input"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What are we working on?"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-32 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/20 transition-all text-sm"
        />
        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
           <select 
             id="task-estimate"
             value={newPoms}
             onChange={(e) => setNewPoms(parseInt(e.target.value))}
             className="bg-neon-bg/80 border border-white/5 rounded-xl px-2 py-1 text-xs font-mono focus:outline-none hover:bg-white/10 transition-colors"
           >
             {[1,2,3,4,5,6,7,8].map(n => (
               <option key={n} value={n}>{n} Poms</option>
             ))}
           </select>
           <button
            id="add-task-btn"
            type="submit"
            className="bg-neon-purple p-2 rounded-xl text-white hover:shadow-glow-purple transition-all"
           >
             <Plus size={20} />
           </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] scrollbar-hide">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              id={`task-${task.id}`}
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                task.id === activeTaskId 
                  ? "bg-neon-purple/10 border-neon-purple/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20",
                task.completed && "opacity-50 grayscale-[0.5]"
              )}
              onClick={() => !task.completed && onSetActive(task.id)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button 
                  id={`complete-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className="text-slate-500 hover:text-neon-pink transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 size={22} className="text-neon-pink" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-sm font-medium truncate",
                    task.completed && "line-through text-slate-500"
                  )}>
                    {task.title}
                  </span>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: task.pomodoros }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          i < task.completedPomodoros ? "bg-neon-pink shadow-glow-pink" : "bg-white/10"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.id === activeTaskId && !task.completed && (
                  <Target size={16} className="text-neon-purple animate-pulse" />
                )}
                <button
                  id={`delete-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-600 border border-dashed border-white/10 rounded-3xl">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} />
             </div>
             <p className="text-sm font-medium">No tasks yet</p>
             <p className="text-xs uppercase tracking-widest mt-1 opacity-50">Focus on what matters</p>
          </div>
        )}
      </div>
    </div>
  );
}
