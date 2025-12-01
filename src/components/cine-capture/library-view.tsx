'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film, Trash2, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarProvider } from '../ui/sidebar';
import { Button } from '../ui/button';
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

const LIBRARY_KEY = 'cine-capture-library';

export default function LibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const { toast } = useToast();

  const loadLibrary = useCallback(() => {
    try {
      const localData = localStorage.getItem(LIBRARY_KEY);
      if (localData) {
        setItems(JSON.parse(localData));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load library from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
    setIsMounted(true);
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LIBRARY_KEY) {
        loadLibrary();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadLibrary]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      return statusMatch && typeMatch;
    }).sort((a, b) => {
        const dateA = new Date(a.id).getTime();
        const dateB = new Date(b.id).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateB - dateA;
    });
  }, [items, statusFilter, typeFilter]);

  const handleClearLibrary = () => {
    try {
      localStorage.removeItem(LIBRARY_KEY);
      setItems([]);
      window.dispatchEvent(new StorageEvent('storage', { key: LIBRARY_KEY, newValue: null }));
      toast({
        title: 'Bibliothèque vidée',
        description: 'Tous les éléments ont été supprimés de votre bibliothèque.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de vider la bibliothèque.',
      });
    }
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Filtres</SidebarGroupLabel>
              <div className="px-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-sidebar-foreground">Type</h4>
                     <RadioGroup value={typeFilter} onValueChange={(value) => setTypeFilter(value as MediaType | 'all')} className="ml-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="type-all" />
                        <Label htmlFor="type-all">Tous</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="movie" id="type-movie" />
                        <Label htmlFor="type-movie">Films</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="series" id="type-series" />
                        <Label htmlFor="type-series">Séries</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="miniseries" id="type-miniseries" />
                        <Label htmlFor="type-miniseries">Mini-séries</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-sidebar-foreground">Statut</h4>
                    <RadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as MediaStatus | 'all')} className="ml-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="status-all" />
                        <Label htmlFor="status-all">Tous</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="watched" id="status-watched" />
                        <Label htmlFor="status-watched">Vus</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-progress" id="status-in-progress" />
                        <Label htmlFor="status-in-progress">En cours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unwatched" id="status-unwatched" />
                        <Label htmlFor="status-unwatched">Non vus</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">Ma Bibliothèque</h1>
             <div className="flex items-center gap-4">
               <Button asChild>
                <Link href="/">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter
                </Link>
              </Button>
              {items.length > 0 && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Vider la bibliothèque
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement tous les éléments de votre bibliothèque.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearLibrary}>Oui, tout supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
              )}
             </div>
          </div>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {filteredItems.map(item => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-[50vh] bg-muted/50 rounded-lg">
                <Film className="w-16 h-16 text-muted-foreground mb-4"/>
                <h2 className="text-2xl font-bold mb-2">Bibliothèque vide</h2>
                <p className="text-muted-foreground">Commencez par ajouter un film ou une série.</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
