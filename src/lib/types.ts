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
  lastMenstruationDate: string; // Armazenado como string no formato "YYYY-MM-DD"
  flowDurationDays: number;
  cycleLengthDays: number;
};

/**
 * Define os possíveis valores para o humor que a usuária pode registrar.
 */
export type Mood = 
  | "feliz" 
  | "neutra" 
  | "triste" 
  | "irritada" 
  | "ansiosa" 
  | "energizada" 
  | "cansada";

/**
 * Define a estrutura para um registro diário.
 * A usuária pode criar um desses a cada dia para monitorar seu ciclo.
 */
export type DailyLog = {
  date: string; // A data do registro, no formato "YYYY-MM-DD"
  flowIntensity?: 'nenhum' | 'leve' | 'médio' | 'intenso';
  symptoms?: string[];
  mood?: Mood;
};

/**
 * Define a estrutura para as configurações da função de emergência (SOS).
 */
export type SosSettings = {
  policeNumber: string;
  emergencyContacts: string[]; // Uma lista de números de telefone
  emergencyMessage: string;
};

/**
 * Agrupa todos os dados do aplicativo em uma única estrutura.
 * Isso é útil para salvar e carregar todo o estado do app de uma só vez,
 * por exemplo, no \`localStorage\`.
 */
export type MoodLuaData = {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  sosSettings: SosSettings;
};
