import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types';
import { DEFAULT_HABITS } from '../constants/defaultHabits';

const STORAGE_KEY = '@pixel_streak_habits_v1';

export async function loadHabitsFromStorage(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First launch: initialize with sample habits
      await saveHabitsToStorage(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_HABITS;
  } catch (error) {
    console.error('Error loading habits from storage:', error);
    return DEFAULT_HABITS;
  }
}

export async function saveHabitsToStorage(habits: Habit[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    return true;
  } catch (error) {
    console.error('Error saving habits to storage:', error);
    return false;
  }
}

export async function exportDataJson(habits: Habit[]): Promise<string> {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'Pixel Streak',
    habits,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importDataJson(jsonString: string): Promise<{ success: boolean; habits?: Habit[]; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    let habitsArray: any = null;

    if (Array.isArray(parsed)) {
      habitsArray = parsed;
    } else if (parsed && Array.isArray(parsed.habits)) {
      habitsArray = parsed.habits;
    }

    if (!habitsArray) {
      return { success: false, error: 'Invalid file format. No habits array found.' };
    }

    // Validate habit objects
    const validated: Habit[] = habitsArray.map((h: any, idx: number) => ({
      id: h.id || `imported-${Date.now()}-${idx}`,
      name: String(h.name || 'Untitled Habit'),
      description: h.description ? String(h.description) : '',
      icon: h.icon || 'check-circle-outline',
      palette: h.palette || 'emerald',
      frequency: h.frequency || 'daily',
      customDays: Array.isArray(h.customDays) ? h.customDays : undefined,
      category: h.category || 'General',
      createdAt: h.createdAt || new Date().toISOString(),
      archived: Boolean(h.archived),
      order: typeof h.order === 'number' ? h.order : idx,
      records: typeof h.records === 'object' && h.records !== null ? h.records : {},
    }));

    await saveHabitsToStorage(validated);
    return { success: true, habits: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'JSON parse failed' };
  }
}

export async function resetToDefaultData(): Promise<Habit[]> {
  await saveHabitsToStorage(DEFAULT_HABITS);
  return DEFAULT_HABITS;
}
