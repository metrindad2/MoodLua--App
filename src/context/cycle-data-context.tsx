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
import { format, differenceInDays, startOfDay, isSameDay, addDays } from 'date-fns';
import { DEFAULT_SOS_MESSAGE } from '@/lib/config';

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

// --- Helper function for cycle recalculation ---
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
    // Se não há dias de período, retorna o LMP original para não perder a referência
    return { newCycleHistory: [], newLmp: currentProfile.lastMenstruationDate };
  }

  const periodStartDates: Date[] = [];
  if (periodDays.length > 0) {
    periodStartDates.push(periodDays[0]);
    for (let i = 1; i < periodDays.length; i++) {
      // Se a diferença para o dia anterior for maior que 2 dias, considera um novo ciclo.
      if (differenceInDays(periodDays[i], periodDays[i - 1]) > 2) {
        periodStartDates.push(periodDays[i]);
      }
    }
  }

  const newCycleHistory: CycleLog[] = [];
  for (let i = 0; i < periodStartDates.length - 1; i++) {
    const cycleStartDate = periodStartDates[i];
    const nextCycleStartDate = periodStartDates[i + 1];
    const cycleLength = differenceInDays(nextCycleStartDate, cycleStartDate);

    // Apenas adiciona ao histórico se o ciclo tiver um comprimento razoável
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

  // Load data from localStorage on initial render
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
      } else {
        // If no data, initialize with empty/default state
         setUserProfile(null);
         setDailyLogs([]);
         setCycleHistory([]);
         setPregnancyLmpDate(null);
         setSosContacts([]);
      }
    } catch (error) {
      console.error('Failed to load local data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      // Before saving, run recalculation to ensure consistency
      const { newCycleHistory, newLmp } = _recalculateCyclesFromLogs(dailyLogs, userProfile);
      
      const consistentProfile = userProfile && newLmp ? { ...userProfile, lastMenstruationDate: newLmp } : userProfile;

      const dataToSave: MoodLuaLocalData = {
        userProfile: consistentProfile,
        dailyLogs,
        cycleHistory: newCycleHistory,
        pregnancyLmpDate,
        sosContacts,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        // Also update state to reflect the recalculation
        if (JSON.stringify(newCycleHistory) !== JSON.stringify(cycleHistory)) {
          setCycleHistory(newCycleHistory);
        }
        if (consistentProfile && JSON.stringify(consistentProfile) !== JSON.stringify(userProfile)) {
          setUserProfile(consistentProfile);
        }

      } catch (error) {
        console.error('Failed to save local data', error);
      }
    }
  }, [userProfile, dailyLogs, cycleHistory, pregnancyLmpDate, sosContacts, loading]);

  const updateUserProfile = useCallback((profileUpdate: Partial<Omit<UserProfile, 'uid'>>) => {
    setUserProfile((prevProfile) => {
        // When creating a new profile
        if (!prevProfile) {
            return {
                uid: new Date().toISOString(), // Use a simple unique ID for local
                ...profileUpdate,
            } as UserProfile;
        }
        // When updating an existing profile
        return {
            ...prevProfile,
            ...profileUpdate,
        };
    });
  }, []);
  
  const addSosContact = useCallback((contact: Omit<EmergencyContact, 'id' | 'isPredefined'>) => {
    const newContact: EmergencyContact = {
      id: new Date().getTime().toString(), // Simple unique ID
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


  const addOrUpdateDailyLog = useCallback(
    (log: Omit<DailyLog, 'date'> & { date: Date }) => {
      const dateString = format(log.date, 'yyyy-MM-dd');

      setDailyLogs((prevLogs) => {
        const existingLogIndex = prevLogs.findIndex(
          (l) => l.date === dateString
        );
        const newLog = { ...log, date: dateString };

        let updatedLogs;

        if (existingLogIndex > -1) {
          updatedLogs = [...prevLogs];
          const currentLog = updatedLogs[existingLogIndex];
          const mergedLog = { ...currentLog, ...newLog };
          
          for (const key in mergedLog) {
            if (mergedLog[key as keyof typeof mergedLog] === undefined) {
              delete mergedLog[key as keyof typeof mergedLog];
            }
          }
          
          if (Object.keys(mergedLog).length <= 1) {
             updatedLogs = updatedLogs.filter((_, index) => index !== existingLogIndex);
          } else {
             updatedLogs[existingLogIndex] = mergedLog;
          }
        } else {
          if (Object.keys(newLog).length <= 1) {
            return prevLogs;
          }
          updatedLogs = [...prevLogs, newLog];
        }

        // --- Recalculate cycle history after updating logs ---
        const { newCycleHistory, newLmp } = _recalculateCyclesFromLogs(updatedLogs, userProfile);
        setCycleHistory(newCycleHistory);
        if (userProfile && newLmp) {
          setUserProfile(p => p ? { ...p, lastMenstruationDate: newLmp } : null);
        }
        // --- End Recalculation ---

        return updatedLogs;
      });
    },
    [userProfile]
  );

  const removeDailyLog = useCallback(
    (date: Date) => {
      addOrUpdateDailyLog({
        date: date,
        mood: undefined,
        symptoms: undefined,
        flowIntensity: undefined,
      });
    },
    [addOrUpdateDailyLog]
  );
  
  const startNewCycle = useCallback(
    (newStartDate: Date) => {
      if (!userProfile) return;
       // Simply log the new start date as a period day.
      // The recalculation logic inside addOrUpdateDailyLog will handle the rest.
      addOrUpdateDailyLog({
        date: newStartDate,
        flowIntensity: 'médio' // Assume 'médio' as a default when starting a cycle this way
      });
    },
    [userProfile, addOrUpdateDailyLog]
  );

  const updatePregnancyLmpDate = (date: string | null) => {
    setPregnancyLmpDate(date);
  };
  
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      // Reset all state to initial values
      setUserProfile(null);
      setDailyLogs([]);
      setCycleHistory([]);
      setPregnancyLmpDate(null);
      setSosContacts([]);
      // Force reload to ensure all components reset
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
    <CycleDataContext.Provider value={value as CycleDataContextType}>
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
