import { Mood } from '@/lib/types';

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  icon: string;
}[] = [
  { value: 'feliz', label: 'Feliz', icon: 'Smile' },
  { value: 'calma', label: 'Calma', icon: 'Leaf' },
  { value: 'irritada', label: 'Irritada', icon: 'Angry' },
  { value: 'triste', label: 'Triste', icon: 'CloudRain' },
  { value: 'ansiosa', label: 'Ansiosa', icon: 'Frown' },
  { value: 'cansada', label: 'Cansada', icon: 'BatteryLow' },
];
