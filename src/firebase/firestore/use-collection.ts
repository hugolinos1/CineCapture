
'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  type Firestore,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

// Define a generic type for the hook's return value
interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T extends DocumentData>(
  collectionPath: string,
  uid?: string | null
): UseCollectionReturn<T> {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setData([]); // No user, no data
      return;
    }

    setLoading(true);

    const collRef = collection(firestore, 'users', uid, collectionPath);
    const q = query(collRef, orderBy('addedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
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
        console.error(`Error fetching collection ${collectionPath}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, collectionPath, uid]);

  return { data, loading, error };
}
