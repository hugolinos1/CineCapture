'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { UploadCloud, Loader2, Star, Users, FileText, X, Film, Tv, Languages } from 'lucide-react';
import Image from 'next/image';
import { processScreenshot } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { EnrichedMovieDetails, MediaItem } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';

const initialState = {
  data: null,
  error: null,
  success: false,
};

function SubmitButton() {
    // Note: useFormStatus is not used here to avoid the experimental warning,
    // but in a real app it would be used to show a pending state.
    // For now, we rely on the parent component's isPending state.
    return (
        <Button type="submit" className="w-full">
            Analyser la capture d'écran
        </Button>
    );
}


export default function UploadDialog() {
  const [state, formAction] = useFormState(processScreenshot, initialState);

  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    setIsPending(false);
    if (state.success && state.data) {
      setIsResultOpen(true);
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: "L'analyse a échoué",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setPreview(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };
  
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preview) return;
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };


  const handleAddToLibrary = () => {
    if (!state.data) return;

    const newItem: MediaItem = {
      ...state.data,
      id: new Date().toISOString(),
      status: 'unwatched', 
      genres: state.data.genres || [],
      posterUrl: state.data.posterUrl || '',
      summary: state.data.summary || '',
      cast: state.data.cast || [],
    };

    try {
      const existingLibrary = JSON.parse(localStorage.getItem('cine-capture-library') || '[]');
      const updatedLibrary = [...existingLibrary, newItem];
      localStorage.setItem('cine-capture-library', JSON.stringify(updatedLibrary));
      
      toast({
        title: 'Ajouté à la bibliothèque !',
        description: `${newItem.title} a été ajouté à votre bibliothèque personnelle.`,
      });
      
      window.dispatchEvent(new Event('storage'));
      
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
    setPreview(null);
    setIsResultOpen(false);
    setIsPending(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
    formRef.current?.reset();
  }

  const handleRemovePreview = () => {
    setPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
        <input type="hidden" name="screenshot" value={preview ?? ''} />
        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <Image 
                src={preview} 
                alt="Aperçu de la capture d'écran" 
                width={500}
                height={300}
                className="rounded-md object-contain mx-auto max-h-[300px]" 
              />
               <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white hover:text-white"
                onClick={handleRemovePreview}
                type="button"
                >
                  <X className="h-4 w-4" />
              </Button>
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                'Analyser la capture d\'écran'
              )}
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center space-y-4 text-center p-8 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-bold font-headline">Télécharger une capture d'écran</h2>
            <p className="text-muted-foreground">Glissez-déposez une image ou cliquez pour sélectionner un fichier.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              name="file-upload" 
            />
          </div>
        )}
      </form>
        
      <Dialog open={isResultOpen} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="sm:max-w-[825px] bg-background p-0">
          <div className="grid md:grid-cols-2">
            <div className="relative h-full min-h-[400px] hidden md:block">
              <Image
                src={state.data?.posterUrl || 'https://picsum.photos/seed/movie-placeholder/500/750'}
                alt={state.data?.title || 'Affiche de film'}
                fill
                className="object-cover rounded-l-lg"
                data-ai-hint="movie poster"
              />
            </div>
            <div className="p-6 flex flex-col">
              <DialogHeader>
                 <Badge variant="outline" className="mb-2 capitalize flex items-center w-fit">
                    {state.data?.type === 'movie' ? <Film className="mr-2 h-4 w-4" /> : <Tv className="mr-2 h-4 w-4" />}
                    {state.data?.type === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                <DialogTitle className="text-2xl font-headline mb-2">{state.data?.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4 flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {state.data?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{state.data.rating.toFixed(1)}</span>
                        </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                      <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/> Synopsis</h3>
                      <p className="text-sm text-muted-foreground">{state.data?.summary}</p>
                  </div>

                  <div className='space-y-2'>
                      <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4"/> Distribution</h3>
                      <p className="text-sm text-muted-foreground">{state.data?.cast?.join(', ')}</p>
                  </div>
                  {state.data?.genres && state.data.genres.length > 0 && (
                    <div className='space-y-2'>
                        <h3 className="font-semibold flex items-center gap-2"><Languages className="w-4 h-4" /> Genres</h3>
                        <div className="flex flex-wrap gap-2">
                        {state.data.genres.map(genre => (
                            <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                        </div>
                    </div>
                )}
                </div>
              </ScrollArea>
              <DialogFooter className='pt-6 mt-auto'>
                <Button variant="outline" onClick={reset}>Essayer un autre</Button>
                <Button onClick={handleAddToLibrary}>Ajouter à la bibliothèque</Button>
              </DialogFooter>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={reset}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
