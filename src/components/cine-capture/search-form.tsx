
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { Loader2, Star, Users, FileText, Film, Tv, LogIn } from 'lucide-react';
import Image from 'next/image';
import { processTextSearch } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';


const initialState = {
  data: null,
  error: null,
  success: false,
};

export default function SearchForm() {
  const [state, formAction, isPending] = useActionState(processTextSearch, initialState);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();


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

  const handleAddToLibrary = async () => {
    if (!state.data || !user) {
        toast({
            variant: 'destructive',
            title: 'Non connecté',
            description: 'Vous devez être connecté pour ajouter un élément à votre bibliothèque.',
        });
        return;
    }
    
    // Close dialog and navigate immediately for a better UX
    reset();
    router.push('/library');

    try {
      const libraryRef = collection(firestore, 'users', user.uid, 'library');

      const q = query(libraryRef, where('title', '==', state.data.title.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
         toast({
          variant: 'destructive',
          title: 'Élément déjà existant',
          description: `"${state.data.title}" est déjà dans votre bibliothèque.`,
        });
        return; 
      }

      const newItem = {
        ...state.data,
        userId: user.uid,
        status: 'unwatched', 
        genres: state.data.genres || [],
        posterUrl: state.data.posterUrl || '',
        summary: state.data.summary || '',
        cast: state.data.cast || [],
        addedAt: serverTimestamp(),
      };
      
      await addDoc(libraryRef, newItem);
      
      toast({
        title: 'Ajouté à la bibliothèque !',
        description: `${newItem.title} a été ajouté à votre bibliothèque personnelle.`,
      });
      
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
  const typeLabels = {
    movie: 'Film',
    series: 'Série',
    miniseries: 'Mini-série',
  };
  
  if (!user && !userLoading) {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-4 bg-muted/50 rounded-lg">
            <LogIn className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">Veuillez vous connecter pour rechercher et ajouter un film.</p>
        </div>
    )
  }

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
        <RadioGroup name="type" defaultValue="movie" className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="movie" id="type-movie" />
                <Label htmlFor="type-movie">Film</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="series" id="type-series" />
                <Label htmlFor="type-series">Série</Label>
            </div>
             <div className="flex items-center space-x-2">
                <RadioGroupItem value="miniseries" id="type-miniseries" />
                <Label htmlFor="type-miniseries">Mini-série</Label>
            </div>
        </RadioGroup>
        <Button 
          type="submit" 
          disabled={isPending || !user} 
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
                    <Tv className="mr-2 h-4 w-4" />
                    {typeLabels[result.type] || 'Contenu'}
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
