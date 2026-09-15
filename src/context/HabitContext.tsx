import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Habit } from '../types';
import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
  exportDataJson,
  importDataJson,
  resetToDefaultData,
  clearAllHabitsFromStorage,
} from '../services/storageService';
import { getTodayString } from '../utils/dateUtils';
import { QUICK_STARTERS } from '../constants/defaultHabits';

interface HabitContextType {
  habits: Habit[];
  activeHabits: Habit[];
  archivedHabits: Habit[];
  loading: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'records' | 'order' | 'archived'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  toggleRecord: (habitId: string, date: string, specificLevel?: number) => Promise<void>;
  quickToggleToday: (habitId: string) => Promise<void>;
  reorderHabit: (habitId: string, direction: 'up' | 'down') => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<{ success: boolean; error?: string }>;
  resetData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loadStarterHabits: () => Promise<void>;
  freezeDay: (habitId: string, date: string) => Promise<void>;
  unfreezeDay: (habitId: string, date: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const stored = await loadHabitsFromStorage();
      setHabits(stored);
      setLoading(false);
    }
    init();
  }, []);

  const triggerHaptic = async (type: 'light' | 'medium' | 'success' = 'light') => {
    try {
      if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'medium') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignored if haptics unavailable on platform/web
    }
  };

  const updateHabitsAndStore = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    await saveHabitsToStorage(newHabits);
  };

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);
  const archivedHabits = useMemo(() => habits.filter(h => h.archived), [habits]);

  const addHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'records' | 'order' | 'archived'>) => {
    const newHabit: Habit = {
      ...data,
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      archived: false,
      order: habits.length,
      records: {},
    };
    const updated = [...habits, newHabit];
    await updateHabitsAndStore(updated);
    await triggerHaptic('success');
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => (h.id === id ? { ...h, ...updates } : h));
    await updateHabitsAndStore(updated);
    await triggerHaptic('medium');
  };

  const deleteHabit = async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    await updateHabitsAndStore(updated);
    await triggerHaptic('medium');
  };

  const toggleArchive = async (id: string) => {
    const updated = habits.map(h => (h.id === id ? { ...h, archived: !h.archived } : h));
    await updateHabitsAndStore(updated);
    await triggerHaptic('light');
  };

  const toggleRecord = async (habitId: string, date: string, specificLevel?: number) => {
    const updated = habits.map(habit => {
      if (habit.id !== habitId) return habit;

      const currentLevel = habit.records[date] || 0;
      let nextLevel = specificLevel !== undefined ? specificLevel : (currentLevel + 1) % 5;

      const updatedRecords = { ...habit.records };
      if (nextLevel === 0) {
        delete updatedRecords[date];
      } else {
        updatedRecords[date] = nextLevel;
      }

      return {
        ...habit,
        records: updatedRecords,
      };
    });

    await updateHabitsAndStore(updated);
    await triggerHaptic('light');
  };

  const quickToggleToday = async (habitId: string) => {
    const today = getTodayString();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentLevel = habit.records[today] || 0;
    const nextLevel = currentLevel > 0 ? 0 : 4;

    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const rec = { ...h.records };
      if (nextLevel === 0) {
        delete rec[today];
      } else {
        rec[today] = 4;
      }
      return { ...h, records: rec };
    });

    await updateHabitsAndStore(updated);
    await triggerHaptic(nextLevel > 0 ? 'success' : 'light');
  };

  const reorderHabit = async (habitId: string, direction: 'up' | 'down') => {
    const sorted = [...habits.filter(h => !h.archived)].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(h => h.id === habitId);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const aOrder = sorted[idx].order;
    const bOrder = sorted[swapIdx].order;

    const updated = habits.map(h => {
      if (h.id === sorted[idx].id) return { ...h, order: bOrder };
      if (h.id === sorted[swapIdx].id) return { ...h, order: aOrder };
      return h;
    });

    await updateHabitsAndStore(updated);
    await triggerHaptic('light');
  };

  const exportData = async (): Promise<string> => {
    return exportDataJson(habits);
  };

  const importData = async (json: string): Promise<{ success: boolean; error?: string }> => {
    const res = await importDataJson(json);
    if (res.success && res.habits) {
      setHabits(res.habits);
      await triggerHaptic('success');
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const resetData = async () => {
    const res = await resetToDefaultData();
    setHabits(res);
    await triggerHaptic('medium');
  };

  const clearAllData = async () => {
    await clearAllHabitsFromStorage();
    setHabits([]);
    await triggerHaptic('medium');
  };

  const loadStarterHabits = async () => {
    await clearAllHabitsFromStorage();
    const starters: Habit[] = QUICK_STARTERS.map((s, idx) => ({
      id: `habit-starter-${Date.now()}-${idx}`,
      name: s.name,
      description: '',
      icon: s.icon,
      palette: s.palette,
      frequency: 'daily' as const,
      category: 'General',
      createdAt: new Date().toISOString(),
      archived: false,
      order: idx,
      records: {},
    }));
    await saveHabitsToStorage(starters);
    setHabits(starters);
    await triggerHaptic('success');
  };

  const freezeDay = async (habitId: string, date: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      return { ...h, freezeDays: { ...(h.freezeDays || {}), [date]: true as const } };
    });
    await updateHabitsAndStore(updated);
    await triggerHaptic('light');
  };

  const unfreezeDay = async (habitId: string, date: string) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const fd = { ...(h.freezeDays || {}) };
      delete fd[date];
      return { ...h, freezeDays: fd };
    });
    await updateHabitsAndStore(updated);
    await triggerHaptic('light');
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        activeHabits,
        archivedHabits,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleArchive,
        toggleRecord,
        quickToggleToday,
        reorderHabit,
        exportData,
        importData,
        resetData,
        clearAllData,
        loadStarterHabits,
        freezeDay,
        unfreezeDay,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return ctx;
}
