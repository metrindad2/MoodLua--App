import { Mood } from '@/lib/types';

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  icon: string;
  score: number;
}[] = [
  { value: 'feliz', label: 'Feliz', icon: '😊', score: 5 },
  { value: 'energizada', label: 'Energia', icon: '⚡️', score: 4 },
  { value: 'calma', label: 'Calma', icon: '😌', score: 4 },
  { value: 'neutra', label: 'Neutra', icon: '😐', score: 3 },
  { value: 'ansiosa', label: 'Ansiosa', icon: '😟', score: 2 },
  { value: 'cansada', label: 'Cansada', icon: '😩', score: 2 },
  { value: 'triste', label: 'Triste', icon: '😔', score: 1 },
  { value: 'irritada', label: 'Irritada', icon: '😠', score: 1 },
];

export const MOOD_MAP = new Map(MOOD_OPTIONS.map(m => [m.value, m]));
