'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseApp, setFirebaseApp] = useState<any | null>(null);

  useEffect(() => {
    const app = initializeFirebase();
    setFirebaseApp(app);
  }, []);

  if (!firebaseApp) {
    return null; 
  }

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
