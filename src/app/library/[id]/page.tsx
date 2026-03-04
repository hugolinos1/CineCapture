
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Film, FileText, PlayCircle, Star, Trash2, Tv, Users, ChevronsUpDown, LogIn, Loader2, RefreshCw } from 'lucide-react';
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
import { useFirestore, useUser, useDoc, errorEmitter, FirestorePermissionError, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import PlatformLogo from '@/components/cine-capture/platform-logo';
import { useRouter, useParams } from 'next/navigation';
import { fetchRefreshedMediaItem } from '@/lib/actions';


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
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!user || !id || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'contents', id as string);
  }, [user, id, firestore]);

  const { data: item, loading: itemLoading, error } = useDoc<MediaItem>(docRef);

  const updateStatus = async (newStatus: MediaStatus) => {
    if (!item || !user || !firestore || !docRef) return;
    
    const updatedData = { status: newStatus };
    updateDoc(docRef, updatedData)
      .catch((e) => {
        console.error("Erreur lors de la mise à jour du statut:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updatedData
        }));
      });
  };

  const handleDelete = async () => {
    if (!item || !user || !firestore || !docRef) return;
    deleteDoc(docRef)
      .then(() => {
        toast({
          title: 'Élément supprimé',
          description: `"${item.title}" a été supprimé de votre bibliothèque.`,
        });
        router.push('/library');
      })
      .catch((e) => {
        console.error("Erreur lors de la suppression de l'élément:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete'
        }));
      });
  };

  const handleRefresh = async () => {
    if (!item || !user || !docRef || !firestore) return;
  
    setIsRefreshing(true);
    toast({
      title: 'Rafraîchissement en cours...',
      description: `Mise à jour des informations pour "${item.title}".`,
    });
  
    const result = await fetchRefreshedMediaItem({
      title: item.title,
      type: item.type,
    });
  
    if (result.success && result.data) {
      const updatedData = {
          summary: result.data.summary,
          posterUrl: result.data.posterUrl,
          cast: result.data.cast,
          rating: result.data.rating,
          genres: result.data.genres,
          platform: result.data.platform,
          source: result.data.source,
      };

      updateDoc(docRef, updatedData)
        .then(() => {
          toast({
            title: 'Fiche mise à jour !',
            description: `Les informations pour "${item.title}" ont été rafraîchies.`,
          });
        })
        .catch((e) => {
          console.error("Erreur lors de la mise à jour de la base de données:", e);
           errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: docRef.path,
              operation: 'update',
              requestResourceData: updatedData
          }));
        });
    } else {
      toast({
        variant: 'destructive',
        title: 'Échec du rafraîchissement',
        description: result.error || 'Une erreur inconnue est survenue.',
      });
    }
    setIsRefreshing(false);
  };
  
  const isLoading = isUserLoading || itemLoading;

  if (isLoading) {
    return (
        <div className="flex-1 p-8 flex justify-center items-center h-full">
            <div className='flex flex-col items-center gap-4 text-muted-foreground'>
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-lg">Chargement des détails...</p>
            </div>
        </div>
    );
  }

  if (!user) {
     return (
        <main className="flex-1 p-8">
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
        <main className="flex-1 p-8">
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

  return (
      <main className="flex-1 p-4 sm:p-6 md:p-8">
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
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                            {isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                            <span className="sr-only">Rafraîchir</span>
                        </Button>
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
                {item.platform && (
                  <div className='space-y-2'>
                      <h3 className="font-semibold text-lg">Disponible sur</h3>
                      <div className="h-8">
                        <PlatformLogo platform={item.platform} />
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
