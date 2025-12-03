import { createContext, useContext, type ReactNode } from 'react';
import type { Habit, Task } from '@/lib/types';
import { 
  useHabits, 
  useCreateHabit, 
  useUpdateHabit, 
  useDeleteHabit,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/hooks/use-api';

interface DataContextValue {
  habits: Habit[];
  tasks: Task[];
  isLoading: boolean;
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  addHabit: (habit: Partial<Habit>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDay: (habitId: string, dateKey: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const isLoading = habitsLoading || tasksLoading;

  // These are kept for backward compatibility but don't actually update local state
  // The React Query cache handles state management
  const setHabits = () => {
    console.warn("setHabits is deprecated, use mutations instead");
  };
  
  const setTasks = () => {
    console.warn("setTasks is deprecated, use mutations instead");
  };

  const addHabit = async (habitData: Partial<Habit>) => {
    const habit = await createHabitMutation.mutateAsync(habitData as any);
    return habit;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const habit = await updateHabitMutation.mutateAsync({ id, data: updates });
    return habit;
  };

  const deleteHabit = async (id: string) => {
    await deleteHabitMutation.mutateAsync(id);
  };

  const toggleHabitDay = async (habitId: string, dateKey: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(dateKey);
    let newCompletedDates: string[];
    
    if (isCompleted) {
      newCompletedDates = habit.completedDates.filter(d => d !== dateKey);
    } else {
      newCompletedDates = [...habit.completedDates, dateKey].sort();
    }

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkKey = checkDate.toISOString().split('T')[0];
      
      if (newCompletedDates.includes(checkKey)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    await updateHabit(habitId, {
      completedDates: newCompletedDates,
      currentStreak: streak,
      longestStreak: Math.max(habit.longestStreak, streak),
    });
  };

  const addTask = async (taskData: Partial<Task>) => {
    const task = await createTaskMutation.mutateAsync(taskData as any);
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const task = await updateTaskMutation.mutateAsync({ id, data: updates });
    return task;
  };

  const deleteTask = async (id: string) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    await updateTask(id, {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    });
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const allCompleted = subtasks.every(s => s.isCompleted);

    await updateTask(taskId, {
      subtasks,
      isCompleted: allCompleted && subtasks.length > 0 ? true : task.isCompleted,
      completedAt: allCompleted && subtasks.length > 0 && !task.isCompleted ? new Date().toISOString() : task.completedAt,
    });
  };

  const value: DataContextValue = {
    habits,
    tasks,
    isLoading,
    setHabits,
    setTasks,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
