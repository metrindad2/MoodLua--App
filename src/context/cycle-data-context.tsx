// O 'use client' é necessário porque este componente usa hooks do React (useState, useEffect)
// e interage com APIs do navegador (localStorage), que só existem no lado do cliente.
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyLog, SosSettings, MoodLuaData, CycleLog } from '@/lib/types';
import { DEFAULT_SOS_SETTINGS } from '@/lib/config';
import { format, addDays, differenceInDays } from 'date-fns';

// Define a chave que será usada para salvar os dados no localStorage do navegador.
const LOCAL_STORAGE_KEY = 'moodLuaData';

// Define a "forma" do nosso contexto.
// Isso descreve quais dados e funções estarão disponíveis para os componentes
// que usarem este contexto.
interface CycleDataContextType {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  sosSettings: SosSettings;
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  loading: boolean;
  updateUserProfile: (profile: UserProfile) => void;
  addOrUpdateDailyLog: (log: Omit<DailyLog, 'date'> & { date: Date }) => void;
  updateSosSettings: (settings: SosSettings) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
  startNewCycle: (startDate: Date) => void;
  updatePregnancyLmpDate: (date: string | null) => void;
}

// Cria o Contexto. O valor inicial é `undefined` porque ele só terá um valor
// real dentro do componente Provedor (`CycleDataProvider`).
const CycleDataContext = createContext<CycleDataContextType | undefined>(undefined);

/**
 * Este é o componente Provedor. Ele vai "envolver" nosso aplicativo e
 * será o responsável por gerenciar o estado (os dados) e fornecê-lo
 * a todos os componentes filhos.
 */
export function CycleDataProvider({ children }: { children: React.ReactNode }) {
  // `useState` para armazenar os dados na memória enquanto o app está aberto.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [sosSettings, setSosSettings] = useState<SosSettings>(DEFAULT_SOS_SETTINGS);
  const [cycleHistory, setCycleHistory] = useState<CycleLog[]>([]);
  const [pregnancyLmpDate, setPregnancyLmpDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Estado para saber se os dados já foram carregados do localStorage.

  // `useEffect` para carregar os dados do localStorage quando o app inicia.
  // O array `[]` no final significa que este efeito só roda uma vez,
  // quando o componente é montado pela primeira vez.
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: MoodLuaData = JSON.parse(storedData);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.sosSettings) setSosSettings(data.sosSettings);
        if (data.cycleHistory) setCycleHistory(data.cycleHistory);
        if (data.pregnancyLmpDate) setPregnancyLmpDate(data.pregnancyLmpDate);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading(false); // Finaliza o carregamento, com ou sem dados.
    }
  }, []);

  // `useEffect` para salvar os dados no localStorage sempre que qualquer um deles mudar.
  // Esta abordagem garante que o estado do aplicativo seja sempre persistido.
  useEffect(() => {
    if (!loading) {
      const dataToSave: MoodLuaData = {
        userProfile,
        dailyLogs,
        sosSettings,
        cycleHistory,
        pregnancyLmpDate,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [userProfile, dailyLogs, sosSettings, cycleHistory, pregnancyLmpDate, loading]);


  // As funções abaixo agora apenas atualizam o estado. O `useEffect` acima cuida do salvamento.

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const addOrUpdateDailyLog = useCallback((log: Omit<DailyLog, 'date'> & { date: Date }) => {
    const dateString = format(log.date, 'yyyy-MM-dd');
    const newLog = { ...log, date: dateString };
    
    setDailyLogs(prevLogs => {
      const existingLogIndex = prevLogs.findIndex(l => l.date === dateString);
      let updatedLogs;
      if (existingLogIndex > -1) {
        // Atualiza o log existente mesclando os dados
        updatedLogs = [...prevLogs];
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...newLog };
      } else {
        // Adiciona um novo log
        updatedLogs = [...prevLogs, newLog];
      }
      return updatedLogs;
    });
  }, []);

  const updateSosSettings = (settings: SosSettings) => {
    setSosSettings(settings);
  };
  
  const startNewCycle = (newStartDate: Date) => {
    if (!userProfile) return;

    const oldStartDate = new Date(userProfile.lastMenstruationDate + 'T00:00:00');
    
    // Calcula o comprimento do ciclo que acabou de terminar
    const cycleLength = differenceInDays(newStartDate, oldStartDate);

    // Adiciona ao histórico apenas se for um ciclo válido (ex: maior que 10 dias)
    if (cycleLength > 10) { 
        const newHistoryEntry: CycleLog = {
            startDate: userProfile.lastMenstruationDate,
            cycleLength: cycleLength
        };
        setCycleHistory(prevHistory => [...prevHistory, newHistoryEntry]);
    }

    // Atualiza o perfil da usuária com a nova data de início
    const newStartDateStr = format(newStartDate, 'yyyy-MM-dd');
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, lastMenstruationDate: newStartDateStr } : null);

    // Registra automaticamente o fluxo para a duração do período informada
    for (let i = 0; i < userProfile.flowDurationDays; i++) {
        const dateOfFlow = addDays(newStartDate, i);
        addOrUpdateDailyLog({ date: dateOfFlow, flowIntensity: 'médio' });
    }
  };

  const updatePregnancyLmpDate = (date: string | null) => {
    setPregnancyLmpDate(date);
  };

  // Função para buscar um log de uma data específica.
  const getLogForDate = useCallback((date: Date): DailyLog | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyLogs.find(log => log.date === dateString);
  }, [dailyLogs]);

  // O valor que será fornecido pelo contexto. Inclui os dados e as funções para modificá-los.
  const value = {
    userProfile,
    dailyLogs,
    sosSettings,
    cycleHistory,
    pregnancyLmpDate,
    loading,
    updateUserProfile,
    addOrUpdateDailyLog,
    updateSosSettings,
    getLogForDate,
    startNewCycle,
    updatePregnancyLmpDate,
  };

  return (
    <CycleDataContext.Provider value={value}>
      {children}
    </CycleDataContext.Provider>
  );
}

/**
 * Este é um "hook" customizado. É uma forma simples e limpa de usar nosso contexto
 * em qualquer componente. Em vez de importar `useContext` e `CycleDataContext` toda vez,
 * apenas importamos e chamamos `useCycleData()`.
 */
export const useCycleData = (): CycleDataContextType => {
  const context = useContext(CycleDataContext);
  if (context === undefined) {
    throw new Error('useCycleData must be used within a CycleDataProvider');
  }
  return context;
};
