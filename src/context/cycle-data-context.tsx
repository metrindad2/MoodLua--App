'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyLog, SosSettings, MoodLuaData, CycleLog } from '@/lib/types';
import { DEFAULT_SOS_SETTINGS } from '@/lib/config';
import { format, addDays, differenceInDays } from 'date-fns';

const LOCAL_STORAGE_KEY = 'moodLuaData';

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

const CycleDataContext = createContext<CycleDataContextType | undefined>(undefined);

export function CycleDataProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [sosSettings, setSosSettings] = useState<SosSettings>(DEFAULT_SOS_SETTINGS);
  const [cycleHistory, setCycleHistory] = useState<CycleLog[]>([]);
  const [pregnancyLmpDate, setPregnancyLmpDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  }, []);

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

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const addOrUpdateDailyLog = useCallback((log: Omit<DailyLog, 'date'> & { date: Date }) => {
    const dateString = format(log.date, 'yyyy-MM-dd');
    const newLog = { ...log, date: dateString };
    
    setDailyLogs(prevLogs => {
      const existingLogIndex = prevLogs.findIndex(l => l.date === dateString);
      if (existingLogIndex > -1) {
        const updatedLogs = [...prevLogs];
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...newLog };
        return updatedLogs;
      } else {
        return [...prevLogs, newLog];
      }
    });
  }, []);

  const updateSosSettings = (settings: SosSettings) => {
    setSosSettings(settings);
  };
  
  const startNewCycle = useCallback((newStartDate: Date) => {
    if (!userProfile) return;

    // 1. Coleta todas as datas de início de ciclo conhecidas, incluindo a nova.
    const allKnownStartDates = [
      ...cycleHistory.map(c => c.startDate),
      userProfile.lastMenstruationDate,
      format(newStartDate, 'yyyy-MM-dd'),
    ];

    // 2. Remove duplicatas e ordena as datas cronologicamente.
    const uniqueSortedDates = [...new Set(allKnownStartDates)]
      .map(dateStr => new Date(`${dateStr}T00:00:00`))
      .sort((a, b) => a.getTime() - b.getTime());

    // 3. A data da última menstruação (LMP) no perfil é sempre a mais recente.
    const newLmpDate = uniqueSortedDates[uniqueSortedDates.length - 1];
    const newLmpDateStr = format(newLmpDate, 'yyyy-MM-dd');

    // 4. Reconstrói o histórico de ciclos com base nas datas ordenadas.
    // O histórico contém apenas os ciclos *concluídos*.
    const newCycleHistory: CycleLog[] = [];
    for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
      const cycleStartDate = uniqueSortedDates[i];
      const nextCycleStartDate = uniqueSortedDates[i + 1];
      const cycleLength = differenceInDays(nextCycleStartDate, cycleStartDate);

      // Adiciona ao histórico apenas se for um ciclo com duração plausível.
      if (cycleLength > 10) {
        newCycleHistory.push({
          startDate: format(cycleStartDate, 'yyyy-MM-dd'),
          cycleLength: cycleLength,
        });
      }
    }

    // 5. Atualiza os estados do perfil e do histórico.
    setCycleHistory(newCycleHistory);
    setUserProfile(prevProfile => 
      prevProfile ? { ...prevProfile, lastMenstruationDate: newLmpDateStr } : null
    );

    // 6. Registra automaticamente o fluxo para a duração do período a partir da nova data.
    // Isso garante que o início do período seja marcado, seja ele novo ou um registro corrigido.
    for (let i = 0; i < userProfile.flowDurationDays; i++) {
      const dateOfFlow = addDays(newStartDate, i);
      // Chama a função de log que já lida com adicionar/atualizar.
      addOrUpdateDailyLog({ date: dateOfFlow, flowIntensity: 'médio' });
    }
  }, [userProfile, cycleHistory, addOrUpdateDailyLog]);

  const updatePregnancyLmpDate = (date: string | null) => {
    setPregnancyLmpDate(date);
  };

  const getLogForDate = useCallback((date: Date): DailyLog | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyLogs.find(log => log.date === dateString);
  }, [dailyLogs]);

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

export const useCycleData = (): CycleDataContextType => {
  const context = useContext(CycleDataContext);
  if (context === undefined) {
    throw new Error('useCycleData must be used within a CycleDataProvider');
  }
  return context;
};
