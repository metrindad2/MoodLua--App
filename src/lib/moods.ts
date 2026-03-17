import { Mood } from '@/lib/types';

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  emoji: string;
}[] = [
  { value: 'feliz', label: 'Feliz', emoji: '😊' },
  { value: 'calma', label: 'Calma', emoji: '😌' },
  { value: 'irritada', label: 'Irritada', emoji: '😠' },
  { value: 'triste', label: 'Triste', emoji: '😢' },
  { value: 'ansiosa', label: 'Ansiosa', emoji: '😟' },
  { value: 'cansada', label: 'Cansada', emoji: '😴' },
];
