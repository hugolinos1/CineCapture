import type { EnrichExtractedMovieDetailsOutput } from "@/ai/flows/enrich-extracted-movie-details";

export type MediaStatus = 'watched' | 'in-progress' | 'unwatched';

export type MediaType = 'movie' | 'series';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  summary: string;
  posterUrl: string;
  cast: string[];
  rating?: number;
  status: MediaStatus;
  userNotes?: string;
  genres: string[];
}

export type EnrichedMovieDetails = EnrichExtractedMovieDetailsOutput;
