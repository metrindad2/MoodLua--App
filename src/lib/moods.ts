
import { Mood } from '@/lib/types';

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  emoji: string;
}[] = [
  // Positive / Neutral
  { value: 'feliz', label: 'Feliz', emoji: '😊' },
  { value: 'alegre', label: 'Alegre', emoji: '😄' },
  { value: 'calma', label: 'Calma', emoji: '😌' },
  { value: 'energetica', label: 'Energética', emoji: '⚡️' },
  { value: 'carinhosa', label: 'Carinhosa', emoji: '🥰' },
  { value: 'neutra', label: 'Neutra', emoji: '😐' },

  // Negative
  { value: 'triste', label: 'Triste', emoji: '😢' },
  { value: 'ansiosa', label: 'Ansiosa', emoji: '😟' },
  { value: 'irritada', label: 'Irritada', emoji: '😠' },
  { value: 'cansada', label: 'Cansada', emoji: '😴' },
  { value: 'culpada', label: 'Culpada', emoji: '😔' },
  { value: 'desanimada', label: 'Desanimada', emoji: '😞' },
  { value: 'apatica', label: 'Apática', emoji: '😑' },
  { value: 'confusa', label: 'Confusa', emoji: '😵‍💫' },
  { value: 'pouca_energia', label: 'Pouca energia', emoji: '🔋' },
  { value: 'mudancas_humor', label: 'Mudanças de humor', emoji: '🎢' },
  { value: 'pensamentos_obsessivos', label: 'Pensamentos obsessivos', emoji: '🤔' },
  { value: 'muito_autocritica', label: 'Muito autocrítica', emoji: '🧐' },
];
