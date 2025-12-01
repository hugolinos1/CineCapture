
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Film, FileText, PlayCircle, Star, Tv, Users } from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockLibrary } from '@/lib/mock-data';
import type { MediaItem } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusInfo = {
  watched: { Icon: CheckCircle, label: 'Vu', color: 'text-green-400' },
  'in-progress': { Icon: PlayCircle, label: 'En cours', color: 'text-blue-400' },
  unwatched: { Icon: Clock, label: 'Non vu', color: 'text-gray-400' },
};

export default function MediaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client where localStorage is available
    if (typeof window !== 'undefined' && id) {
      try {
        const localData = localStorage.getItem('cine-capture-library');
        const localItems: MediaItem[] = localData ? JSON.parse(localData) : [];
        
        // Correctly merge and deduplicate, giving priority to local items
        const itemMap = new Map<string, MediaItem>();
        mockLibrary.forEach(item => itemMap.set(item.id, item));
        localItems.forEach(item => itemMap.set(item.id, item));
        const allItems = Array.from(itemMap.values());

        const foundItem = allItems.find((i: MediaItem) => i.id === id);

        if (foundItem) {
          setItem(foundItem);
        } else {
          setError("L'élément demandé n'a pas été trouvé dans votre bibliothèque.");
        }
      } catch (e) {
        console.error("Erreur lors du chargement de l'élément de la bibliothèque:", e);
        setError("Une erreur s'est produite lors de la récupération des détails.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">Chargement des détails...</div>
      </AppLayout>
    );
  }

  if (error || !item) {
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
            <AlertDescription>{error || "Impossible de charger les détails de cet élément."}</AlertDescription>
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
                  <Badge variant="outline" className="mb-2 capitalize flex items-center w-fit">
                    {item.type === 'movie' ? <Film className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                    {item.type === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                  <h1 className="text-4xl font-bold font-headline text-primary-foreground">{item.title}</h1>
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
