import { formatDate } from './dateUtils';

/**
 * Checks if a given habit should appear on the given date based on its frequency string.
 *
 * Frequency formats:
 *  - 'daily'        → show every day
 *  - 'weekly:0,2,4' → show on Mon (0), Wed (2), Fri (4). 0=Mon … 6=Sun
 *  - 'custom:X'     → show every X days since creation date
 */
export const isHabitScheduledForDate = (habit: any, date: Date): boolean => {
  const freq: string = habit.frequency ?? 'daily';

  if (freq === 'daily') {
    return true;
  }

  if (freq.startsWith('weekly:')) {
    const selectedDays = freq
      .split(':')[1]
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));

    // Convert JS getDay() (0=Sun) to 0=Mon … 6=Sun
    let dow = date.getDay(); // 0 = Sunday
    dow = dow === 0 ? 6 : dow - 1; // Shift to Monday-based index
    return selectedDays.includes(dow);
  }

  if (freq.startsWith('custom:')) {
    const interval = parseInt(freq.split(':')[1], 10);
    if (isNaN(interval) || interval <= 0) return false;

    const createdAt = new Date(habit.createdAt);
    const diffDays = Math.floor(
      (date.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= 0 && diffDays % interval === 0;
  }

  // Fallback: treat unknown patterns as daily
  return true;
};

/**
 * Filters the full habits list to only those scheduled for the given date.
 */
export const getTodayHabits = (habits: any[], date: Date): any[] => {
  return habits.filter((habit) => isHabitScheduledForDate(habit, date));
};

/**
 * Calculates the current consecutive streak for a habit from its full history.
 * A streak increments for each consecutive past day the habit was completed.
 */
export const calculateStreak = (habitId: string, allHistory: any[]): number => {
  const entries = allHistory
    .filter((e) => e.habitId === habitId && e.completed)
    .map((e) => e.date)
    .sort()
    .reverse();

  if (entries.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < entries.length; i++) {
    const expected = formatDate(cursor);
    if (entries[i] === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
