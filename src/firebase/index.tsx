'use client';

import { useEffect, useState, useMemo, createContext, useContext, ReactNode } from 'react';
import { app, auth, db } from './config'; // Import initialized instances
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  DocumentReference, 
  Query, 
  DocumentData, 
  Firestore,
  collection
} from 'firebase/firestore';

// --- Contexts ---
const AuthContext = createContext<{ user: User | null; isUserLoading: boolean }>({
  user: null,
  isUserLoading: true,
});

// --- Provider Component ---
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setIsUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hooks ---

// 1. useUser: Returns the current auth user
export const useUser = () => useContext(AuthContext);

// 2. useAuth: Alias for useUser (FIX ADDED HERE)
export const useAuth = useUser;

// 3. useFirebaseApp: Returns the initialized Firebase App
export const useFirebaseApp = () => app;

// 4. useFirestore: Returns the Firestore instance
export const useFirestore = () => db;

// 5. useMemoFirebase: Helper to memoize Firestore refs (prevents infinite loops)
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

// 6. useDoc: Real-time listener for a single document
export function useDoc<T = DocumentData>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setData({ id: snap.id, ...snap.data() } as unknown as T);
      setIsLoading(false);
    }, (err) => {
      console.error("useDoc Error:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [ref]); // Ref must be memoized using useMemoFirebase

  return { data, isLoading };
}

// 7. useCollection: Real-time listener for a collection/query
export function useCollection<T = DocumentData>(queryRef: Query | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!queryRef) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = onSnapshot(queryRef, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(docs as unknown as T[]);
      setIsLoading(false);
    }, (err) => {
      console.error("useCollection Error:", err);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [queryRef]); // queryRef must be memoized

  return { data, isLoading };
}