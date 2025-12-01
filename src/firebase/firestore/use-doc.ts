
'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(
  docPath: string
): UseDocReturn<T> {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docPath) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);

    const docRef = doc(firestore, docPath);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document ${docPath}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, docPath]);

  return { data, loading, error };
}
