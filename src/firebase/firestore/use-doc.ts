
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';

interface UseDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(
  docRef: DocumentReference<DocumentData> | null
): UseDocReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If the docRef is not yet available, do nothing and wait.
    if (!docRef) {
      setLoading(true);
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        } else {
          // Document does not exist
          setData(null);
          setError(new Error("Document does not exist."));
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching document ${docRef.path}:`, err);
        setError(err);
        setData(null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or when docRef changes.
    return () => unsubscribe();
    // The docRef object itself is the dependency. useMemo in the component
    // ensures this dependency is stable.
  }, [docRef]);

  return { data, loading, error };
}
