
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
    // If the query is not yet available, do nothing.
    if (!firestoreQuery) {
      setData(null);
      setLoading(true); // Remain in loading state until a valid query is provided
      return;
    }

    setLoading(true);
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
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestoreQuery]); // Re-run effect when the query object itself changes

  return { data, loading, error };
}
