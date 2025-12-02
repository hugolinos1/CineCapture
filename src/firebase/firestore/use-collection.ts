
'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  query,
  type Firestore,
  type DocumentData,
  type Query,
} from 'firebase/firestore';

interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

// Helper to serialize a query to a stable string
const serializeQuery = (q: Query): string => {
  // @ts-ignore internal property _query
  const queryCanonicalId = q._query.canonicalId();
  return queryCanonicalId;
}


export function useCollection<T extends DocumentData>(
  firestoreQuery: Query | null
): UseCollectionReturn<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const serializedQuery = useMemo(() => firestoreQuery ? serializeQuery(firestoreQuery) : null, [firestoreQuery]);

  useEffect(() => {
    if (!firestoreQuery || !serializedQuery) {
      setLoading(false);
      setData([]);
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

    return () => unsubscribe();
  }, [serializedQuery]); // Depend on the stable serialized query string

  return { data, loading, error };
}
