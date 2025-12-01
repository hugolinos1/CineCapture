
'use server';

import { extractMovieDetailsFromScreenshot } from '@/ai/flows/extract-movie-details-from-screenshot';
import { enrichExtractedMovieDetails } from '@/ai/flows/enrich-extracted-movie-details';
import type { EnrichedMovieDetails } from '@/lib/types';

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
