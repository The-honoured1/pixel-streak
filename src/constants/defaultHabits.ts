import { Habit } from '../types';
import { formatDate } from '../utils/dateUtils';

// Helper to generate a realistic history of check-ins
function generateHistory(daysCount: number, successProbability: number, streakDays: number): Record<string, number> {
  const records: Record<string, number> = {};
  const today = new Date();

  // Ensure current streak is active
  for (let s = 0; s < streakDays; s++) {
    const d = new Date(today);
    d.setDate(today.getDate() - s);
    // Random intensity between 2 and 4 for active streak days
    records[formatDate(d)] = Math.floor(Math.random() * 3) + 2;
  }

  // Generate historical scatter
  for (let i = streakDays + 1; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (Math.random() < successProbability) {
      records[formatDate(d)] = Math.floor(Math.random() * 4) + 1;
    }
  }

  return records;
}

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Code & Build',
    description: 'Ship code or learn a new tech stack for at least 45 min',
    icon: 'code-tags',
    palette: 'emerald',
    frequency: 'daily',
    category: 'Productivity',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    order: 0,
    records: generateHistory(100, 0.75, 18),
  },
  {
    id: 'habit-2',
    name: 'Workout & Stretch',
    description: 'Strength training, cardio, or mobility session',
    icon: 'fire',
    palette: 'sunset',
    frequency: 'daily',
    category: 'Health & Fitness',
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    order: 1,
    records: generateHistory(80, 0.65, 9),
  },
  {
    id: 'habit-3',
    name: 'Deep Reading',
    description: 'Read 20+ pages of non-fiction or fiction',
    icon: 'book-open-variant',
    palette: 'amethyst',
    frequency: 'daily',
    category: 'Learning & Skills',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    order: 2,
    records: generateHistory(60, 0.8, 14),
  },
  {
    id: 'habit-4',
    name: 'Hydration Goal (3L)',
    description: 'Drink at least 3 liters of water throughout the day',
    icon: 'water',
    palette: 'ocean',
    frequency: 'daily',
    category: 'Health & Fitness',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    archived: false,
    order: 3,
    records: generateHistory(120, 0.85, 27),
  },
];
