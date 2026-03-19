import { Mood } from '@/lib/types';

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  emoji: string;
}[] = [
  { value: 'feliz', label: 'Feliz', emoji: '😊' },
  { value: 'energizada', label: 'Energia', emoji: '✨' },
  { value: 'calma', label: 'Calma', emoji: '😌' },
  { value: 'neutra', label: 'Neutra', emoji: '😐' },
  { value: 'ansiosa', label: 'Ansiosa', emoji: '😟' },
  { value: 'cansada', label: 'Cansada', emoji: '😴' },
  { value: 'triste', label: 'Triste', emoji: '😢' },
  { value: 'irritada', label: 'Irritada', emoji: '😠' },
  { value: 'carinhosa', label: 'Carinhosa', emoji: '🥰' },
];
