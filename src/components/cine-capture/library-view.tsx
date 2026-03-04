
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film, PlusCircle, LogIn, Loader2, Filter, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '../ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

function Filters({ allGenres, allPlatforms }: { allGenres: string[], allPlatforms: string[] }) {
  const { 
    typeFilter, setTypeFilter, 
    statusFilter, setStatusFilter, 
    genreFilter, setGenreFilter,
    platformFilter, setPlatformFilter
  } = useLibraryFilters();

  const handleGenreChange = (genre: string, checked: boolean) => {
    setGenreFilter(prev => 
      checked ? [...prev, genre] : prev.filter(g => g !== genre)
    );
  };

  const resetFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setGenreFilter([]);
    setPlatformFilter('all');
  };

  const activeFiltersCount = 
    (typeFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (platformFilter !== 'all' ? 1 : 0) + 
    genreFilter.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Filtres actifs</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['type', 'status']} className="w-full">
        <AccordionItem value="type" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">Type</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={typeFilter} onValueChange={(value) => setTypeFilter(value as MediaType | 'all')} className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'type-all', value: 'all', label: 'Tous' },
                { id: 'type-movie', value: 'movie', label: 'Films' },
                { id: 'type-series', value: 'series', label: 'Séries' },
                { id: 'type-miniseries', value: 'miniseries', label: 'Mini-séries' }
              ].map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={opt.value} id={opt.id} />
                  <Label htmlFor={opt.id} className="text-xs cursor-pointer flex-1">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="status" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">Statut</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as MediaStatus | 'all')} className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'status-all', value: 'all', label: 'Tous' },
                { id: 'status-watched', value: 'watched', label: 'Vus' },
                { id: 'status-in-progress', value: 'in-progress', label: 'En cours' },
                { id: 'status-unwatched', value: 'unwatched', label: 'Non vus' }
              ].map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={opt.value} id={opt.id} />
                  <Label htmlFor={opt.id} className="text-xs cursor-pointer flex-1">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {allPlatforms.length > 0 && (
          <AccordionItem value="platforms" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">Plateforme</span>
            </AccordionTrigger>
            <AccordionContent>
              <RadioGroup value={platformFilter} onValueChange={(value) => setPlatformFilter(value)} className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="all" id="platform-all" />
                  <Label htmlFor="platform-all" className="text-xs cursor-pointer flex-1">Toutes</Label>
                </div>
                {allPlatforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={platform} id={`platform-${platform}`} />
                    <Label htmlFor={`platform-${platform}`} className="text-xs cursor-pointer flex-1 capitalize truncate">{platform}</Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}

        {allGenres.length > 0 && (
          <AccordionItem value="genres" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">Genres</span>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4 pt-1">
                <div className="grid grid-cols-1 gap-1">
                  {allGenres.map(genre => (
                    <div key={genre} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/30 transition-colors cursor-pointer">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={genreFilter.includes(genre)}
                        onCheckedChange={(checked) => handleGenreChange(genre, !!checked)}
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-xs cursor-pointer flex-1 capitalize">{genre}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
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
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;
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
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const value = {
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    genreFilter,
    setGenreFilter,
    platformFilter,
    setPlatformFilter,
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { isMobile } = useSidebar();
  
  const { statusFilter, typeFilter, genreFilter, platformFilter } = useLibraryFilters();

  const libraryQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'contents'));
  }, [user, firestore]);

  const { data: items, loading: itemsLoading } = useCollection<MediaItem>(libraryQuery);

  const allGenres = useMemo(() => {
    if (!items) return [];
    const genres = new Set<string>();
    items.forEach(item => {
      item.genres?.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [items]);

  const allPlatforms = useMemo(() => {
    if (!items) return [];
    const platforms = new Set<string>();
    items.forEach(item => {
        if(item.platform) {
            platforms.add(item.platform);
        }
    });
    return Array.from(platforms).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const statusMatch = (item: MediaItem) => statusFilter === 'all' || item.status === statusFilter;
    const typeMatch = (item: MediaItem) => typeFilter === 'all' || item.type === typeFilter;
    const platformMatch = (item: MediaItem) => platformFilter === 'all' || item.platform === platformFilter;
    const genreMatch = (item: MediaItem) => {
      if (genreFilter.length === 0) return true;
      if (!item.genres || item.genres.length === 0) return false;
      return genreFilter.every(filterGenre => item.genres.includes(filterGenre));
    };
    
    return items
      .filter(item => statusMatch(item) && typeMatch(item) && genreMatch(item) && platformMatch(item))
      .sort((a, b) => {
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        const dateA = a.addedAt ? (a.addedAt as any).toDate() : new Date(0);
        const dateB = b.addedAt ? (b.addedAt as any).toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [items, statusFilter, typeFilter, genreFilter, platformFilter]);

  const activeFiltersCount = 
    (typeFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (platformFilter !== 'all' ? 1 : 0) + 
    genreFilter.length;

  const isLoading = isUserLoading || itemsLoading;

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
            <SidebarGroupLabel className="mb-2">Filtres</SidebarGroupLabel>
            <div className="px-3">
               <Filters allGenres={allGenres} allPlatforms={allPlatforms}/>
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
                        <Button variant="outline" size="sm" className="relative">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtres
                            {activeFiltersCount > 0 && (
                              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {activeFiltersCount}
                              </Badge>
                            )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className='h-[80vh] rounded-t-xl px-6'>
                        <SheetHeader className='flex flex-row items-center justify-between mb-4 space-y-0'>
                            <SheetTitle>Filtres</SheetTitle>
                            <SheetClose asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                              </Button>
                            </SheetClose>
                        </SheetHeader>
                        <Filters allGenres={allGenres} allPlatforms={allPlatforms} />
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
