/**
 * @fileoverview Contém funções de utilidade para cálculos relacionados ao ciclo menstrual.
 *
 * Este arquivo é como uma "calculadora" para o ciclo. Ele pega os dados da usuária
 * (início da menstruação, duração do ciclo) e realiza previsões.
 * Manter essa lógica separada dos componentes da interface (como o Dashboard ou Calendário)
 * torna o código mais organizado e fácil de manter.
 */

import { addDays, subDays, differenceInDays, startOfDay, isSameDay } from 'date-fns';
import { UserProfile, DailyLog } from './types';

/**
 * Representa os resultados dos cálculos do ciclo.
 */
export interface CycleInfo {
  currentCycleDay: number;
  nextPeriodStartDate: Date;
  daysUntilNextPeriod: number;
  pmsStartDate: Date;
  pmsEndDate: Date;
  isPms: boolean;
  fertileWindowStartDate: Date;
  fertileWindowEndDate: Date;
  isFertile: boolean;
  ovulationDate: Date;
  isOvulating: boolean;
  menstruationStartDate: Date;
  menstruationEndDate: Date;
  isMenstruating: boolean;
  isDelayed: boolean;
}

/**
 * Calcula várias informações sobre o ciclo menstrual com base no perfil da usuária.
 *
 * @param {UserProfile} userProfile - O perfil da usuária contendo os dados do ciclo.
 * @param {DailyLog[]} dailyLogs - Os registros diários para verificar o status real da menstruação.
 * @returns {CycleInfo | null} Um objeto com todas as informações calculadas do ciclo, ou null se o perfil for inválido.
 */
export function calculateCycleInfo(userProfile: UserProfile, dailyLogs: DailyLog[]): CycleInfo | null {
  if (!userProfile?.lastMenstruationDate || !userProfile.cycleLengthDays || userProfile.cycleLengthDays <= 0) {
    return null;
  }

  const today = startOfDay(new Date());
  // Garante que a data seja interpretada no fuso horário local, evitando erros de "um dia a menos".
  const lastPeriod = startOfDay(new Date(userProfile.lastMenstruationDate + 'T00:00:00'));

  // O dia atual do ciclo é a diferença de dias desde a última menstruação + 1.
  const currentCycleDay = differenceInDays(today, lastPeriod) + 1;

  // Previsão da próxima menstruação, com base na duração do ciclo aprendida ou informada.
  const nextPeriodStartDate = addDays(lastPeriod, userProfile.cycleLengthDays);
  const daysUntilNextPeriod = differenceInDays(nextPeriodStartDate, today);
  const menstruationEndDate = addDays(lastPeriod, userProfile.flowDurationDays);

  // Verifica o log diário para saber o status real da menstruação de hoje
  const todayLog = dailyLogs.find(log => isSameDay(startOfDay(new Date(log.date + 'T00:00:00')), today));
  const isMenstruatingFromLog = !!todayLog?.isPeriodDay;

  // Lógica de previsão se não houver log para hoje
  const isMenstruatingFromProfile = today >= lastPeriod && today < menstruationEndDate;
  
  // Prioriza o registro do log, se existir. Caso contrário, usa a previsão.
  const isMenstruating = todayLog ? isMenstruatingFromLog : isMenstruatingFromProfile;

  // Se o ciclo estiver muito longo E a usuária não estiver menstruando, consideramos como "atrasado".
  const isDelayed = daysUntilNextPeriod < 0 && !isMenstruating;

  // Previsão da TPM (geralmente 7-10 dias antes da menstruação)
  const pmsStartDate = subDays(nextPeriodStartDate, 7);
  const pmsEndDate = subDays(nextPeriodStartDate, 1);
  const isPms = !isDelayed && today >= pmsStartDate && today <= pmsEndDate;

  // Previsão da Janela Fértil e Ovulação (baseado em um ciclo padrão)
  // Ovulação geralmente ocorre ~14 dias ANTES da próxima menstruação.
  const ovulationDate = subDays(nextPeriodStartDate, 14);
  const fertileWindowStartDate = subDays(ovulationDate, 5);
  const fertileWindowEndDate = addDays(ovulationDate, 1);
  const isFertile = !isDelayed && today >= fertileWindowStartDate && today <= fertileWindowEndDate;
  const isOvulating = !isDelayed && isSameDay(today, ovulationDate);

  return {
    currentCycleDay,
    nextPeriodStartDate,
    daysUntilNextPeriod,
    pmsStartDate,
    pmsEndDate,
    isPms,
    fertileWindowStartDate,
    fertileWindowEndDate,
    isFertile,
    ovulationDate,
    isOvulating,
    menstruationStartDate: lastPeriod,
    menstruationEndDate,
    isMenstruating,
    isDelayed,
  };
}
