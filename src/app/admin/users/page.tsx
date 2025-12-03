
'use client';

import React, { useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, Users } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';


interface UserProfile {
  id: string;
  username: string;
  email: string;
  registrationDate: string | Timestamp;
  profileImageUrl?: string;
  isAdmin: boolean;
}

function AdminDashboard() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);

  const getJsDate = (date: string | Timestamp | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if (date instanceof Timestamp) return date.toDate();
    return null;
  };

  if (usersLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <div className='flex flex-col items-center gap-4 text-muted-foreground'>
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }
  
  if (usersError) {
    return <p>Erreur: {usersError.message}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users /> Gestion des utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.map((user) => {
              const registrationDate = getJsDate(user.registrationDate);
              return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImageUrl} alt={user.username} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {registrationDate ? format(registrationDate, "d MMMM yyyy", { locale: fr }) : 'N/A'}
                </TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="default">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Membre</Badge>
                  )}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function AdminUsersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isUserLoading || profileLoading;
  const isAuthorized = userProfile && userProfile.isAdmin;

  useEffect(() => {
    // Redirect only when loading is complete and the user is not authorized.
    if (!isLoading && !isAuthorized) {
      router.push('/');
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center h-full">
        <div className='flex flex-col items-center gap-4 text-muted-foreground'>
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
      // While redirecting, show a message. This content will be briefly visible.
      return (
        <div className="flex-1 p-8 flex justify-center items-center h-full">
          <div className='flex flex-col items-center gap-4 text-destructive'>
            <ShieldAlert className="w-12 h-12" />
            <p className="text-lg font-bold">Accès non autorisé</p>
            <p>Redirection en cours...</p>
          </div>
        </div>
      );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Tableau de bord Administrateur</h1>
      <AdminDashboard />
    </main>
  );
}
