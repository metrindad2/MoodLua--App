/**
 * @fileoverview Este arquivo define os tipos de dados centrais para o aplicativo MoodLua.
 * Usar tipos centralizados ajuda a manter a consistência e a prevenir erros em todo o código.
 * É uma boa prática em TypeScript para garantir que todos os componentes "falem a mesma língua"
 * quando se trata da estrutura dos dados.
 */

/**
 * Define a estrutura para o perfil básico da usuária.
 * Estes são os dados coletados no primeiro acesso.
 */
export type UserProfile = {
  name: string;
  birthDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  lastMenstruationDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  flowDurationDays: number;
  cycleLengthDays: number;
};

/**
 * Define os possíveis valores para o humor que a usuária pode registrar.
 */
export type Mood =
  | 'feliz'
  | 'energizada'
  | 'calma'
  | 'neutra'
  | 'ansiosa'
  | 'cansada'
  | 'triste'
  | 'irritada'
  | 'carinhosa';

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
  flowIntensity?: FlowIntensity;
  symptoms?: string[];
  mood?: Mood;
};

/**
 * Define um registro no histórico de ciclos.
 */
export type CycleLog = {
  startDate: string; // "YYYY-MM-DD"
  cycleLength: number; // em dias
};

/**
 * Agrupa todos os dados do aplicativo em uma única estrutura.
 * Isso é útil para salvar e carregar todo o estado do app de uma só vez,
 * por exemplo, no \`localStorage\`.
 */
export type MoodLuaData = {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
};
