'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  type DocumentReference,
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


export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refMemo = useMemoCompare(ref, (prev, next) => {
      return prev && next && 'isEqual' in prev && typeof prev.isEqual === 'function' && prev.isEqual(next);
  });

  useEffect(() => {
    if (!refMemo) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      refMemo,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: refMemo.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refMemo]);

  return { data, loading, error };
}
