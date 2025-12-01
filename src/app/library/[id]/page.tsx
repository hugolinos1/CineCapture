'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Film, FileText, PlayCircle, Star, Trash2, Tv, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { MediaItem } from '@/lib/types';
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
} from "@/components/ui/alert-dialog"

const LIBRARY_KEY = 'cine-capture-library';

const statusInfo = {
  watched: { Icon: CheckCircle, label: 'Vu', color: 'text-green-400' },
  'in-progress': { Icon: PlayCircle, label: 'En cours', color: 'text-blue-400' },
  unwatched: { Icon: Clock, label: 'Non vu', color: 'text-gray-400' },
};

export default function MediaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [item, setItem] = useState<MediaItem | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      try {
        const localData = localStorage.getItem(LIBRARY_KEY);
        if (localData) {
          const library: MediaItem[] = JSON.parse(localData);
          const foundItem = library.find(i => i.id === id);
          setItem(foundItem || null);
        } else {
          setItem(null);
        }
      } catch (error) {
        console.error("Failed to find item in localStorage:", error);
        setItem(null);
      }
    }
    setLoading(false);
  }, [id]);

  const handleDelete = () => {
    if (!item) return;
    try {
      const localData = localStorage.getItem(LIBRARY_KEY);
      const library: MediaItem[] = localData ? JSON.parse(localData) : [];
      const newLibrary = library.filter(i => i.id !== item.id);
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary));

      // Manually dispatch a storage event for other components to react
      window.dispatchEvent(new StorageEvent('storage', {
        key: LIBRARY_KEY,
        newValue: JSON.stringify(newLibrary)
      }));

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

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">Chargement des détails...</div>
      </AppLayout>
    );
  }

  if (item === null || item === undefined) {
    return (
      <AppLayout>
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
            <AlertDescription>{"L'élément demandé n'a pas été trouvé dans votre bibliothèque."}</AlertDescription>
           </Alert>
        </main>
      </AppLayout>
    );
  }

  const { Icon: StatusIcon, label: statusLabel, color: statusColor } = statusInfo[item.status];

  return (
    <AppLayout>
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
                src={item.posterUrl}
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
                        {item.type === 'movie' ? 'Film' : 'Série'}
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

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-lg font-bold text-white">{item.rating.toFixed(1)}</span>
                      <span className="text-xs">/ 10</span>
                    </div>
                  )}
                   <div className={`flex items-center gap-2 ${statusColor}`}>
                      <StatusIcon className="h-5 w-5" />
                      <span className="font-semibold text-white">{statusLabel}</span>
                    </div>
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
    </AppLayout>
  );
}
