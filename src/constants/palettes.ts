import { Palette, PaletteKey } from '../types';

export const PALETTES: Record<PaletteKey, Palette> = {
  emerald: {
    id: 'emerald',
    name: 'Electric Emerald',
    accent: '#10B981',
    levels: [
      '#192233', // level 0 - empty
      '#064E3B', // level 1
      '#059669', // level 2
      '#10B981', // level 3
      '#34D399', // level 4
    ],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyan',
    accent: '#06B6D4',
    levels: [
      '#192233',
      '#164E63',
      '#0891B2',
      '#06B6D4',
      '#67E8F9',
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Solar Orange',
    accent: '#F97316',
    levels: [
      '#192233',
      '#7C2D12',
      '#EA580C',
      '#F97316',
      '#FDBA74',
    ],
  },
  ocean: {
    id: 'ocean',
    name: 'Azure Blue',
    accent: '#3B82F6',
    levels: [
      '#192233',
      '#1E3A8A',
      '#2563EB',
      '#3B82F6',
      '#93C5FD',
    ],
  },
  amethyst: {
    id: 'amethyst',
    name: 'Vibrant Violet',
    accent: '#8B5CF6',
    levels: [
      '#192233',
      '#4C1D95',
      '#7C3AED',
      '#8B5CF6',
      '#C4B5FD',
    ],
  },
  ruby: {
    id: 'ruby',
    name: 'Hyper Pink',
    accent: '#F43F5E',
    levels: [
      '#192233',
      '#881337',
      '#E11D48',
      '#F43F5E',
      '#FDA4AF',
    ],
  },
  monochrome: {
    id: 'monochrome',
    name: 'Crystal Silver',
    accent: '#F8FAFC',
    levels: [
      '#192233',
      '#334155',
      '#64748B',
      '#CBD5E1',
      '#F8FAFC',
    ],
  },
};

export const AVAILABLE_ICONS = [
  { name: 'fire', label: 'Workout' },
  { name: 'run', label: 'Running' },
  { name: 'water', label: 'Hydrate' },
  { name: 'book-open-variant', label: 'Read' },
  { name: 'code-tags', label: 'Code' },
  { name: 'meditation', label: 'Mind' },
  { name: 'weather-night', label: 'Sleep' },
  { name: 'brain', label: 'Focus' },
  { name: 'food-apple', label: 'Diet' },
  { name: 'pencil', label: 'Journal' },
  { name: 'music', label: 'Music' },
  { name: 'wallet', label: 'Budget' },
  { name: 'cellphone-off', label: 'Detox' },
  { name: 'walk', label: 'Steps' },
  { name: 'star', label: 'Goal' },
  { name: 'check-circle-outline', label: 'General' },
];

export const CATEGORIES = [
  'Productivity',
  'Health & Fitness',
  'Learning & Skills',
  'Mindfulness',
  'Personal Growth',
  'Other',
];
