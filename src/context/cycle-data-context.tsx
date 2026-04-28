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
import {
  format,
  differenceInDays,
  startOfDay,
  addDays,
  isSameDay,
} from 'date-fns';

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
  isLocked: boolean;
  updateUserProfile: (
    profile: Partial<Omit<UserProfile, 'uid' | 'joinDate'>>
  ) => void;
  addOrUpdateDailyLog: (
    log: Partial<Omit<DailyLog, 'date'>> & { date: Date }
  ) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
  startNewCycle: (startDate: Date) => void;
  savePeriodDays: (days: Date[]) => void;
  updatePregnancyLmpDate: (date: string | null) => void;
  logout: () => void;
  removeDailyLog: (date: Date) => void;
  addSosContact: (contact: Omit<EmergencyContact, 'id' | 'isPredefined'>) => void;
  updateSosContact: (contact: EmergencyContact) => void;
  removeSosContact: (contactId: string) => void;
  enableLock: (pin: string) => void;
  disableLock: () => void;
  unlockApp: (pin: string) => boolean;
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
  const [isLocked, setIsLocked] = useState(true);

  // Load data from localStorage on initialization.
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: MoodLuaLocalData = JSON.parse(storedData);
        // Data migration for 'energizada' to 'energetica'
        const migratedLogs = (data.dailyLogs || []).map((log) => {
          if ((log.mood as any) === 'energizada') {
            return { ...log, mood: 'energetica' };
          }
          return log;
        });

        setUserProfile(data.userProfile || null);
        setDailyLogs(migratedLogs);
        setCycleHistory(data.cycleHistory || []);
        setPregnancyLmpDate(data.pregnancyLmpDate || null);
        setSosContacts(data.sosContacts || []);

        // Set initial lock state
        if (data.userProfile?.isLockEnabled) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      } else {
        // No data, so app is not locked
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Failed to load local data', error);
      setIsLocked(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to save all data to localStorage whenever it changes.
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
  }, [
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts,
    loading,
  ]);

  // This effect will patch existing user profiles that don't have a joinDate.
  useEffect(() => {
    if (!loading && userProfile && !userProfile.joinDate) {
      setUserProfile((prevProfile) => {
        if (!prevProfile) return null; // Should not happen inside this condition but good practice

        // Use lastMenstruationDate as a fallback for the joinDate for legacy users.
        const fallbackJoinDate =
          prevProfile.lastMenstruationDate || format(new Date(), 'yyyy-MM-dd');

        return {
          ...prevProfile,
          joinDate: fallbackJoinDate,
        };
      });
    }
  }, [loading, userProfile]);

  const updateUserProfile = useCallback(
    (profileUpdate: Partial<Omit<UserProfile, 'uid' | 'joinDate'>>) => {
      setUserProfile((currentProfile) => {
        if (!currentProfile) {
          // Creating a new user.
          const newUserProfile = {
            uid: new Date().toISOString(),
            joinDate: format(new Date(), 'yyyy-MM-dd'),
            ...profileUpdate,
          } as UserProfile;

          // Auto-mark the first period for the new user.
          if (
            newUserProfile.lastMenstruationDate &&
            newUserProfile.flowDurationDays > 0
          ) {
            const lmp = new Date(
              newUserProfile.lastMenstruationDate + 'T00:00:00'
            );
            const duration = newUserProfile.flowDurationDays;
            const newLogs: DailyLog[] = [];
            for (let i = 0; i < duration; i++) {
              newLogs.push({
                date: format(addDays(lmp, i), 'yyyy-MM-dd'),
                isPeriodDay: true,
                flowIntensity: 'médio',
              });
            }
            setDailyLogs(newLogs);
          }
          return newUserProfile;
        } else {
          // Updating an existing user.
          return { ...currentProfile, ...profileUpdate };
        }
      });
    },
    []
  );

  const addSosContact = useCallback(
    (contact: Omit<EmergencyContact, 'id' | 'isPredefined'>) => {
      const newContact: EmergencyContact = {
        id: new Date().getTime().toString(),
        ...contact,
      };
      setSosContacts((prev) => [...prev, newContact]);
    },
    []
  );

  const updateSosContact = useCallback((updatedContact: EmergencyContact) => {
    setSosContacts((prev) =>
      prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
  }, []);

  const removeSosContact = useCallback((contactId: string) => {
    setSosContacts((prev) => prev.filter((c) => c.id !== contactId));
  }, []);

  // Adds or updates a daily log.
  const addOrUpdateDailyLog = useCallback(
    (log: Partial<Omit<DailyLog, 'date'>> & { date: Date }) => {
      const dateString = format(log.date, 'yyyy-MM-dd');

      setDailyLogs((prevLogs) => {
        const existingLogIndex = prevLogs.findIndex(
          (l) => l.date === dateString
        );
        const newLogData = { ...log, date: dateString };

        let updatedLogs;

        if (existingLogIndex > -1) {
          updatedLogs = [...prevLogs];
          const currentLog = updatedLogs[existingLogIndex];
          const mergedLog = { ...currentLog, ...newLogData };

          // Remove `undefined` properties to clean the object.
          for (const key in mergedLog) {
            if (mergedLog[key as keyof typeof mergedLog] === undefined) {
              delete mergedLog[key as keyof typeof mergedLog];
            }
          }

          // If the log becomes "empty" of significant data, it's removed.
          const hasMeaningfulData =
            mergedLog.isPeriodDay ||
            mergedLog.mood ||
            mergedLog.symptoms?.length ||
            mergedLog.sexoLibido?.length ||
            (mergedLog.flowIntensity && mergedLog.flowIntensity !== 'nenhum');

          if (!hasMeaningfulData) {
            updatedLogs = updatedLogs.filter(
              (_, index) => index !== existingLogIndex
            );
          } else {
            updatedLogs[existingLogIndex] = mergedLog;
          }
        } else {
          // If the new log is not empty, add it to the list.
          const hasMeaningfulData =
            newLogData.isPeriodDay ||
            newLogData.mood ||
            newLogData.symptoms?.length ||
            newLogData.sexoLibido?.length ||
            (newLogData.flowIntensity && newLogData.flowIntensity !== 'nenhum');
          if (hasMeaningfulData) {
            updatedLogs = [...prevLogs, newLogData as DailyLog];
          } else {
            return prevLogs;
          }
        }
        return updatedLogs;
      });
    },
    []
  );

  const removeDailyLog = useCallback(
    (date: Date) => {
      // Removing a log is the same as updating it with empty data.
      addOrUpdateDailyLog({
        date: date,
        mood: undefined,
        symptoms: undefined,
        flowIntensity: undefined,
        isPeriodDay: false, // Explicitly unmarks the day as a period day
        sexoLibido: undefined,
      });
    },
    [addOrUpdateDailyLog]
  );

  // Explicit function to start a new cycle.
  const startNewCycle = useCallback((startDate: Date) => {
    const newLmpDate = startOfDay(startDate);

    setUserProfile((currentProfile) => {
      if (!currentProfile) {
        return null; // No profile to update
      }

      const previousLmpDate = startOfDay(
        new Date(currentProfile.lastMenstruationDate + 'T00:00:00')
      );

      // Only proceed if the new date is different from the old one
      if (isSameDay(newLmpDate, previousLmpDate)) {
        return currentProfile; // No change needed
      }

      // Add the last cycle to history if it was a forward progression
      const lastCycleLength = differenceInDays(newLmpDate, previousLmpDate);
      if (lastCycleLength > 10) { // Only log cycles longer than 10 days
        const newCycleLog: CycleLog = {
          startDate: format(previousLmpDate, 'yyyy-MM-dd'),
          cycleLength: lastCycleLength,
        };
        
        setCycleHistory((currentHistory) => {
          // Prevent adding duplicate history entries
          if (!currentHistory.some((c) => c.startDate === newCycleLog.startDate)) {
            return [...currentHistory, newCycleLog];
          }
          return currentHistory;
        });
      }

      // Return the updated profile with the new last menstruation date
      return {
        ...currentProfile,
        lastMenstruationDate: format(newLmpDate, 'yyyy-MM-dd'),
      };
    });
  }, []);

  const savePeriodDays = useCallback(
    (newPeriodDays: Date[]) => {
      setDailyLogs((currentLogs) => {
        const logsMap = new Map(currentLogs.map((log) => [log.date, { ...log }]));
        const newPeriodDayStrings = new Set(
          newPeriodDays.map((d) => format(d, 'yyyy-MM-dd'))
        );
        const daysToUpdate = new Set<string>(newPeriodDayStrings);

        currentLogs.forEach((log) => {
          if (log.isPeriodDay) {
            daysToUpdate.add(log.date);
          }
        });

        daysToUpdate.forEach((dateStr) => {
          const isNowPeriodDay = newPeriodDayStrings.has(dateStr);
          const currentLog = logsMap.get(dateStr) || { date: dateStr };
          let updatedLog = { ...currentLog };

          if (isNowPeriodDay) {
            updatedLog.isPeriodDay = true;
            if (!updatedLog.flowIntensity || updatedLog.flowIntensity === 'nenhum') {
              updatedLog.flowIntensity = 'médio';
            }
          } else {
            updatedLog.isPeriodDay = false;
            updatedLog.flowIntensity = 'nenhum';
          }
          logsMap.set(dateStr, updatedLog);
        });

        const newLogs = Array.from(logsMap.values()).filter(
          (log) =>
            log.isPeriodDay ||
            log.mood ||
            (log.symptoms && log.symptoms.length > 0) ||
            (log.sexoLibido && log.sexoLibido.length > 0) ||
            (log.flowIntensity && log.flowIntensity !== 'nenhum')
        );
        return newLogs;
      });
      
      const sortedNewDays = [...newPeriodDays].sort(
        (a, b) => a.getTime() - b.getTime()
      );
      
      if (sortedNewDays.length > 0) {
        const firstDayOfPeriod = sortedNewDays[0];
        startNewCycle(firstDayOfPeriod);
      }
    },
    [startNewCycle]
  );

  const updatePregnancyLmpDate = useCallback((date: string | null) => {
    setPregnancyLmpDate(date);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUserProfile(null);
      setDailyLogs([]);
      setCycleHistory([]);
      setPregnancyLmpDate(null);
      setSosContacts([]);
      setIsLocked(true); // Default to locked on logout.
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

  const enableLock = useCallback(
    (pin: string) => {
      if (userProfile) {
        setUserProfile((profile) =>
          profile ? { ...profile, isLockEnabled: true, lockPin: pin } : null
        );
        setIsLocked(true);
      }
    },
    [userProfile]
  );

  const disableLock = useCallback(() => {
    if (userProfile) {
      setUserProfile((profile) => {
        if (!profile) return null;
        const { lockPin, ...rest } = profile;
        return { ...rest, isLockEnabled: false, lockPin: undefined };
      });
      setIsLocked(false);
    }
  }, [userProfile]);

  const unlockApp = useCallback(
    (pin: string): boolean => {
      if (userProfile?.isLockEnabled && userProfile.lockPin === pin) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [userProfile]
  );

  const value = {
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts,
    loading,
    isLocked,
    updateUserProfile,
    addOrUpdateDailyLog,
    getLogForDate,
    startNewCycle,
    savePeriodDays,
    updatePregnancyLmpDate,
    logout,
    removeDailyLog,
    addSosContact,
    updateSosContact,
    removeSosContact,
    enableLock,
    disableLock,
    unlockApp,
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
