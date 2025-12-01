'use server';

/**
 * @fileOverview Enriches extracted movie details with additional information from online movie databases.
 *
 * - enrichExtractedMovieDetails - A function that enriches extracted movie details.
 * - EnrichExtractedMovieDetailsInput - The input type for the enrichExtractedMovieDetails function.
 * - EnrichExtractedMovieDetailsOutput - The return type for the enrichExtractedMovieDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnrichExtractedMovieDetailsInputSchema = z.object({
  title: z.string().describe('The title of the movie or series.'),
  type: z.string().describe('The type of content (movie or series).'),
  summary: z.string().optional().describe('A brief summary of the content.'),
});

export type EnrichExtractedMovieDetailsInput = z.infer<
  typeof EnrichExtractedMovieDetailsInputSchema
>;

const EnrichExtractedMovieDetailsOutputSchema = z.object({
  title: z.string().describe('The title of the movie or series.'),
  type: z.string().describe('The type of content (movie or series).'),
  summary: z.string().describe('A detailed synopsis of the content.'),
  posterUrl: z.string().describe('URL of the movie poster.'),
  cast: z.array(z.string()).describe('List of main cast members.'),
  rating: z.number().optional().describe('The movie rating, if available.'),
});

export type EnrichExtractedMovieDetailsOutput = z.infer<
  typeof EnrichExtractedMovieDetailsOutputSchema
>;

export async function enrichExtractedMovieDetails(
  input: EnrichExtractedMovieDetailsInput
): Promise<EnrichExtractedMovieDetailsOutput> {
  return enrichExtractedMovieDetailsFlow(input);
}

const enrichExtractedMovieDetailsPrompt = ai.definePrompt({
  name: 'enrichExtractedMovieDetailsPrompt',
  input: {schema: EnrichExtractedMovieDetailsInputSchema},
  output: {schema: EnrichExtractedMovieDetailsOutputSchema},
  prompt: `You are an AI assistant specialized in enriching movie and series details.
  Given the following extracted information, fetch additional details such as a detailed synopsis,
  the movie poster URL, and the main cast members. If available, also include the rating.

  Title: {{{title}}}
  Type: {{{type}}}
  Summary: {{{summary}}}

  Provide the output in JSON format.
  `,
});

const enrichExtractedMovieDetailsFlow = ai.defineFlow(
  {
    name: 'enrichExtractedMovieDetailsFlow',
    inputSchema: EnrichExtractedMovieDetailsInputSchema,
    outputSchema: EnrichExtractedMovieDetailsOutputSchema,
  },
  async input => {
    const {output} = await enrichExtractedMovieDetailsPrompt(input);
    return output!;
  }
);
