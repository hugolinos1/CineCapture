'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film } from 'lucide-react';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const initialLibrary: MediaItem[] = [
  {
    id: '1',
    title: 'Cosmic Echoes',
    type: 'movie',
    summary: 'A lone astronaut discovers a mysterious signal from a distant galaxy, leading her on a perilous journey to uncover the origins of the universe.',
    posterUrl: 'https://images.unsplash.com/photo-1611419010196-a360856fc42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtb3ZpZSUyMHBvc3RlcnxlbnwwfHx8fDE3NjQ1MTYxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Aria Vance', 'Leo Cruz', 'Dr. Aris Thorne'],
    rating: 8.5,
    status: 'unwatched',
    genres: ['Science Fiction', 'Thriller'],
  },
  {
    id: '2',
    title: 'The Last Painter',
    type: 'movie',
    summary: 'In a world devoid of color, an elderly artist holds the last pigments. He must decide whether to share his gift or protect it from a monochrome society.',
    posterUrl: 'https://images.unsplash.com/photo-1641549058491-8a3442385da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bW92aWUlMjBwb3N0ZXJ8ZW58MHx8fHwxNzY0NTE2MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Elias Thorne', 'Clara Belle', 'Marcus Grey'],
    rating: 9.1,
    status: 'watched',
    genres: ['Drama', 'Fantasy'],
  },
  {
    id: '3',
    title: 'Zero Protocol',
    type: 'movie',
    summary: 'A rogue agent is activated to stop a cyber-terrorist group from unleashing a digital plague that could collapse the global economy.',
    posterUrl: 'https://images.unsplash.com/photo-1590179068383-b9c69aacebd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxtb3ZpZSUyMHBvc3RlcnxlbnwwfHx8fDE3NjQ1MTYxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Jax Ryder', 'Zara Khan', 'General Stone'],
    rating: 7.8,
    status: 'in-progress',
    genres: ['Action', 'Thriller'],
  },
  {
    id: '4',
    title: 'The Pineapple Incident',
    type: 'movie',
    summary: 'Two bumbling detectives accidentally get entangled with a crime syndicate after a mix-up involving a pineapple and a briefcase full of cash.',
    posterUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtb3ZpZSUyMHBvc3RlcnxlbnwwfHx8fDE3NjQ1MTYxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Milo Fitz', 'Penny Lane', 'Don "The Juice" Mango'],
    rating: 7.2,
    status: 'unwatched',
    genres: ['Comedy', 'Crime'],
  },
  {
    id: '5',
    title: 'Aethelgard',
    type: 'series',
    summary: 'A historical epic chronicling the rise of a young shieldmaiden who unites warring clans to defend their homeland from a formidable invading empire.',
    posterUrl: 'https://images.unsplash.com/photo-1696787717706-d9d9fc9313fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzZXJpZXMlMjBwb3N0ZXJ8ZW58MHx8fHwxNzY0NTgzMDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Freya Ironside', 'Bjorn Lothar', 'King Alaric'],
    rating: 8.9,
    status: 'watched',
    genres: ['History', 'Drama', 'Action'],
  },
  {
    id: '6',
    title: 'The Crystal Key',
    type: 'series',
    summary: 'In a realm powered by magic, a group of young mages must find the legendary Crystal Key to restore balance before their world is consumed by shadow creatures.',
    posterUrl: 'https://images.unsplash.com/photo-1517186958245-5b1e715f4597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzZXJpZXMlMjBwb3N0ZXJ8ZW58MHx8fHwxNzY0NTgzMDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Lyra Meadowlight', 'Kaelen Shadowhand', 'Elara the Wise'],
    rating: 8.2,
    status: 'in-progress',
    genres: ['Fantasy', 'Adventure'],
  },
  {
    id: '7',
    title: 'Orion\'s Belt',
    type: 'series',
    summary: 'The crew of the starship Orion navigates the treacherous outer belt, smuggling goods and dodging the authoritarian Galactic Federation.',
    posterUrl: 'https://images.unsplash.com/photo-1517186958245-5b1e715f4597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzZXJpZXMlMjBwb3N0ZXJ8ZW58MHx8fHwxNzY0NTgzMDQ2fDA&ixlib-rb-4.1.0&q=80&w=1080',
    cast: ['Captain Eva Rostova', 'Jax "The Fixer" Smith', 'Nova'],
    rating: 8.7,
    status: 'unwatched',
    genres: ['Science Fiction', 'Adventure'],
  },
  {
    id: '8',
    title: 'Wild Frontiers',
    type: 'movie',
    summary: 'A breathtaking documentary exploring the most remote and untouched ecosystems on Earth, revealing the secret lives of its unique inhabitants.',
    posterUrl: 'https://images.unsplash.com/photo-1634845077820-eb1702e94d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxkb2N1bWVudGFyeSUyMHBvc3RlcnxlbnwwfHx8fDE3NjQ1ODMwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    cast: ['Narrated by David Attenborough'],
    rating: 9.5,
    status: 'watched',
    genres: ['Documentary', 'Nature'],
  },
];


export default function LibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [isMounted, setIsMounted] = useState(false);

  const loadLibrary = () => {
    try {
      const localData = localStorage.getItem('cine-capture-library');
      if (localData) {
        setItems(JSON.parse(localData));
      } else {
        // If no local data, initialize with mock data
        localStorage.setItem('cine-capture-library', JSON.stringify(initialLibrary));
        setItems(initialLibrary);
      }
    } catch (error) {
      console.error("Failed to load library from localStorage:", error);
      setItems(initialLibrary); // Fallback to initial data on error
    }
  };

  useEffect(() => {
    setIsMounted(true); 
    loadLibrary();

    const handleStorageChange = () => loadLibrary();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      return statusMatch && typeMatch;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [items, statusFilter, typeFilter]);

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
              <div className="space-y-4 p-2">
                <div>
                  <h4 className="font-medium text-sm mb-2">Statut</h4>
                  <RadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as MediaStatus | 'all')}>
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
                <div>
                  <h4 className="font-medium text-sm mb-2">Type</h4>
                   <RadioGroup value={typeFilter} onValueChange={(value) => setTypeFilter(value as MediaType | 'all')}>
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
                  </RadioGroup>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">Ma Bibliothèque</h1>
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
                <h2 className="text-2xl font-bold mb-2">Aucun résultat</h2>
                <p className="text-muted-foreground">Ajustez vos filtres ou ajoutez de nouveaux éléments à votre bibliothèque.</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
