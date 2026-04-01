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

  // Efeito para salvar todos os dados no localStorage sempre que eles mudarem.
  useEffect(() => {
    if (loading) return;

    const dataToSave: MoodLuaLocalData = {
      userProfile,
      dailyLogs,
      cycleHistory,
      pregnancyLmpDate,
      sosContacts,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save local data', error);
    }
  }, [userProfile, dailyLogs, cycleHistory, pregnancyLmpDate, sosContacts, loading]);


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
  
  // Função explícita para iniciar um novo ciclo.
  // É chamada quando a usuária registra um fluxo menstrual pela primeira vez no ciclo.
  const startNewCycle = useCallback((startDate: Date) => {
    setUserProfile(prevProfile => {
      if (!prevProfile) return null;

      const newLmpDate = startOfDay(startDate);
      const previousLmpDate = startOfDay(new Date(prevProfile.lastMenstruationDate + 'T00:00:00'));

      // Apenas adiciona ao histórico se o novo ciclo não for o primeiro de todos.
      if (differenceInDays(newLmpDate, previousLmpDate) > 0) {
        const lastCycleLength = differenceInDays(newLmpDate, previousLmpDate);

        // Adiciona o ciclo anterior ao histórico, se for um ciclo válido.
        if (lastCycleLength > 10) {
          const newCycleLog: CycleLog = {
            startDate: format(previousLmpDate, 'yyyy-MM-dd'),
            cycleLength: lastCycleLength,
          };
          setCycleHistory(prevHistory => [...prevHistory, newCycleLog]);
        }
      }

      // Atualiza a data da última menstruação no perfil do usuário.
      return { ...prevProfile, lastMenstruationDate: format(newLmpDate, 'yyyy-MM-dd') };
    });
  }, []);

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
