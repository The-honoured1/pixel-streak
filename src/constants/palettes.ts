import { Palette, PaletteKey } from '../types';

export const PALETTES: Record<PaletteKey, Palette> = {
  emerald: {
    id: 'emerald',
    name: 'GitHub Emerald',
    accent: '#39d353',
    levels: [
      '#161b22', // empty
      '#0e4429', // level 1
      '#006d32', // level 2
      '#26a641', // level 3
      '#39d353', // level 4
    ],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    accent: '#00f0ff',
    levels: [
      '#161b22',
      '#1a365d',
      '#0d7377',
      '#14ffec',
      '#00f0ff',
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Solar Flare',
    accent: '#ff7b00',
    levels: [
      '#161b22',
      '#542314',
      '#8f3d17',
      '#d95a00',
      '#ff7b00',
    ],
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Pacific',
    accent: '#38bdf8',
    levels: [
      '#161b22',
      '#0c4a6e',
      '#0284c7',
      '#38bdf8',
      '#7dd3fc',
    ],
  },
  amethyst: {
    id: 'amethyst',
    name: 'Void Purple',
    accent: '#c084fc',
    levels: [
      '#161b22',
      '#3b0764',
      '#6b21a8',
      '#a855f7',
      '#c084fc',
    ],
  },
  ruby: {
    id: 'ruby',
    name: 'Crimson Pulse',
    accent: '#f43f5e',
    levels: [
      '#161b22',
      '#4c0519',
      '#881337',
      '#e11d48',
      '#f43f5e',
    ],
  },
  monochrome: {
    id: 'monochrome',
    name: 'Matrix Slate',
    accent: '#f3f4f6',
    levels: [
      '#161b22',
      '#374151',
      '#6b7280',
      '#9ca3af',
      '#f3f4f6',
    ],
  },
};

export const AVAILABLE_ICONS = [
  { name: 'code-tags', label: 'Code' },
  { name: 'fire', label: 'Workout' },
  { name: 'book-open-variant', label: 'Read' },
  { name: 'water', label: 'Hydrate' },
  { name: 'meditation', label: 'Meditate' },
  { name: 'run', label: 'Running' },
  { name: 'weather-night', label: 'Sleep' },
  { name: 'brain', label: 'Mind' },
  { name: 'food-apple', label: 'Diet' },
  { name: 'pencil', label: 'Journal' },
  { name: 'music', label: 'Music' },
  { name: 'wallet', label: 'Budget' },
  { name: 'cellphone-off', label: 'Digital Detox' },
  { name: 'walk', label: 'Steps' },
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
