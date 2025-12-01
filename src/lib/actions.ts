
'use server';

import { extractMovieDetailsFromScreenshot } from '@/ai/flows/extract-movie-details-from-screenshot';
import { enrichExtractedMovieDetails } from '@/ai/flows/enrich-extracted-movie-details';
import type { EnrichedMovieDetails } from '@/lib/types';

export async function processScreenshot(
  prevState: any,
  formData: FormData,
): Promise<{ data: EnrichedMovieDetails | null; error: string | null; success: boolean }> {
  const dataUri = formData.get('screenshot') as string;

  try {
    if (!dataUri) {
      throw new Error('No image data provided.');
    }

    const extractedDetails = await extractMovieDetailsFromScreenshot({
      photoDataUri: dataUri,
    });

    if (!extractedDetails || !extractedDetails.title) {
        throw new Error('Could not extract a title from the screenshot.');
    }

    const enrichedDetails = await enrichExtractedMovieDetails(extractedDetails);

    return { data: enrichedDetails, error: null, success: true };
  } catch (error) {
    console.error('Error processing screenshot:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { data: null, error: `Analysis failed: ${errorMessage}`, success: false };
  }
}
