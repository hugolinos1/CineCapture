
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Film, FileText, PlayCircle, Star, Trash2, Tv, Users, ChevronsUpDown, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { MediaItem, MediaStatus } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, deleteDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

const statusInfo: Record<MediaStatus, { Icon: React.ElementType; label: string; color: string; }> = {
  watched: { Icon: CheckCircle, label: 'Vu', color: 'text-green-400' },
  'in-progress': { Icon: PlayCircle, label: 'En cours', color: 'text-blue-400' },
  unwatched: { Icon: Clock, label: 'Non vu', color: 'text-gray-400' },
};

const typeLabels: Record<string, string> = {
  movie: 'Film',
  series: 'Série',
  miniseries: 'Mini-série',
};

export default function MediaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const id = params.id as string;

  const [item, setItem] = useState<MediaItem | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id || !user || !firestore) {
      if (!userLoading) {
        setItemLoading(false);
      }
      return;
    }

    setItemLoading(true);
    const docRef = doc(firestore, 'users', user.uid, 'contents', id);

    const unsubscribe: Unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() } as MediaItem);
          setError(null);
        } else {
          setItem(null);
          setError(new Error("L'élément demandé n'a pas été trouvé dans votre bibliothèque."));
        }
        setItemLoading(false);
      },
      (err) => {
        console.error(`Error fetching document ${docRef.path}:`, err);
        setError(err);
        setItem(null);
        setItemLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, id, firestore, userLoading]);


  const updateStatus = async (newStatus: MediaStatus) => {
    if (!item || !user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'contents', id);
    
    try {
      await updateDoc(docRef, { status: newStatus });
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de "${item.title}" est maintenant "${statusInfo[newStatus].label}".`,
      });
    } catch (e) {
      console.error("Erreur lors de la mise à jour du statut:", e);
      toast({
        variant: "destructive",
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la mise à jour."
      });
    }
  };

  const handleDelete = async () => {
    if (!item || !user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'contents', id);
    try {
       await deleteDoc(docRef);

      toast({
        title: 'Élément supprimé',
        description: `"${item.title}" a été supprimé de votre bibliothèque.`,
      });
      router.push('/library');
    } catch (e) {
      console.error("Erreur lors de la suppression de l'élément:", e);
      toast({
          variant: "destructive",
          title: 'Erreur',
          description: "Une erreur s'est produite lors de la suppression."
      });
    }
  };
  
  const isLoading = userLoading || itemLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center flex justify-center items-center h-full">
            <div className='flex flex-col items-center gap-4 text-muted-foreground'>
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-lg">Chargement des détails...</p>
            </div>
        </div>
    );
  }

  if (!user) {
     return (
        <main className="container mx-auto px-4 py-8">
           <div className="mb-6">
             <Button asChild variant="outline">
                <Link href="/library">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la bibliothèque
                </Link>
              </Button>
           </div>
           <Alert>
              <LogIn className="h-4 w-4" />
              <AlertTitle>Non connecté</AlertTitle>
              <AlertDescription>
                Vous devez être connecté pour voir les détails de cet élément.
              </AlertDescription>
           </Alert>
        </main>
    );
  }

  if (error || !item) {
    return (
        <main className="container mx-auto px-4 py-8">
           <div className="mb-6">
             <Button asChild variant="outline">
                <Link href="/library">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la bibliothèque
                </Link>
              </Button>
           </div>
           <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error?.message || "L'élément demandé n'a pas été trouvé dans votre bibliothèque."}</AlertDescription>
           </Alert>
        </main>
    );
  }

  const { Icon: StatusIcon, label: statusLabel, color: statusColor } = statusInfo[item.status];
  const typeIcon = item.type === 'movie' ? <Film className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />;
  const typeLabel = typeLabels[item.type] || 'Contenu';

  return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la bibliothèque
            </Link>
          </Button>
        </div>
        <Card className="overflow-hidden border-0 shadow-xl bg-card">
          <div className="grid md:grid-cols-3">
            <div className="md:col-span-1 relative min-h-[450px] md:min-h-0">
              <Image
                src={item.posterUrl || 'https://picsum.photos/seed/placeholder/500/750'}
                alt={`Affiche de ${item.title}`}
                fill
                className="object-cover"
                data-ai-hint="movie poster"
              />
            </div>
            <div className="md:col-span-2 p-6 md:p-8">
              <CardContent className="p-0 space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 capitalize flex items-center w-fit">
                         {item.type === 'movie' ? <Film className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                        {typeLabels[item.type] || 'Contenu'}
                      </Badge>
                      <h1 className="text-4xl font-bold font-headline text-primary-foreground">{item.title}</h1>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement "{item.title}" de votre bibliothèque.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-lg font-bold text-white">{item.rating.toFixed(1)}</span>
                      <span className="text-xs">/ 10</span>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className={`w-[150px] justify-start ${statusColor}`}>
                        <StatusIcon className="mr-2 h-4 w-4" />
                        <span className="truncate">{statusLabel}</span>
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[150px]">
                      {(Object.keys(statusInfo) as MediaStatus[]).map(status => {
                        const { Icon: MenuIcon, label: menuLabel } = statusInfo[status];
                        return (
                          <DropdownMenuItem key={status} onSelect={() => updateStatus(status)}>
                            <MenuIcon className="mr-2 h-4 w-4" />
                            <span>{menuLabel}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className='space-y-2'>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> Synopsis</h3>
                    <p className="text-base text-muted-foreground">{item.summary}</p>
                </div>

                <div className='space-y-2'>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5"/> Distribution</h3>
                    <p className="text-base text-muted-foreground">{item.cast.join(', ')}</p>
                </div>

                {item.genres && item.genres.length > 0 && (
                    <div className='space-y-2'>
                        <h3 className="font-semibold text-lg">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                        {item.genres.map(genre => (
                            <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                        </div>
                    </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </main>
  );
}

    