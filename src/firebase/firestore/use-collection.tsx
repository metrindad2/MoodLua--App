'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  type CollectionReference,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

function useMemoCompare<T>(
  next: T,
  compare: (a: T, b: T) => boolean
): T {
  const previousRef = React.useRef<T>();
  const previous = previousRef.current;

  const isEqual = useMemo(() => compare(previous as T, next), [previous, next, compare]);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });

  return isEqual ? (previous as T) : next;
}

export function useCollection<T extends DocumentData>(
  q: Query<T> | CollectionReference<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryMemo = useMemoCompare(q, (prev, next) => {
    return prev && next && 'isEqual' in prev && typeof prev.isEqual === 'function' && prev.isEqual(next);
  });

  useEffect(() => {
    if (!queryMemo) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      queryMemo,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
        setError(null);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: (queryMemo as CollectionReference).path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryMemo]);

  return { data, loading, error };
}
