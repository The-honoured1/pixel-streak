import { Habit } from '../types';

export interface QuickTemplate {
  name: string;
  icon: string;
  palette: Habit['palette'];
}

export const QUICK_STARTERS: QuickTemplate[] = [
  { name: 'Workout', icon: 'fire', palette: 'sunset' },
  { name: 'Drink Water', icon: 'water', palette: 'ocean' },
  { name: 'Read Book', icon: 'book-open-variant', palette: 'amethyst' },
  { name: 'Code', icon: 'code-tags', palette: 'emerald' },
  { name: 'Meditate', icon: 'meditation', palette: 'cyberpunk' },
];

// Clean empty start - absolutely zero placeholder records
export const DEFAULT_HABITS: Habit[] = [];
