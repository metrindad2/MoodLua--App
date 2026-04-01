'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  UserProfile,
  DailyLog,
  CycleLog,
  EmergencyContact,
} from '@/lib/types';
import { format, differenceInDays, startOfDay } from 'date-fns';

// Combined data structure for localStorage
interface MoodLuaLocalData {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  sosContacts: EmergencyContact[];
}

interface CycleDataContextType {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  sosContacts: EmergencyContact[];
  loading: boolean;
  updateUserProfile: (profile: Partial<Omit<UserProfile, 'uid'>>) => void;
  addOrUpdateDailyLog: (log: Omit<DailyLog, 'date'> & { date: Date }) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
  startNewCycle: (startDate: Date) => void;
  updatePregnancyLmpDate: (date: string | null) => void;
  logout: () => void;
  removeDailyLog: (date: Date) => void;
  addSosContact: (contact: Omit<EmergencyContact, 'id' | 'isPredefined'>) => void;
  updateSosContact: (contact: EmergencyContact) => void;
  removeSosContact: (contactId: string) => void;
}

const CycleDataContext = createContext<CycleDataContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = 'moodLuaLocalData';

// --- Funções de "Aprendizado" do Ciclo ---

/**
 * Analisa os logs diários para encontrar a duração de cada período menstrual.
 * Um período é um conjunto contínuo de dias com fluxo registrado.
 * @param logs - A lista de todos os registros diários.
 * @returns Um array com as durações (em dias) de cada período encontrado.
 */
const _getFlowDurations = (logs: DailyLog[]): number[] => {
  const periodDays = logs
    .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
    .map((log) => startOfDay(new Date(`${log.date}T00:00:00`)))
    .sort((a, b) => a.getTime() - b.getTime());

  if (periodDays.length === 0) return [];

  const durations: number[] = [];
  let currentStreak = 0;

  for (let i = 0; i < periodDays.length; i++) {
    currentStreak++;
    const isLastDay = i === periodDays.length - 1;
    const isGap = !isLastDay && differenceInDays(periodDays[i + 1], periodDays[i]) > 2;
    
    if (isLastDay || isGap) {
      if (currentStreak > 0) {
        durations.push(currentStreak);
      }
      currentStreak = 0;
    }
  }
  return durations;
};

/**
 * Reconstrói o histórico de ciclos (CycleLog) a partir dos registros diários (DailyLog).
 * Esta é a fonte da verdade para o histórico.
 * @param logs - A lista de todos os registros diários.
 * @param currentProfile - O perfil atual do usuário.
 * @returns Um objeto contendo o novo histórico de ciclos e a data da última menstruação.
 */
const _recalculateCyclesFromLogs = (
  logs: DailyLog[],
  currentProfile: UserProfile | null
) => {
  if (!currentProfile) return { newCycleHistory: [], newLmp: null };

  const periodDays = logs
    .filter((log) => log.flowIntensity && log.flowIntensity !== 'nenhum')
    .map((log) => startOfDay(new Date(`${log.date}T00:00:00`)))
    .sort((a, b) => a.getTime() - b.getTime());

  if (periodDays.length === 0) {
    return { newCycleHistory: [], newLmp: currentProfile.lastMenstruationDate };
  }

  // Identifica os dias de início de cada período procurando por "gaps" de mais de 2 dias sem fluxo.
  const periodStartDates: Date[] = [];
  if (periodDays.length > 0) {
    periodStartDates.push(periodDays[0]);
    for (let i = 1; i < periodDays.length; i++) {
      if (differenceInDays(periodDays[i], periodDays[i - 1]) > 2) {
        periodStartDates.push(periodDays[i]);
      }
    }
  }

  // Constrói o histórico de ciclos com base nas datas de início.
  const newCycleHistory: CycleLog[] = [];
  for (let i = 0; i < periodStartDates.length - 1; i++) {
    const cycleStartDate = periodStartDates[i];
    const nextCycleStartDate = periodStartDates[i + 1];
    const cycleLength = differenceInDays(nextCycleStartDate, cycleStartDate);

    // Ignora ciclos muito curtos que podem ser erros de registro.
    if (cycleLength > 10) { 
      newCycleHistory.push({
        startDate: format(cycleStartDate, 'yyyy-MM-dd'),
        cycleLength: cycleLength,
      });
    }
  }

  const newLmp =
    periodStartDates.length > 0
      ? format(periodStartDates[periodStartDates.length - 1], 'yyyy-MM-dd')
      : currentProfile.lastMenstruationDate;

  return { newCycleHistory, newLmp };
};

