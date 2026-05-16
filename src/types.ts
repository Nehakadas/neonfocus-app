export type TimerState = 'focus' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  title: string;
  pomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: number;
}

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  minutes: number;
  tasksCompleted: number;
}
