// O 'use client' é necessário porque este componente usa hooks do React (useState, useEffect)
// e interage com APIs do navegador (localStorage), que só existem no lado do cliente.
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyLog, SosSettings, CycleGuardData, Mood } from '@/lib/types';
import { DEFAULT_SOS_SETTINGS } from '@/lib/config';
import { format } from 'date-fns';

// Define a chave que será usada para salvar os dados no localStorage do navegador.
const LOCAL_STORAGE_KEY = 'cycleGuardData';

// Define a "forma" do nosso contexto.
// Isso descreve quais dados e funções estarão disponíveis para os componentes
// que usarem este contexto.
interface CycleDataContextType {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  sosSettings: SosSettings;
  loading: boolean;
  updateUserProfile: (profile: UserProfile) => void;
  addOrUpdateDailyLog: (log: Omit<DailyLog, 'date'> & { date: Date }) => void;
  updateSosSettings: (settings: SosSettings) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
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
  const [loading, setLoading] = useState(true); // Estado para saber se os dados já foram carregados do localStorage.

  // `useEffect` para carregar os dados do localStorage quando o app inicia.
  // O array `[]` no final significa que este efeito só roda uma vez,
  // quando o componente é montado pela primeira vez.
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: CycleGuardData = JSON.parse(storedData);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.sosSettings) setSosSettings(data.sosSettings);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading(false); // Finaliza o carregamento, com ou sem dados.
    }
  }, []);

  // Função para salvar os dados no localStorage sempre que eles mudarem.
  const saveDataToLocalStorage = useCallback((data: CycleGuardData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, []);

  // Função para atualizar o perfil e salvar.
  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    saveDataToLocalStorage({ userProfile: profile, dailyLogs, sosSettings });
  }, [dailyLogs, sosSettings, saveDataToLocalStorage]);
  
  // Função para adicionar ou atualizar um log diário.
  const addOrUpdateDailyLog = useCallback((log: Omit<DailyLog, 'date'> & { date: Date }) => {
    const dateString = format(log.date, 'yyyy-MM-dd');
    const newLog = { ...log, date: dateString };
    
    setDailyLogs(prevLogs => {
      const existingLogIndex = prevLogs.findIndex(l => l.date === dateString);
      let updatedLogs;
      if (existingLogIndex > -1) {
        // Atualiza o log existente
        updatedLogs = [...prevLogs];
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...newLog };
      } else {
        // Adiciona um novo log
        updatedLogs = [...prevLogs, newLog];
      }
      saveDataToLocalStorage({ userProfile, dailyLogs: updatedLogs, sosSettings });
      return updatedLogs;
    });
  }, [userProfile, sosSettings, saveDataToLocalStorage]);

  // Função para atualizar as configurações de SOS e salvar.
  const updateSosSettings = useCallback((settings: SosSettings) => {
    setSosSettings(settings);
    saveDataToLocalStorage({ userProfile, dailyLogs, sosSettings: settings });
  }, [userProfile, dailyLogs, saveDataToLocalStorage]);

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
    loading,
    updateUserProfile,
    addOrUpdateDailyLog,
    updateSosSettings,
    getLogForDate,
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
