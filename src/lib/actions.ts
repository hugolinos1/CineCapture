
'use server';

import { extractMovieDetailsFromScreenshot } from '@/ai/flows/extract-movie-details-from-screenshot';
import { enrichExtractedMovieDetails } from '@/ai/flows/enrich-extracted-movie-details';
import type { EnrichedMovieDetails } from '@/lib/types';
import { initializeFirebase } from '@/firebase/server-actions';
import { doc, updateDoc } from 'firebase/firestore';


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
  const type = formData.get('type') as 'movie' | 'series' | null;

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
    docPath: string;
    title: string;
    type: 'movie' | 'series' | 'miniseries';
}

export async function refreshMediaItem(
  input: RefreshMediaItemInput,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const enrichedDetails = await enrichExtractedMovieDetails({
      title: input.title,
      type: input.type,
    });

    if (!enrichedDetails) {
      throw new Error('Aucune information trouvée lors du rafraîchissement.');
    }

    const { firestore } = initializeFirebase();
    const docRef = doc(firestore, input.docPath);
    
    // We only update the fields that are meant to be enriched.
    // We don't want to overwrite user-set data like `status`.
    await updateDoc(docRef, {
        summary: enrichedDetails.summary,
        posterUrl: enrichedDetails.posterUrl,
        cast: enrichedDetails.cast,
        rating: enrichedDetails.rating,
        genres: enrichedDetails.genres,
        platform: enrichedDetails.platform,
        source: enrichedDetails.source,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur lors du rafraîchissement de la fiche:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return { success: false, error: errorMessage };
  }
}
