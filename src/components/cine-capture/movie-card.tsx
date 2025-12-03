
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { MediaItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import PlatformLogo from './platform-logo';


interface MovieCardProps {
  item: MediaItem;
}

export default function MovieCard({ item }: MovieCardProps) {
  const posterSrc = item.posterUrl || 'https://picsum.photos/seed/placeholder/500/750';
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Non connecté",
            description: "Vous devez être connecté pour supprimer un élément.",
        });
        return;
    }

    try {
      const docRef = doc(firestore, 'users', user.uid, 'contents', item.id);
      await deleteDoc(docRef);
      toast({
        title: 'Élément supprimé',
        description: `"${item.title}" a été retiré de votre bibliothèque.`,
      });
      setIsDialogOpen(false); // Close the dialog on successful deletion
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      toast({
        variant: "destructive",
        title: 'Erreur',
        description: "Une erreur est survenue lors de la suppression.",
      });
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
  };
  
  const handleDialogChange = (open: boolean) => {
    // This allows clicking "Cancel" to work as expected without navigation
    if (!open) {
      setTimeout(() => setIsDialogOpen(false), 150);
    } else {
       setIsDialogOpen(open);
    }
  }


  return (
    <Card className="overflow-hidden group relative aspect-[2/3] border-0 shadow-lg h-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20">
       <Link href={`/library/${item.id}`} passHref className="absolute inset-0 z-0">
          <CardContent className="p-0 h-full">
            <Image
              src={posterSrc}
              alt={`Affiche pour ${item.title}`}
              width={500}
              height={750}
              className="object-cover w-full h-full"
              data-ai-hint="movie poster"
            />
            {item.platform && (
              <div className="absolute top-2 left-2 z-10 bg-black/60 p-1 rounded-md">
                 <PlatformLogo platform={item.platform} className="h-5 w-auto" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-bold text-base text-white drop-shadow-md truncate">{item.title}</h3>
            </div>
          </CardContent>
        </Link>
        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <AlertDialogTrigger asChild>
            <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleTriggerClick}
                >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Voulez-vous vraiment supprimer "{item.title}" de votre bibliothèque ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setIsDialogOpen(false); }}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
