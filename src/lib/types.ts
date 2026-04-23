
/**
 * @fileoverview Este arquivo define os tipos de dados centrais para o aplicativo MoodLua.
 * Usar tipos centralizados ajuda a manter a consistência e a prevenir erros em todo o código.
 * É uma boa prática em TypeScript para garantir que todos os componentes "falem a mesma língua"
 * quando se trata da estrutura dos dados.
 */

/**
 * Define a estrutura para o perfil básico da usuária.
 */
export type UserProfile = {
  uid: string;
  name: string;
  birthDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  joinDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  lastMenstruationDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  flowDurationDays: number;
  cycleLengthDays: number;
  sosMessage?: string;
  isLockEnabled?: boolean;
  lockPin?: string;
};

/**
 * Define os possíveis valores para o humor que a usuária pode registrar.
 */
export type Mood =
  | 'feliz'
  | 'alegre'
  | 'calma'
  | 'energetica'
  | 'carinhosa'
  | 'neutra'
  | 'triste'
  | 'ansiosa'
  | 'irritada'
  | 'cansada'
  | 'culpada'
  | 'desanimada'
  | 'apatica'
  | 'confusa'
  | 'pouca_energia'
  | 'mudancas_humor'
  | 'pensamentos_obsessivos'
  | 'muito_autocritica';

/**
 * Define os possíveis valores para a intensidade do fluxo menstrual.
 */
export type FlowIntensity = 'nenhum' | 'leve' | 'médio' | 'intenso';

/**
 * Define a estrutura para um registro diário.
 * A usuária pode criar um desses a cada dia para monitorar seu ciclo.
 */
export type DailyLog = {
  date: string; // A data do registro, no formato "YYYY-MM-DD"
  isPeriodDay?: boolean; // Adicionado para marcar o dia como menstruação sem especificar fluxo
  flowIntensity?: FlowIntensity;
  symptoms?: string[];
  mood?: Mood;
  sexoLibido?: string[];
};

/**
 * Define um registro no histórico de ciclos.
 */
export type CycleLog = {
  startDate: string; // "YYYY-MM-DD"
  cycleLength: number; // em dias
};

/**
 * Define a estrutura para um contato de emergência.
 */
export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  isPredefined?: boolean; // Para diferenciar contatos padrão
};

/**
 * Agrupa todos os dados do aplicativo em uma única estrutura para o localStorage.
 */
export type MoodLuaData = {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  sosContacts: EmergencyContact[];
};
