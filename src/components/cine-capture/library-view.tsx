
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film, PlusCircle, LogIn, Loader2, Filter } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

function Filters({ allGenres }: { allGenres: string[] }) {
  const { typeFilter, setTypeFilter, statusFilter, setStatusFilter, genreFilter, setGenreFilter } = useLibraryFilters();

  const handleGenreChange = (genre: string, checked: boolean) => {
    setGenreFilter(prev => 
      checked ? [...prev, genre] : prev.filter(g => g !== genre)
    );
  };

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
      {allGenres.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2 text-sidebar-foreground">Genres</h4>
          <div className="space-y-2 ml-1">
            {allGenres.map(genre => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={genreFilter.includes(genre)}
                  onCheckedChange={(checked) => handleGenreChange(genre, !!checked)}
                />
                <Label htmlFor={`genre-${genre}`} className="font-normal capitalize">{genre}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


type LibraryFiltersContextType = {
  statusFilter: MediaStatus | 'all';
  setStatusFilter: (status: MediaStatus | 'all') => void;
  typeFilter: MediaType | 'all';
  setTypeFilter: (type: MediaType | 'all') => void;
  genreFilter: string[];
  setGenreFilter: (genres: string[] | ((prev: string[]) => string[])) => void;
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
  const [genreFilter, setGenreFilter] = useState<string[]>([]);

  const value = {
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    genreFilter,
    setGenreFilter,
  };

  return (
    <LibraryFiltersContext.Provider value={value}>
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
  const { isMobile } = useSidebar();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const { statusFilter, typeFilter, genreFilter } = useLibraryFilters();

  useEffect(() => {
    if (!user || !firestore) {
      if (!userLoading) {
        setItems([]);
        setItemsLoading(false);
      }
      return;
    }
  
    setItemsLoading(true);
  
    const libraryQuery = query(
      collection(firestore, 'users', user.uid, 'contents')
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

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    items.forEach(item => {
      item.genres?.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [items]);


  const filteredItems = useMemo(() => {
    const statusMatch = (item: MediaItem) => statusFilter === 'all' || item.status === statusFilter;
    const typeMatch = (item: MediaItem) => typeFilter === 'all' || item.type === typeFilter;
    const genreMatch = (item: MediaItem) => {
      if (genreFilter.length === 0) return true;
      if (!item.genres || item.genres.length === 0) return false;
      return genreFilter.every(filterGenre => item.genres.includes(filterGenre));
    };
    
    return items
      .filter(item => statusMatch(item) && typeMatch(item) && genreMatch(item))
      .sort((a, b) => {
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        // Fallback to date added if ratings are the same or one is missing
        const dateA = a.addedAt ? (a.addedAt as any).toDate() : new Date(0);
        const dateB = b.addedAt ? (b.addedAt as any).toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [items, statusFilter, typeFilter, genreFilter]);

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
    <>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Filtres</SidebarGroupLabel>
            <div className="px-2">
               <Filters allGenres={allGenres} />
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className='flex items-center gap-4'>
                {isMobile && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Ouvrir les filtres</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className='w-[300px]'>
                        <SheetHeader className='mb-4'>
                            <SheetTitle>Filtres</SheetTitle>
                        </SheetHeader>
                        <Filters allGenres={allGenres}/>
                      </SheetContent>
                    </Sheet>
                )}
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Ma Bibliothèque</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button onClick={() => router.push('/')} size={isMobile ? 'icon' : 'default'}>
                  <PlusCircle className={isMobile ? '' : 'mr-2'} />
                  <span className={isMobile ? 'sr-only' : ''}>Ajouter</span>
                </Button>
            </div>
          </div>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredItems.map(item => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-[50vh] bg-muted/50 rounded-lg">
                <Film className="w-16 h-16 text-muted-foreground mb-4"/>
                <h2 className="text-2xl font-bold mb-2">Aucun résultat</h2>
                <p className="text-muted-foreground">Essayez d'ajuster vos filtres ou d'ajouter de nouveaux films.</p>
            </div>
          )}
      </main>
    </>
  );
}
