
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film, Trash2, PlusCircle, LogIn, Loader2, Filter } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarProvider, useSidebar } from '../ui/sidebar';
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
import { useFirestore, useUser } from '@/firebase';
import { collection, writeBatch, getDocs, query, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore';

function Filters() {
  const { typeFilter, setTypeFilter, statusFilter, setStatusFilter } = useLibraryFilters();

  return (
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
  );
}


type LibraryFiltersContextType = {
  statusFilter: MediaStatus | 'all';
  setStatusFilter: (status: MediaStatus | 'all') => void;
  typeFilter: MediaType | 'all';
  setTypeFilter: (type: MediaType | 'all') => void;
};

const LibraryFiltersContext = React.createContext<LibraryFiltersContextType | undefined>(undefined);

const useLibraryFilters = () => {
  const context = React.useContext(LibraryFiltersContext);
  if (!context) {
    throw new Error('useLibraryFilters must be used within a LibraryFiltersProvider');
  }
  return context;
};


function LibraryFiltersProvider({ children }: { children: React.ReactNode }) {
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');

  return (
    <LibraryFiltersContext.Provider value={{ statusFilter, setStatusFilter, typeFilter, setTypeFilter }}>
      {children}
    </LibraryFiltersContext.Provider>
  );
}


export default function LibraryView() {
  return (
    <LibraryFiltersProvider>
      <LibraryViewContent />
    </LibraryFiltersProvider>
  )
}

function LibraryViewContent() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { isMobile, toggleSidebar } = useSidebar();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const { statusFilter, typeFilter } = useLibraryFilters();

  useEffect(() => {
    if (!user || !firestore) {
      if (!userLoading) {
        setItemsLoading(false);
        setItems([]);
      }
      return;
    }

    setItemsLoading(true);
    const libraryQuery = query(
      collection(firestore, 'users', user.uid, 'contents'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      libraryQuery,
      (snapshot) => {
        const result: MediaItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
        setItems(result);
        setItemsLoading(false);
      },
      (error) => {
        console.error("Error fetching collection:", error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger la bibliothèque.',
        });
        setItemsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, firestore, toast, userLoading]);


  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [items, statusFilter, typeFilter]);

  const handleClearLibrary = async () => {
    if (!user || !firestore) return;
    try {
      const libraryRef = collection(firestore, 'users', user.uid, 'contents');
      const q = query(libraryRef);
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(firestore);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

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
       console.error("Error clearing library: ", error);
    }
  };

  const isLoading = userLoading || itemsLoading;

  if (isLoading) {
      return (
          <div className="flex-1 p-8 flex justify-center items-center">
              <div className='flex flex-col items-center gap-4 text-muted-foreground'>
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="text-lg">Chargement de votre bibliothèque...</p>
              </div>
          </div>
      )
  }

  if (!user) {
    return (
        <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center justify-center text-center h-[70vh] bg-muted/50 rounded-lg">
                <LogIn className="w-16 h-16 text-muted-foreground mb-4"/>
                <h2 className="text-2xl font-bold mb-2">Connectez-vous pour voir votre bibliothèque</h2>
                <p className="text-muted-foreground">Votre collection personnelle de films et séries vous attend.</p>
                <Button onClick={() => router.push('/')} className="mt-6">
                  Retour à l'accueil
                </Button>
            </div>
        </main>
    );
  }

  return (
      <div className="flex flex-1">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Filtres</SidebarGroupLabel>
              <div className="px-2">
                 <Filters />
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
             <div className='flex items-center gap-4'>
                {isMobile && (
                    <Button variant="outline" size="icon" onClick={toggleSidebar}>
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filtres</span>
                    </Button>
                )}
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Ma Bibliothèque</h1>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
               <Button onClick={() => router.push('/')} size={isMobile ? 'icon' : 'default'}>
                  <PlusCircle className={isMobile ? '' : 'mr-2'} />
                  <span className={isMobile ? 'sr-only' : ''}>Ajouter</span>
                </Button>
              {items && items.length > 0 && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size={isMobile ? 'sm' : 'sm'}>
                            <Trash2 className="mr-0 md:mr-2 h-4 w-4" /> <span className='hidden md:inline'>Vider</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement tous les éléments de votre bibliothèque.
                          </dlalogDescription>
                        </dlalogHeader>
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
  );
}