export function CycleDataProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [cycleHistory, setCycleHistory] = useState<CycleLog[]>([]);
  const [pregnancyLmpDate, setPregnancyLmpDate] = useState<string | null>(null);
  const [sosContacts, setSosContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega os dados do localStorage na inicialização.
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: MoodLuaLocalData = JSON.parse(storedData);
        setUserProfile(data.userProfile || null);
        setDailyLogs(data.dailyLogs || []);
        setCycleHistory(data.cycleHistory || []);
        setPregnancyLmpDate(data.pregnancyLmpDate || null);
        setSosContacts(data.sosContacts || []);
      }
    } catch (error) {
      console.error('Failed to load local data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito principal que salva os dados e aplica a lógica de "aprendizado".
  // Roda sempre que qualquer dado principal é alterado.
  useEffect(() => {
    if (loading) return;

    // Recalcula o histórico de ciclos e a data da última menstruação a partir dos logs diários.
    const { newCycleHistory, newLmp } = _recalculateCyclesFromLogs(dailyLogs, userProfile);
    
    let consistentProfile = userProfile && newLmp ? { ...userProfile, lastMenstruationDate: newLmp } : userProfile;

    // Prepara e salva todos os dados no localStorage.
    const dataToSave: MoodLuaLocalData = {
      userProfile: consistentProfile,
      dailyLogs,
      cycleHistory: newCycleHistory,
      pregnancyLmpDate,
      sosContacts,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Atualiza o estado do React apenas se houver mudanças, para evitar re-renderizações desnecessárias.
      if (JSON.stringify(newCycleHistory) !== JSON.stringify(cycleHistory)) {
        setCycleHistory(newCycleHistory);
      }
      if (consistentProfile && JSON.stringify(consistentProfile) !== JSON.stringify(userProfile)) {
        setUserProfile(consistentProfile);
      }

    } catch (error) {
      console.error('Failed to save local data', error);
    }
  }, [userProfile, dailyLogs, pregnancyLmpDate, sosContacts, loading, cycleHistory]);


  const updateUserProfile = useCallback((profileUpdate: Partial<Omit<UserProfile, 'uid'>>) => {
    setUserProfile((prevProfile) => {
        if (!prevProfile) {
            // Cria um novo perfil se não existir.
            return {
                uid: new Date().toISOString(),
                ...profileUpdate,
            } as UserProfile;
        }
        // Atualiza o perfil existente.
        return {
            ...prevProfile,
            ...profileUpdate,
        };
    });
  }, []);
  
  const addSosContact = useCallback((contact: Omit<EmergencyContact, 'id' | 'isPredefined'>) => {
    const newContact: EmergencyContact = {
      id: new Date().getTime().toString(),
      ...contact,
    };
    setSosContacts(prev => [...prev, newContact]);
  }, []);

  const updateSosContact = useCallback((updatedContact: EmergencyContact) => {
    setSosContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  }, []);

  const removeSosContact = useCallback((contactId: string) => {
    setSosContacts(prev => prev.filter(c => c.id !== contactId));
  }, []);

  // Adiciona ou atualiza um registro diário.
  const addOrUpdateDailyLog = useCallback((log: Omit<DailyLog, 'date'> & { date: Date }) => {
    const dateString = format(log.date, 'yyyy-MM-dd');

    setDailyLogs((prevLogs) => {
      const existingLogIndex = prevLogs.findIndex((l) => l.date === dateString);
      const newLog = { ...log, date: dateString };

      let updatedLogs;

      if (existingLogIndex > -1) {
        updatedLogs = [...prevLogs];
        const currentLog = updatedLogs[existingLogIndex];
        // Mescla o log antigo com as novas informações.
        const mergedLog = { ...currentLog, ...newLog };
        
        // Remove propriedades `undefined` para limpar o objeto.
        for (const key in mergedLog) {
          if (mergedLog[key as keyof typeof mergedLog] === undefined) {
            delete mergedLog[key as keyof typeof mergedLog];
          }
        }
        
        // Se o log ficar "vazio" (apenas com a data), ele é removido.
        if (Object.keys(mergedLog).length <= 1) {
            updatedLogs = updatedLogs.filter((_, index) => index !== existingLogIndex);
        } else {
            updatedLogs[existingLogIndex] = mergedLog;
        }
      } else {
        // Se o novo log não estiver vazio, adiciona-o à lista.
        if (Object.keys(newLog).length > 1) {
          updatedLogs = [...prevLogs, newLog];
        } else {
          return prevLogs;
        }
      }
      return updatedLogs;
    });
  }, []);

  const removeDailyLog = useCallback(
    (date: Date) => {
      // Remover um log é o mesmo que atualizá-lo com dados vazios.
      addOrUpdateDailyLog({
        date: date,
        mood: undefined,
        symptoms: undefined,
        flowIntensity: undefined,
      });
    },
    [addOrUpdateDailyLog]
  );
  
  // Função legada, agora o fluxo de novo ciclo é tratado pelo `_recalculateCyclesFromLogs`.
  const startNewCycle = useCallback(() => {}, []);

  const updatePregnancyLmpDate = (date: string | null) => {
    setPregnancyLmpDate(date);
  };
  
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUserProfile(null);
      setDailyLogs([]);
      setCycleHistory([]);
      setPregnancyLmpDate(null);
      setSosContacts([]);
      window.location.href = '/'; 
    } catch (error) {
      console.error('Failed to clear data', error);
    }
  }, []);

  const getLogForDate = useCallback(
    (date: Date): DailyLog | undefined => {
      const dateString = format(date, 'yyyy-MM-dd');
      return dailyLogs.find((log) => log.date === dateString);
    },
    [dailyLogs]
  );
  
  const value = {
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts,
    loading,
    updateUserProfile,
    addOrUpdateDailyLog,
    getLogForDate,
    startNewCycle,
    updatePregnancyLmpDate,
    logout,
    removeDailyLog,
    addSosContact,
    updateSosContact,
    removeSosContact,
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
