import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { DailyStats } from '../types';

interface DashboardProps {
  stats: DailyStats[];
  dailyGoal: number;
}

export function Dashboard({ stats, dailyGoal }: DashboardProps) {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayStats = stats.find(s => s.date === todayDate) || { minutes: 0, tasksCompleted: 0 };
  
  // Calculate Streak
  let streak = 0;
  const sortedStats = [...stats].sort((a, b) => b.date.localeCompare(a.date));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];

  // Simple streak logic: consecutive days with at least 1 session
  if (todayStats.minutes > 0) {
    streak = 1;
    let checkDate = yesterday;
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayStat = stats.find(s => s.date === dateStr);
      if (dayStat && dayStat.minutes > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // Check if yesterday had sessions to maintain a current potential streak
    const lastSession = sortedStats[0];
    if (lastSession && lastSession.date === yesterdayDate) {
        // Streak is preserved but doesn't include today yet
        // However, usually streak component shows "Current streak"
        // Let's just calculate based on actual consecutive activity ending today or yesterday
    }
  }

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const s = stats.find(stat => stat.date === dStr);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: s ? s.minutes : 0
    };
  });

  const progress = Math.min(100, (todayStats.minutes / (dailyGoal * 25)) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neon-card p-5 rounded-3xl border border-white/5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple">
          <Clock size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">{todayStats.minutes}</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Focus Mins</div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-neon-card p-5 rounded-3xl border border-white/5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-neon-pink/10 flex items-center justify-center text-neon-pink">
          <CheckCircle size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">{todayStats.tasksCompleted}</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Tasks Ready</div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 2 }}
        transition={{ delay: 0.2 }}
        className="bg-neon-card p-5 rounded-3xl border border-white/5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Flame size={24} className={streak > 0 ? "drop-shadow-[0_0_8px_orange]" : ""} />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">{streak}</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Day Streak</div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 3 }}
        transition={{ delay: 0.3 }}
        className="bg-neon-card p-5 rounded-3xl border border-white/5 flex flex-col justify-center"
      >
        <div className="flex justify-between items-end mb-2">
           <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Daily Goal</div>
           <div className="text-sm font-mono">{Math.round(progress)}%</div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-neon-purple shadow-glow-purple"
          />
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="md:col-span-2 lg:col-span-4 bg-neon-card p-6 rounded-3xl border border-white/5 h-[300px]"
      >
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2 text-slate-400">
             <TrendingUp size={18} />
             <h3 className="text-sm font-bold uppercase tracking-widest">Weekly Trends</h3>
           </div>
        </div>
        <div className="w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ 
                  backgroundColor: '#121214', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace'
                }}
                itemStyle={{ color: '#A855F7' }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.minutes > 0 ? '#A855F7' : 'rgba(255,255,255,0.05)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
