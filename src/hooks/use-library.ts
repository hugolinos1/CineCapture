'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MediaItem } from '@/lib/types';

const LIBRARY_KEY = 'cine-capture-library';

export function useLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const localData = localStorage.getItem(LIBRARY_KEY);
      if (localData) {
        setItems(JSON.parse(localData));
      } else {
        localStorage.setItem(LIBRARY_KEY, JSON.stringify([]));
      }
    } catch (error) {
      console.error("Failed to load library from localStorage:", error);
      setItems([]);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LIBRARY_KEY && event.newValue) {
        try {
          setItems(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Failed to parse library from storage event:", error);
        }
      }
    };
    
    // Using storage event is better for multi-tab sync
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateLibrary = (newItems: MediaItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newItems));
      // Manually dispatch a storage event for the current tab to react
      window.dispatchEvent(new StorageEvent('storage', {
        key: LIBRARY_KEY,
        newValue: JSON.stringify(newItems)
      }));
    } catch (error) {
      console.error("Failed to save library to localStorage:", error);
    }
  };

  const addItem = (item: MediaItem) => {
    const newItems = [...items, item];
    updateLibrary(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    updateLibrary(newItems);
  };
  
  const findItem = useCallback((id: string): MediaItem | null => {
      const found = items.find(item => item.id === id);
      return found || null;
  }, [items]);

  const isDuplicate = (title: string): boolean => {
    return items.some(
      item => item.title.trim().toLowerCase() === title.trim().toLowerCase()
    );
  };

  return { items, addItem, deleteItem, findItem, isDuplicate, isMounted };
}
