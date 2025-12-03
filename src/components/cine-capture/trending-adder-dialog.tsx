
'use client';

import React, { useState } from 'react';
import { Loader2, Star, Users, FileText, Tv, LogIn } from 'lucide-react';
import Image from 'next/image';
import { enrichExtractedMovieDetails } from '@/lib/actions';
import type { EnrichedMovieDetails, TrendingMedia } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import PlatformLogo from './platform-logo';
import TrendingMediaCard from './trending-media-card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


interface TrendingAdderDialogProps {
    item: TrendingMedia;
    mediaType: 'movie' | 'series' | 'miniseries';
}

export default function TrendingAdderDialog({ item, mediaType }: TrendingAdderDialogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<EnrichedMovieDetails | null>(null);

    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();

    const handleCardClick = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour ajouter un film ou une série.',
            });
            return;
        }

        setIsDialogOpen(true);
        setIsLoading(true);
        setError(null);
        setDetails(null);

        try {
            const enrichedDetails = await enrichExtractedMovieDetails({
                title: item.title,
                type: mediaType,
            });

            if (!enrichedDetails || !enrichedDetails.title) {
                throw new Error("Impossible de récupérer les détails de ce média.");
            }
            setDetails(enrichedDetails);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue.';
            setError(`L'analyse a échoué: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddToLibrary = async () => {
        if (!details || !user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Non connecté ou données manquantes',
                description: 'Vous devez être connecté pour effectuer cette action.',
            });
            return;
        }

        const libraryRef = collection(firestore, 'users', user.uid, 'contents');
        const q = query(libraryRef, where('title', '==', details.title.trim()));
        
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                toast({
                    variant: 'destructive',
                    title: 'Élément déjà existant',
                    description: `"${details.title}" est déjà dans votre bibliothèque.`,
                });
                return;
            }

            const newItem = {
                ...details,
                userId: user.uid,
                status: 'unwatched' as const,
                addedAt: serverTimestamp(),
            };

            addDoc(libraryRef, newItem)
              .then(() => {
                toast({
                    title: 'Ajouté à la bibliothèque !',
                    description: `${newItem.title} a été ajouté à votre collection.`,
                });
                setIsDialogOpen(false);
                router.push('/library');
              })
              .catch((error) => {
                console.error("Failed to add to library:", error);
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: libraryRef.path,
                    operation: 'create',
                    requestResourceData: newItem
                }));
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: "Impossible d'ajouter l'élément.",
                });
              });

        } catch (error) {
            console.error("Failed to query library:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: "Impossible de vérifier votre bibliothèque. Vérifiez les permissions Firestore.",
            });
        }
    };

    const typeLabels: Record<string, string> = {
        movie: 'Film',
        series: 'Série',
        miniseries: 'Mini-série',
    };

    return (
        <>
            <TrendingMediaCard item={item} onClick={handleCardClick} className="cursor-pointer"/>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl w-full p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-bold font-headline">Détails du média</DialogTitle>
                    </DialogHeader>

                    {isLoading && (
                         <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
                            <Loader2 className="w-12 h-12 animate-spin" />
                            <p className="text-lg">Recherche des informations...</p>
                         </div>
                    )}
                    {error && !isLoading && (
                        <div className="p-6">
                            <Alert variant="destructive">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {details && !isLoading && (
                        <ScrollArea className="max-h-[70vh]">
                            <div className="grid md:grid-cols-2 gap-0">
                                <div className="relative h-full min-h-[400px] hidden md:block">
                                    <Image
                                        src={details.posterUrl || 'https://picsum.photos/seed/movie-placeholder/500/750'}
                                        alt={`Affiche de ${details.title}`}
                                        fill
                                        className="object-cover rounded-l-lg"
                                        data-ai-hint="movie poster"
                                    />
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 capitalize flex items-center w-fit">
                                            <Tv className="mr-2 h-4 w-4" />
                                            {typeLabels[details.type] || 'Contenu'}
                                        </Badge>
                                        <div className="h-6 flex items-center">
                                            <PlatformLogo platform={details.platform} className="h-5 w-auto" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold font-headline text-primary-foreground">{details.title}</h2>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {details.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                <span className="text-lg font-bold text-white">{details.rating.toFixed(1)}</span>
                                                <span className="text-xs">/ 10</span>
                                            </div>
                                        )}
                                        {details.genres && details.genres.length > 0 && (
                                            <div className="hidden md:flex items-center gap-2 flex-wrap">
                                                {details.genres.slice(0, 2).map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
                                            </div>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Synopsis</h3>
                                        <p className="text-sm text-muted-foreground max-h-28 overflow-y-auto">{details.summary}</p>
                                    </div>

                                    <div className='space-y-2'>
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Distribution</h3>
                                        <p className="text-sm text-muted-foreground">{details.cast.join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    <DialogFooter className="p-6 pt-0 sm:justify-between sm:flex-row-reverse w-full bg-background rounded-b-lg">
                        <Button onClick={handleAddToLibrary} size="lg" disabled={isLoading || !details}>
                           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Ajouter à ma bibliothèque
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Fermer
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

    