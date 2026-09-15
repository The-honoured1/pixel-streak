import { Habit, HabitStats } from '../types';
import { formatDate, getTodayString, getYesterdayString, isTargetDay, parseDate } from './dateUtils';

export function calculateHabitStats(habit: Habit): HabitStats {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const records = habit.records || {};

  // Find all completed dates sorted ascending
  const completedDates = Object.keys(records)
    .filter(date => (records[date] || 0) > 0)
    .sort();

  const totalCompletions = completedDates.length;

  if (totalCompletions === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
      lastCompletedDate: undefined,
    };
  }

  const lastCompletedDate = completedDates[completedDates.length - 1];

  // Calculate Current Streak
  // Streak continues if completed today OR completed yesterday (giving user today to complete it)
  let currentStreak = 0;
  let checkDate = new Date();
  
  // If today isn't done, start checking from yesterday to see current active streak
  if (!records[today] || records[today] === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = formatDate(checkDate);
    
    // If it's a target day according to frequency, it MUST be completed or frozen
    if (isTargetDay(habit, dStr)) {
      if (records[dStr] && records[dStr] > 0) {
        currentStreak++;
      } else if (habit.freezeDays?.[dStr]) {
        // Frozen day: skip transparently (doesn't add to streak, doesn't break it)
      } else {
        // Streak broken
        break;
      }
    }
    // Step back one day
    checkDate.setDate(checkDate.getDate() - 1);

    // Safeguard from infinite loop (don't go before habit creation or 5 years ago)
    const earliestAllowed = new Date();
    earliestAllowed.setFullYear(earliestAllowed.getFullYear() - 5);
    if (checkDate < earliestAllowed) break;
  }

  // Calculate Longest Streak
  let longestStreak = 0;
  let tempStreak = 0;

  // Walk day-by-day from earliest completion to today
  if (completedDates.length > 0) {
    let iter = parseDate(completedDates[0]);
    const endDate = new Date();

    while (iter <= endDate) {
      const dStr = formatDate(iter);
      if (isTargetDay(habit, dStr)) {
        if (records[dStr] && records[dStr] > 0) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else if (habit.freezeDays?.[dStr]) {
          // Frozen day: skip transparently (doesn't reset streak)
        } else {
          tempStreak = 0;
        }
      }
      iter.setDate(iter.getDate() + 1);
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Calculate Completion Rate over the last 30 target days (or since creation)
  const daysToCheck = 30;
  let targetDaysCount = 0;
  let completedDaysCount = 0;
  let rateDate = new Date();

  for (let i = 0; i < daysToCheck; i++) {
    const dStr = formatDate(rateDate);
    if (isTargetDay(habit, dStr)) {
      targetDaysCount++;
      if (records[dStr] && records[dStr] > 0) {
        completedDaysCount++;
      }
    }
    rateDate.setDate(rateDate.getDate() - 1);
  }

  const completionRate = targetDaysCount > 0 
    ? Math.round((completedDaysCount / targetDaysCount) * 100) 
    : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    lastCompletedDate,
  };
}

export interface StreakTier {
  name: string;
  minStreak: number;
  color: string;
  emoji: string;
}

export const STREAK_TIERS: StreakTier[] = [
  { name: 'Supernova', minStreak: 100, color: '#f43f5e', emoji: '🌟' },
  { name: 'Inferno', minStreak: 30, color: '#ff5722', emoji: '🔥' },
  { name: 'Blaze', minStreak: 14, color: '#ff9800', emoji: '⚡' },
  { name: 'Spark', minStreak: 7, color: '#ffc107', emoji: '✨' },
  { name: 'Ember', minStreak: 1, color: '#4ade80', emoji: '🌱' },
  { name: 'Cold', minStreak: 0, color: '#6b7280', emoji: '💤' },
];

export function getStreakTier(streak: number): StreakTier {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.minStreak) {
      return tier;
    }
  }
  return STREAK_TIERS[STREAK_TIERS.length - 1];
}
