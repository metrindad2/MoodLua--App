'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  UserProfile,
  DailyLog,
  MoodLuaData,
  CycleLog,
  EmergencyContact,
} from '@/lib/types';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { DEFAULT_SOS_MESSAGE } from '@/lib/config';
import {
  useAuth,
  useUser,
  useDoc,
  useCollection,
  useFirestore,
} from '@/firebase';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface CycleDataContextType {
  userProfile: UserProfile | null;
  dailyLogs: DailyLog[];
  cycleHistory: CycleLog[];
  pregnancyLmpDate: string | null;
  sosContacts: EmergencyContact[];
  loading: boolean;
  updateUserProfile: (profile: Partial<Omit<UserProfile, 'uid'>>) => Promise<void>;
  addOrUpdateDailyLog: (log: Omit<DailyLog, 'date'> & { date: Date }) => void;
  getLogForDate: (date: Date) => DailyLog | undefined;
  startNewCycle: (startDate: Date) => void;
  updatePregnancyLmpDate: (date: string | null) => void;
  logout: () => void;
  removeDailyLog: (date: Date) => void;
  addSosContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateSosContact: (contact: EmergencyContact) => Promise<void>;
  removeSosContact: (contactId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const CycleDataContext = createContext<CycleDataContextType | undefined>(
  undefined
);

export function CycleDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  
  // --- Firebase State ---
  const userProfileDoc = useMemo(() => user && firestore ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileDoc);

  const sosContactsCollection = useMemo(() => user && firestore ? collection(firestore, 'users', user.uid, 'sosContacts') : null, [user, firestore]);
  const { data: sosContacts, loading: contactsLoading } = useCollection<EmergencyContact>(sosContactsCollection);


  // --- Local State (localStorage) ---
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [cycleHistory, setCycleHistory] = useState<CycleLog[]>([]);
  const [pregnancyLmpDate, setPregnancyLmpDate] = useState<string | null>(null);
  const [localDataLoading, setLocalDataLoading] = useState(true);

  const LOCAL_STORAGE_KEY = useMemo(() => user ? `moodLuaData-${user.uid}` : null, [user]);

  // Load local data when user logs in
  useEffect(() => {
    if (LOCAL_STORAGE_KEY) {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const data: MoodLuaData = JSON.parse(storedData);
          setDailyLogs(data.dailyLogs || []);
          setCycleHistory(data.cycleHistory || []);
          setPregnancyLmpDate(data.pregnancyLmpDate || null);
        }
      } catch (error) {
        console.error('Failed to load local data', error);
      } finally {
        setLocalDataLoading(false);
      }
    } else {
        // Clear local data if user logs out
        setDailyLogs([]);
        setCycleHistory([]);
        setPregnancyLmpDate(null);
    }
  }, [LOCAL_STORAGE_KEY]);

  // Save local data when it changes
  useEffect(() => {
    if (LOCAL_STORAGE_KEY && !localDataLoading) {
      const dataToSave: MoodLuaData = {
        dailyLogs,
        cycleHistory,
        pregnancyLmpDate,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save local data', error);
      }
    }
  }, [dailyLogs, cycleHistory, pregnancyLmpDate, LOCAL_STORAGE_KEY, localDataLoading]);

  // --- Auth Functions ---
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    if (!auth) return;
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const logout = useCallback(async () => {
    if (!auth || !LOCAL_STORAGE_KEY) return;
    try {
      await signOut(auth);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      router.push('/');
    } catch (error) {
      console.error('Failed to clear data', error);
    }
  }, [auth, LOCAL_STORAGE_KEY, router]);

  // --- Firestore Functions ---
  const updateUserProfile = useCallback(async (profileUpdate: Partial<Omit<UserProfile, 'uid'>>) => {
    if (!userProfileDoc) throw new Error("Usuário não autenticado.");
    const profileData = {
        ...userProfile,
        ...profileUpdate,
        uid: userProfileDoc.id,
        sosMessage: profileUpdate.sosMessage || userProfile?.sosMessage || DEFAULT_SOS_MESSAGE
    };
    await setDoc(userProfileDoc, profileData, { merge: true });
  }, [userProfileDoc, userProfile]);

  const addSosContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!sosContactsCollection) throw new Error("Usuário não autenticado.");
    await addDoc(sosContactsCollection, contact);
  }, [sosContactsCollection]);

  const updateSosContact = useCallback(async (contact: EmergencyContact) => {
    if (!sosContactsCollection) throw new Error("Usuário não autenticado.");
    const contactRef = doc(sosContactsCollection, contact.id);
    await setDoc(contactRef, contact, { merge: true });
  }, [sosContactsCollection]);

  const removeSosContact = useCallback(async (contactId: string) => {
    if (!sosContactsCollection) throw new Error("Usuário não autenticado.");
    const contactRef = doc(sosContactsCollection, contactId);
    await deleteDoc(contactRef);
  }, [sosContactsCollection]);


  // --- Local Data Functions ---
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
      updateUserProfile({ lastMenstruationDate: newLmpDateStr });
    },
    [userProfile, cycleHistory, updateUserProfile]
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

  const value = {
    userProfile,
    dailyLogs,
    cycleHistory,
    pregnancyLmpDate,
    sosContacts: sosContacts || [],
    loading: profileLoading || contactsLoading || localDataLoading,
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
    signInWithGoogle
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
