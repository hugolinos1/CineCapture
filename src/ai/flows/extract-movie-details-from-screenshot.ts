'use server';
/**
 * @fileOverview Extracts movie details from a screenshot using OCR and AI.
 *
 * - extractMovieDetailsFromScreenshot - A function that handles the extraction process.
 * - ExtractMovieDetailsInput - The input type for the extractMovieDetailsFromScreenshot function.
 * - ExtractMovieDetailsOutput - The return type for the extractMovieDetailsFromScreenshot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMovieDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A screenshot of a movie or TV show, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractMovieDetailsInput = z.infer<typeof ExtractMovieDetailsInputSchema>;

const ExtractMovieDetailsOutputSchema = z.object({
  title: z.string().describe('The title of the movie or TV show.'),
  type: z.enum(['movie', 'series', 'miniseries']).describe('The type of content.'),
  summary: z.string().describe('A brief summary of the movie or TV show.'),
});
export type ExtractMovieDetailsOutput = z.infer<typeof ExtractMovieDetailsOutputSchema>;

export async function extractMovieDetailsFromScreenshot(
  input: ExtractMovieDetailsInput
): Promise<ExtractMovieDetailsOutput> {
  return extractMovieDetailsFromScreenshotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMovieDetailsPrompt',
  input: {schema: ExtractMovieDetailsInputSchema},
  output: {schema: ExtractMovieDetailsOutputSchema},
  prompt: `You are an AI assistant designed to extract movie details from screenshots.\n\n  Analyze the screenshot and extract the following information:\n  - Title: The title of the movie or TV show.\n  - Type: The type of content (movie, series, or miniseries). Distinguish clearly between a multi-season series and a single-season miniseries.\n  - Summary: A brief summary of the movie or TV show.\n\n  Here is the screenshot: {{media url=photoDataUri}}\n\n  Return the extracted information in JSON format.`,
});

const extractMovieDetailsFromScreenshotFlow = ai.defineFlow(
  {
    name: 'extractMovieDetailsFromScreenshotFlow',
    inputSchema: ExtractMovieDetailsInputSchema,
    outputSchema: ExtractMovieDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
