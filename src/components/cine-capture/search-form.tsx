'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { Loader2, Star, Users, FileText, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import { processTextSearch } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { MediaItem } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const initialState = {
  data: null,
  error: null,
  success: false,
};

const LIBRARY_KEY = 'cine-capture-library';

export default function SearchForm() {
  const [state, formAction, isPending] = useActionState(processTextSearch, initialState);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    if (state.success && state.data) {
      setIsResultOpen(true);
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: "La recherche a échoué",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleAddToLibrary = () => {
    if (!state.data) return;

    try {
      const localData = localStorage.getItem(LIBRARY_KEY);
      const library: MediaItem[] = localData ? JSON.parse(localData) : [];
      
      const isDuplicate = library.some(
        item => item.title.trim().toLowerCase() === state.data!.title.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast({
          variant: 'destructive',
          title: 'Élément déjà existant',
          description: `"${state.data.title}" est déjà dans votre bibliothèque.`,
        });
        return; 
      }

      const newItem: MediaItem = {
        ...state.data,
        id: Date.now().toString(),
        status: 'unwatched', 
        genres: state.data.genres || [],
        posterUrl: state.data.posterUrl || '',
        summary: state.data.summary || '',
        cast: state.data.cast || [],
      };
      
      const newLibrary = [...library, newItem];
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary));
      window.dispatchEvent(new StorageEvent('storage', {
        key: LIBRARY_KEY,
        newValue: JSON.stringify(newLibrary)
      }));
      
      toast({
        title: 'Ajouté à la bibliothèque !',
        description: `${newItem.title} a été ajouté à votre bibliothèque personnelle.`,
      });
      
      reset();
      router.push('/library');
    } catch (error) {
      console.error("Failed to add to library:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'élément à la bibliothèque.',
      });
    }
  };

  const reset = () => {
    setIsResultOpen(false);
    formRef.current?.reset();
  }

  const result = state.data;

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col items-center justify-center space-y-6 text-center"
      >
        <div className='w-full space-y-2 text-left'>
            <Label htmlFor='title'>Titre du film ou de la série</Label>
            <Input id="title" name="title" placeholder="Ex: Inception" required/>
        </div>
        <RadioGroup name="type" defaultValue="movie" className="flex space-x-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="movie" id="type-movie" />
                <Label htmlFor="type-movie">Film</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="series" id="type-series" />
                <Label htmlFor="type-series">Série</Label>
            </div>
        </RadioGroup>
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full"
          size="lg"
        >
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isPending ? 'Recherche en cours...' : 'Rechercher'}
        </Button>
      </form>

      <Dialog open={isResultOpen} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold font-headline">Résultats de la recherche</DialogTitle>
          </DialogHeader>
          {result && (
             <ScrollArea className="max-h-[70vh]">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-full min-h-[400px] hidden md:block">
                  <Image
                    src={result?.posterUrl || 'https://picsum.photos/seed/movie-placeholder/500/750'}
                    alt={result?.title || 'Affiche de film'}
                    fill
                    className="object-cover rounded-l-lg"
                    data-ai-hint="movie poster"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <Badge variant="outline" className="mb-2 capitalize flex items-center w-fit">
                    {result.type === 'movie' ? <Film className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                    {result.type === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                  <h2 className="text-3xl font-bold font-headline text-primary-foreground">{result.title}</h2>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.rating && (
                       <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400"/>
                          <span className="text-lg font-bold text-white">{result.rating.toFixed(1)}</span>
                          <span className="text-xs">/ 10</span>
                       </div>
                    )}
                    {result.genres && result.genres.length > 0 && (
                      <div className="hidden md:flex items-center gap-2 flex-wrap">
                          {result.genres.slice(0, 2).map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
                      </div>
                    )}
                  </div>
                  
                  <div className='space-y-2'>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> Synopsis</h3>
                    <p className="text-sm text-muted-foreground max-h-28 overflow-y-auto">{result.summary}</p>
                  </div>
  
                  <div className='space-y-2'>
                      <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5"/> Distribution</h3>
                      <p className="text-sm text-muted-foreground">{result.cast.join(', ')}</p>
                  </div>

                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="p-6 pt-0 sm:justify-between sm:flex-row-reverse w-full bg-background rounded-b-lg">
            <Button onClick={handleAddToLibrary} size="lg">
              Ajouter à ma bibliothèque
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={reset}>
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
