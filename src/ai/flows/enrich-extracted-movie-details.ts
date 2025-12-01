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
  title: z.string().describe('Le titre du film ou de la série.'),
  type: z.string().describe('Le type de contenu (film ou série).'),
  summary: z.string().describe('Un synopsis détaillé du contenu.'),
  posterUrl: z.string().describe("L'URL de l'affiche du film, qui doit être une URL d'image valide et accessible au public. Recherchez une image de haute qualité."),
  cast: z.array(z.string()).describe('Liste des principaux acteurs.'),
  rating: z.number().optional().describe('La note du film, si disponible.'),
  genres: z.array(z.string()).optional().describe('La liste des genres du film ou de la série.'),
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
  prompt: `Vous êtes un assistant IA spécialisé dans l'enrichissement des détails de films et de séries.
  Toutes les réponses textuelles que vous fournissez doivent être en français.
  À partir des informations extraites suivantes, récupérez des détails supplémentaires tels qu'un synopsis détaillé,
  l'URL de l'affiche du film, les principaux acteurs et les genres. Si disponible, incluez également la note.

  Titre: {{{title}}}
  Type: {{{type}}}
  Résumé: {{{summary}}}

  Fournissez la sortie au format JSON. L'URL de l'affiche doit être une URL d'image valide et accessible au public.
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
