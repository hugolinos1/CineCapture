
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(2, 'Le nom d\'utilisateur doit faire au moins 2 caractères.').max(50, 'Le nom d\'utilisateur ne doit pas dépasser 50 caractères.'),
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères.'),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.username });
      
      const batch = writeBatch(firestore);

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocData = {
        id: user.uid,
        username: values.username,
        email: user.email,
        registrationDate: new Date().toISOString(),
        profileImageUrl: user.photoURL || null,
        isAdmin: false, 
      };
      batch.set(userDocRef, userDocData);

      // Grant admin role if the email matches
      if (values.email === 'hugues.rabier@gmail.com') {
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
          batch.set(adminRoleRef, { grantedAt: new Date().toISOString() });
          userDocData.isAdmin = true; // Also update the user doc
          batch.set(userDocRef, userDocData, { merge: true });
      }

      await batch.commit();

      toast({
        title: 'Compte créé avec succès !',
        description: `Bienvenue, ${values.username} !`,
      });
      router.push('/library');

    } catch (error: any) {
      console.error("Erreur lors de la création du compte:", error);
      let description = "Une erreur est survenue. Veuillez réessayer.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cette adresse e-mail est déjà utilisée par un autre compte.";
      }
       toast({
        variant: 'destructive',
        title: 'Échec de l\'inscription',
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Entrez vos informations pour commencer à utiliser CineCapture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre pseudo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                S'inscrire
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="underline text-primary">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
