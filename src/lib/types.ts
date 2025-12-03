
import type { EnrichExtractedMovieDetailsOutput } from "@/ai/flows/enrich-extracted-movie-details";

export type MediaStatus = 'watched' | 'in-progress' | 'unwatched';

export type MediaType = 'movie' | 'series' | 'miniseries';

export interface MediaItem {
  id: string; // Firestore document ID
  userId: string;
  title: string;
  type: MediaType;
  summary: string;
  posterUrl: string;
  cast: string[];
  rating?: number;
  status: MediaStatus;
  userNotes?: string;
  genres: string[];
  addedAt: Date;
  platform?: string;
}

export type EnrichedMovieDetails = EnrichExtractedMovieDetailsOutput;

export interface TrendingMedia {
    id: number;
    title: string;
    posterUrl: string | null;
    rating: number;
}
