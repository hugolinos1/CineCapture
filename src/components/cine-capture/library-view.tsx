'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import MovieCard from './movie-card';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
import { Film } from 'lucide-react';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { mockLibrary } from '@/lib/mock-data';

export default function LibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [isMounted, setIsMounted] = useState(false);

  const loadLibrary = () => {
    try {
      const localData = localStorage.getItem('cine-capture-library');
      const localItems: MediaItem[] = localData ? JSON.parse(localData) : [];
      
      // Combine mock data with local data, giving priority to local items
      const itemMap = new Map<string, MediaItem>();
      mockLibrary.forEach(item => itemMap.set(item.id, item));
      localItems.forEach(item => itemMap.set(item.id, item));
      
      setItems(Array.from(itemMap.values()));
    } catch (error) {
      console.error("Failed to load library from localStorage:", error);
      setItems(mockLibrary);
    }
  };

  useEffect(() => {
    setIsMounted(true); // Component has mounted, safe to access localStorage
    loadLibrary();

    // Listen for custom event to reload library when an item is added
    window.addEventListener('storage', loadLibrary);

    return () => {
      window.removeEventListener('storage', loadLibrary);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const typeMatch = typeFilter === 'all' || item.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [items, statusFilter, typeFilter]);

  if (!isMounted) {
    // You can return a loader here if you want
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
