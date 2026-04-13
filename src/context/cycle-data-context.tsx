
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
import { format, differenceInDays, startOfDay, addDays, min, isSameDay } from 'date-fns';

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

  // Load data from localStorage on initialization.
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data: MoodLuaLocalData = JSON.parse(storedData);
        // Data migration for 'energizada' to 'energetica'
        const migratedLogs = (data.dailyLogs || []).map(log => {
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
      }
    } catch (error) {
      console.error('Failed to load local data', error);
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
      setUserProfile((prevProfile) => {
        if (!prevProfile) {
          // It's a new user. Create the full profile.
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
              });
            }
            setDailyLogs(newLogs); // Set logs for the new user
          }

          return newUserProfile;
        }

        // It's an existing user. Just update.
        return { ...prevProfile, ...profileUpdate };
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
  // Called when the user logs a period day that signifies a new cycle start.
  const startNewCycle = useCallback((startDate: Date) => {
    setUserProfile((prevProfile) => {
      if (!prevProfile) return null;

      const newLmpDate = startOfDay(startDate);
      const previousLmpDate = startOfDay(
        new Date(prevProfile.lastMenstruationDate + 'T00:00:00')
      );

      // Only add to history if this new cycle isn't the very first one.
      if (differenceInDays(newLmpDate, previousLmpDate) > 0) {
        const lastCycleLength = differenceInDays(newLmpDate, previousLmpDate);

        // Add the previous cycle to history if it was a valid cycle.
        if (lastCycleLength > 10) {
          const newCycleLog: CycleLog = {
            startDate: format(previousLmpDate, 'yyyy-MM-dd'),
            cycleLength: lastCycleLength,
          };
          setCycleHistory((prevHistory) => [...prevHistory, newCycleLog]);
        }
      }

      // Update the user's last menstruation date.
      return {
        ...prevProfile,
        lastMenstruationDate: format(newLmpDate, 'yyyy-MM-dd'),
      };
    });
  }, []);

  const savePeriodDays = useCallback((newPeriodDays: Date[]) => {
    // Sort the incoming days to easily find the first day
    const sortedNewDays = [...newPeriodDays].sort((a, b) => a.getTime() - b.getTime());
    const newPeriodDayStrings = new Set(sortedNewDays.map(d => format(d, 'yyyy-MM-dd')));

    // Part 1: Update the dailyLogs state based on the new selection
    setDailyLogs(prevLogs => {
        const logsMap = new Map(prevLogs.map(log => [log.date, log]));
        const allDaysToProcess = new Set<string>();

        // Add all days from the new selection
        newPeriodDayStrings.forEach(dayStr => allDaysToProcess.add(dayStr));

        // Also add any day that was previously a period day, to ensure it can be unmarked
        prevLogs.forEach(log => {
            if (log.isPeriodDay) {
                allDaysToProcess.add(log.date);
            }
        });

        // Process each relevant day
        allDaysToProcess.forEach(dayStr => {
            const isNowPeriodDay = newPeriodDayStrings.has(dayStr);
            const currentLog = logsMap.get(dayStr) || { date: dayStr };
            const updatedLog = { ...currentLog, isPeriodDay: isNowPeriodDay };
            logsMap.set(dayStr, updatedLog);
        });

        // Convert map back to an array and filter out any logs that are now completely empty
        return Array.from(logsMap.values()).filter(log =>
            log.isPeriodDay ||
            log.mood ||
            (log.symptoms && log.symptoms.length > 0) ||
            (log.sexoLibido && log.sexoLibido.length > 0) ||
            (log.flowIntensity && log.flowIntensity !== 'nenhum')
        );
    });

    // Part 2: Update the user's cycle start date and history if necessary
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;

        const newFirstDay = sortedNewDays.length > 0 ? sortedNewDays[0] : null;

        // If all period days were cleared, we don't update the cycle start date.
        if (!newFirstDay) {
            return prevProfile;
        }
        
        const newLmpDate = startOfDay(newFirstDay);
        const previousLmpDate = startOfDay(new Date(prevProfile.lastMenstruationDate + 'T00:00:00'));

        // If the main cycle start date hasn't changed, no further action is needed for the profile.
        if (isSameDay(newLmpDate, previousLmpDate)) {
            return prevProfile;
        }

        // The cycle start date has changed. Archive the old cycle if it was a valid length.
        const lastCycleLength = differenceInDays(newLmpDate, previousLmpDate);
        if (lastCycleLength > 15 && lastCycleLength < 90) { // Wider, more reasonable range
            const newCycleLog: CycleLog = {
                startDate: format(previousLmpDate, 'yyyy-MM-dd'),
                cycleLength: lastCycleLength,
            };
            
            setCycleHistory(prevHistory => {
                // Prevent adding a duplicate of the same completed cycle
                const alreadyExists = prevHistory.some(c => c.startDate === newCycleLog.startDate);
                if (!alreadyExists) {
                    return [...prevHistory, newCycleLog];
                }
                return prevHistory;
            });
        }
        
        // Finally, update the profile with the new cycle start date.
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
    savePeriodDays,
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
