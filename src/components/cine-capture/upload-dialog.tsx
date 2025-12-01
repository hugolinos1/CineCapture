'use client';

import React, { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { UploadCloud, Film, Loader2, Star, Users, FileText, AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';
import { processScreenshot } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { EnrichedMovieDetails } from '@/lib/types';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze Screenshot'
      )}
    </Button>
  );
}

export default function UploadDialog() {
  const [initialState, setInitialState] = useState<{ data: EnrichedMovieDetails | null; error: string | null; success: boolean; }>({ data: null, error: null, success: false });
  const [state, formAction] = useActionState(processScreenshot, initialState);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success && state.data) {
      setIsResultOpen(true);
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error,
      });
    }
  }, [state, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        formRef.current?.requestSubmit();
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
         formRef.current?.requestSubmit();
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleAddToLibrary = () => {
    toast({
      title: 'Added to Library!',
      description: `${state.data?.title} has been added to your personal library.`,
    });
    reset();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setIsResultOpen(false);
    setInitialState({ data: null, error: null, success: false });
    if(formRef.current) formRef.current.reset();
  }


  return (
    <>
      <form action={formAction} ref={formRef}>
         <input
          type="hidden"
          name="screenshot"
          value={preview ?? ''}
        />
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center p-8 cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold font-headline">Upload a Screenshot</h2>
          <p className="text-muted-foreground">Drag & drop an image or click to select a file.</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
        <div className='hidden'>
          <SubmitButton/>
        </div>
      </form>
        
      <Dialog open={isResultOpen} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="sm:max-w-[825px] bg-background p-0">
          <div className="grid md:grid-cols-2">
            <div className="relative h-full min-h-[400px] hidden md:block">
              <Image
                src={state.data?.posterUrl || 'https://picsum.photos/seed/placeholder/500/750'}
                alt={state.data?.title || 'Movie Poster'}
                fill
                className="object-cover rounded-l-lg"
                data-ai-hint="movie poster"
              />
            </div>
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline mb-2">{state.data?.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{state.data?.type}</Badge>
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
                    <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4"/> Cast</h3>
                    <p className="text-sm text-muted-foreground">{state.data?.cast.join(', ')}</p>
                </div>
              </div>
              </ScrollArea>
              <DialogFooter className='pt-6'>
                <Button variant="outline" onClick={reset}>Try another</Button>
                <Button onClick={handleAddToLibrary}>Add to Library</Button>
              </DialogFooter>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={reset}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
