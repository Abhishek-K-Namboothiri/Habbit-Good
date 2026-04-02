import { RootState } from '../store/habitSlice';
import { formatDate } from '../utils/dateUtils';

export const calculateStreak = (habitId: string, history: any[]) => {
  const sortedHistory = history
    .filter((entry) => entry.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedHistory.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const formattedToday = formatDate(today);
  const formattedYesterday = formatDate(yesterday);

  // If the latest entry isn't today OR yesterday, the streak is broken
  const lastEntry = sortedHistory[0];
  if (lastEntry.date !== formattedToday && lastEntry.date !== formattedYesterday) {
    return 0;
  }

  // Count consecutive completions
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (habitId: string, history: any[]) => {
  const sortedHistory = history
    .filter((entry) => entry.habitId === habitId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedHistory.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].completed) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
};
