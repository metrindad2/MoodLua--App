'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  UserProfile,
  DailyLog,
  MoodLuaData,
  CycleLog,
  EmergencyContact,
} from '@/lib/types';
import { format, addDays, differenceInDays, startOfDay } from 'date-fns';
import { DEFAULT_SOS_MESSAGE } from '@/lib/config';

const LOCAL_STORAGE_KEY = 'moodLuaData';

interface CycleDataContextType {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  sosContacts: EmergencyContact[];
  sosMessage: string;
  loading: boolean;
  updateUserProfile: (profile: UserProfile) => void;
  addOrUpdateDailyLog: (log: Omit<DailyLog, 'date'> & { date: Date }) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
  startNewCycle: (startDate: Date) => void;
  updatePregnancyLmpDate: (date: string | null) => void;
  logout: () => void;
  removeDailyLog: (date: Date) => void;
  addSosContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateSosContact: (contact: EmergencyContact) => void;
  removeSosContact: (contactId: string) => void;
  updateSosMessage: (message: string) => void;
}

const CycleDataContext = createContext<CycleDataContextType | undefined>(
  undefined
);

export function CycleDataProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [cycleHistory, setCycleHistory] = useState<CycleLog[]>([]);
  const [pregnancyLmpDate, setPregnancyLmpDate] = useState<string | null>(null);
  const [sosContacts, setSosContacts] = useState<EmergencyContact[]>([]);
  const [sosMessage, setSosMessage] = useState<string>(DEFAULT_SOS_MESSAGE);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: MoodLuaData = JSON.parse(storedData);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.cycleHistory) setCycleHistory(data.cycleHistory);
        if (data.pregnancyLmpDate) setPregnancyLmpDate(data.pregnancyLmpDate);
        if (data.sosContacts) setSosContacts(data.sosContacts);
        if (data.sosMessage) setSosMessage(data.sosMessage);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      const dataToSave: MoodLuaData = {
        userProfile,
        dailyLogs,
        cycleHistory,
        pregnancyLmpDate,
        sosContacts,
        sosMessage,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
      }
    }
  }, [
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts,
    sosMessage,
    loading,
  ]);

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const addOrUpdateDailyLog = useCallback(
    (log: Omit<DailyLog, 'date'> & { date: Date }) => {
      const dateString = format(log.date, 'yyyy-MM-dd');

      setDailyLogs((prevLogs) => {
        const existingLogIndex = prevLogs.findIndex(
          (l) => l.date === dateString
        );
        const newLog = { ...log, date: dateString };

        if (existingLogIndex > -1) {
          const updatedLogs = [...prevLogs];
          const currentLog = updatedLogs[existingLogIndex];

          const mergedLog = { ...currentLog, ...newLog };
          for (const key in mergedLog) {
            if (mergedLog[key as keyof typeof mergedLog] === undefined) {
              delete mergedLog[key as keyof typeof mergedLog];
            }
          }
          updatedLogs[existingLogIndex] = mergedLog;

          if (Object.keys(mergedLog).length <= 1) {
            return updatedLogs.filter((_, index) => index !== existingLogIndex);
          }

          return updatedLogs;
        } else {
          if (Object.keys(newLog).length <= 1) {
            return prevLogs;
          }
          return [...prevLogs, newLog];
        }
      });
    },
    []
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

      const allKnownStartDates = [
        ...cycleHistory.map((c) => c.startDate),
        userProfile.lastMenstruationDate,
        format(newStartDate, 'yyyy-MM-dd'),
      ];

      const uniqueSortedDates = [...new Set(allKnownStartDates)]
        .map((dateStr) => startOfDay(new Date(`${dateStr}T00:00:00`)))
        .sort((a, b) => a.getTime() - b.getTime());

      const newLmpDate = uniqueSortedDates[uniqueSortedDates.length - 1];
      const newLmpDateStr = format(newLmpDate, 'yyyy-MM-dd');

      const newCycleHistory: CycleLog[] = [];
      for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
        const cycleStartDate = uniqueSortedDates[i];
        const nextCycleStartDate = uniqueSortedDates[i + 1];
        const cycleLength = differenceInDays(
          nextCycleStartDate,
          cycleStartDate
        );

        if (cycleLength > 10) {
          newCycleHistory.push({
            startDate: format(cycleStartDate, 'yyyy-MM-dd'),
            cycleLength: cycleLength,
          });
        }
      }

      setCycleHistory(newCycleHistory);
      setUserProfile((prevProfile) =>
        prevProfile
          ? { ...prevProfile, lastMenstruationDate: newLmpDateStr }
          : null
      );
    },
    [userProfile, cycleHistory]
  );

  const updatePregnancyLmpDate = (date: string | null) => {
    setPregnancyLmpDate(date);
  };

  const getLogForDate = useCallback(
    (date: Date): DailyLog | undefined => {
      const dateString = format(date, 'yyyy-MM-dd');
      return dailyLogs.find((log) => log.date === dateString);
    },
    [dailyLogs]
  );

  const addSosContact = useCallback(
    (contact: Omit<EmergencyContact, 'id'>) => {
      const newContact = { ...contact, id: Date.now().toString() };
      setSosContacts((prev) => [...prev, newContact]);
    },
    []
  );

  const updateSosContact = useCallback((contact: EmergencyContact) => {
    setSosContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? contact : c))
    );
  }, []);

  const removeSosContact = useCallback((contactId: string) => {
    setSosContacts((prev) => prev.filter((c) => c.id !== contactId));
  }, []);

  const updateSosMessage = useCallback((message: string) => {
    setSosMessage(message);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUserProfile(null);
      setDailyLogs([]);
      setCycleHistory([]);
      setPregnancyLmpDate(null);
      setSosContacts([]);
      setSosMessage(DEFAULT_SOS_MESSAGE);
      router.push('/');
    } catch (error) {
      console.error('Failed to clear data from localStorage', error);
    }
  }, [router]);

  const value = {
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts,
    sosMessage,
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
    updateSosMessage,
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
