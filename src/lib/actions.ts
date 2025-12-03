
'use server';

import { extractMovieDetailsFromScreenshot } from '@/ai/flows/extract-movie-details-from-screenshot';
import { enrichExtractedMovieDetails } from '@/ai/flows/enrich-extracted-movie-details';
import type { EnrichedMovieDetails, TrendingMedia } from '@/lib/types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_API_URL = 'https://api.themoviedb.org/3';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/';

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function processScreenshot(
  prevState: any,
  formData: FormData,
): Promise<{ data: EnrichedMovieDetails | null; error: string | null; success: boolean }> {
  const file = formData.get('screenshotFile') as File | null;

  if (!file) {
    return { data: null, error: 'Aucun fichier image fourni.', success: false };
  }

  try {
    const dataUri = await fileToDataUri(file);

    const extractedDetails = await extractMovieDetailsFromScreenshot({
      photoDataUri: dataUri,
    });

    if (!extractedDetails || !extractedDetails.title) {
        throw new Error("Impossible d'extraire les détails de la capture d'écran.");
    }

    const enrichedDetails = await enrichExtractedMovieDetails(extractedDetails);

    return { data: enrichedDetails, error: null, success: true };
  } catch (error) {
    console.error('Erreur lors du traitement de la capture d\'écran:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return { data: null, error: `L'analyse a échoué: ${errorMessage}`, success: false };
  }
}


export async function processTextSearch(
  prevState: any,
  formData: FormData,
): Promise<{ data: EnrichedMovieDetails | null; error: string | null; success: boolean }> {
  const title = formData.get('title') as string | null;
  const type = formData.get('type') as 'movie' | 'series' | 'miniseries' | null;

  if (!title || !type) {
    return { data: null, error: 'Le titre et le type sont requis.', success: false };
  }

  try {
    const enrichedDetails = await enrichExtractedMovieDetails({
      title,
      type,
    });

    if (!enrichedDetails || !enrichedDetails.title) {
        throw new Error("Impossible de trouver les détails pour ce titre.");
    }

    return { data: enrichedDetails, error: null, success: true };
  } catch (error) {
    console.error('Erreur lors de la recherche textuelle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return { data: null, error: `La recherche a échoué: ${errorMessage}`, success: false };
  }
}

interface RefreshMediaItemInput {
    title: string;
    type: 'movie' | 'series' | 'miniseries';
}

export async function fetchRefreshedMediaItem(
  input: RefreshMediaItemInput,
): Promise<{ data: EnrichedMovieDetails | null; success: boolean; error: string | null }> {
  try {
    const enrichedDetails = await enrichExtractedMovieDetails({
      title: input.title,
      type: input.type,
    });

    if (!enrichedDetails) {
      throw new Error('Aucune information trouvée lors du rafraîchissement.');
    }
    
    return { data: enrichedDetails, success: true, error: null };
  } catch (error) {
    console.error('Erreur lors du rafraîchissement de la fiche:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return { data: null, success: false, error: errorMessage };
  }
}


export async function getTrendingMedia(mediaType: 'movie' | 'tv'): Promise<TrendingMedia[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set.');
    return [];
  }

  const url = `${BASE_API_URL}/trending/${mediaType}/week?api_key=${TMDB_API_KEY}&language=fr-FR`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 * 24 } }); // Cache for 24 hours
    if (!response.ok) {
      console.error(`TMDB API request failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json();

    return data.results.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      posterUrl: item.poster_path ? `${BASE_IMAGE_URL}w500${item.poster_path}` : null,
      rating: item.vote_average,
    }));
  } catch (error) {
    console.error('Failed to fetch trending media:', error);
    return [];
  }
}

// Re-export for client components
export { enrichExtractedMovieDetails };
