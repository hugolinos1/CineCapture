
'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentData,
  type Query,
} from 'firebase/firestore';

interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T extends DocumentData>(
  firestoreQuery: Query | null
): UseCollectionReturn<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If the query is not yet available, do nothing and wait.
    if (!firestoreQuery) {
      setLoading(true);
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    
    // Subscribe to the query.
    const unsubscribe = onSnapshot(
      firestoreQuery,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching collection:`, err);
        setError(err);
        setData(null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or when query changes.
    return () => unsubscribe();
    // The query object itself is the dependency. useMemo in the component
    // ensures this dependency is stable.
  }, [firestoreQuery]);

  return { data, loading, error };
}
