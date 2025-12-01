'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { UploadCloud, Loader2, Star, Users, FileText, X, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import { processScreenshot } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { MediaItem } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/use-library';

const initialState = {
  data: null,
  error: null,
  success: false,
};

export default function UploadDialog() {
  const [state, formAction, isPending] = useActionState(processScreenshot, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem, isDuplicate } = useLibrary();


  useEffect(() => {
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
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
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

  const handleAddToLibrary = () => {
    if (!state.data) return;

    if (isDuplicate(state.data.title)) {
      toast({
        variant: 'destructive',
        title: 'Élément déjà existant',
        description: `"${state.data.title}" est déjà dans votre bibliothèque.`,
      });
      return; 
    }

    try {
      const newItem: MediaItem = {
        ...state.data,
        id: new Date().toISOString(),
        status: 'unwatched', 
        genres: state.data.genres || [],
        posterUrl: state.data.posterUrl || '',
        summary: state.data.summary || '',
        cast: state.data.cast || [],
      };
      
      addItem(newItem);
      
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
    setPreview(null);
    setSelectedFile(null);
    setIsResultOpen(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
    formRef.current?.reset();
  }

  const handleRemovePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };


  const result = state.data;

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col items-center justify-center space-y-6 text-center"
      >
        <div 
          className="w-full border-2 border-dashed border-muted rounded-lg p-8 cursor-pointer hover:border-primary/80 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            name="screenshotFile"
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*"
          />

          {preview ? (
            <div className="relative">
              <Image src={preview} alt="Aperçu de la capture d'écran" width={400} height={250} className="rounded-md object-contain mx-auto max-h-48" />
              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemovePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
              <UploadCloud className="h-12 w-12" />
              <p className="font-semibold">Glissez-déposez une capture d'écran</p>
              <p className="text-sm">ou cliquez pour sélectionner un fichier</p>
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={!preview || isPending} 
          className="w-full"
          size="lg"
        >
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isPending ? 'Analyse en cours...' : 'Analyser la capture d\'écran'}
        </Button>
      </form>

      <Dialog open={isResultOpen} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold font-headline">Résultats de l'analyse</DialogTitle>
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
