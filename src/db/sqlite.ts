/**
 * Storage layer using react-native-mmkv.
 * MMKV is a fully New Architecture (Bridgeless/Fabric) compatible key-value store
 * from Tencent, used by Discord, Shopify, and many others. It's synchronous and
 * extremely fast — perfect for habit data which is simple JSON.
 *
 * Data model:
 *  - 'habits'          → JSON array of all Habit objects
 *  - 'history'         → JSON array of all HistoryEntry objects
 */
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'habbit-good-storage' });

// ─── User Profile ─────────────────────────────────────────────────────────────

/** Returns the stored user name, or null if onboarding hasn't been completed. */
export const getUserName = (): string | null => {
  return storage.getString('userName') ?? null;
};

export const setUserName = (name: string): void => {
  storage.set('userName', name);
};

export const getProfileImage = (): string | null => {
  return storage.getString('profileImage') ?? null;
};

export const setProfileImage = (uri: string): void => {
  storage.set('profileImage', uri);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getArray = <T>(key: string): T[] => {
  const raw = storage.getString(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
};

const setArray = <T>(key: string, value: T[]): void => {
  storage.set(key, JSON.stringify(value));
};

// ─── Habits ──────────────────────────────────────────────────────────────────

export const getHabits = (): any[] => {
  return getArray('habits');
};

export const saveHabit = (habit: any): void => {
  const habits = getArray<any>('habits');
  const index = habits.findIndex((h: any) => h.id === habit.id);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...habit };
  } else {
    habits.unshift(habit);
  }
  setArray('habits', habits);
};

export const deleteHabitFromDB = (id: string): void => {
  const habits = getArray<any>('habits').filter((h: any) => h.id !== id);
  setArray('habits', habits);

  // Also clean up history for this habit
  const history = getArray<any>('history').filter((e: any) => e.habitId !== id);
  setArray('history', history);
};

// ─── History ─────────────────────────────────────────────────────────────────

export const getHistoryForDate = (date: string): any[] => {
  return getArray<any>('history').filter((e: any) => e.date === date);
};

export const getAllHistory = (): any[] => {
  return getArray<any>('history');
};

export const saveHistory = (entry: any): void => {
  const history = getArray<any>('history');
  const index = history.findIndex(
    (e: any) => e.habitId === entry.habitId && e.date === entry.date
  );
  if (index !== -1) {
    history[index] = entry;
  } else {
    history.push(entry);
  }
  setArray('history', history);
};
