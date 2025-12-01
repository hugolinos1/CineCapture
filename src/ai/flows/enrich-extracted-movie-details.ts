'use server';

/**
 * @fileOverview Enriches extracted movie details with additional information from online movie databases,
 * using a dedicated tool for poster retrieval via the TMDB API.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findMediaOnTmdb } from '../tools/tmdb';

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
  posterUrl: z.string().describe("L'URL de l'affiche du film, qui doit être une URL d'image valide et accessible au public."),
  cast: z.array(z.string()).describe('Liste des principaux acteurs.'),
  rating: z.number().optional().describe('La note du film, si disponible.'),
  genres: z.array(z.string()).optional().describe('La liste des genres du film ou de la série.'),
  source: z.string().optional().describe('La source utilisée pour récupérer les informations.'),
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
  tools: [findMediaOnTmdb],
  input: {schema: EnrichExtractedMovieDetailsInputSchema},
  output: {schema: EnrichExtractedMovieDetailsOutputSchema},
  prompt: `Vous êtes un assistant IA expert en cinéma et séries. Votre mission est d'enrichir les informations fournies pour un film ou une série. Toutes les informations textuelles (synopsis, genres) DOIVENT être en français.

  Informations de base:
  Titre: {{{title}}}
  Type: {{{type}}}
  Résumé initial: {{{summary}}}
  
  Marche à suivre:
  1.  Utilisez l'outil 'findMediaOnTmdb' fourni pour obtenir les informations structurées, y compris l'URL de l'affiche.
  2.  À partir des informations de l'outil et de vos connaissances, générez les informations complémentaires suivantes :
      - Un synopsis détaillé et engageant en français.
      - La distribution principale (5-10 acteurs principaux).
      - La liste complète des genres, en français.
      - La note sur 10.
  3.  Assurez-vous que le titre et le type correspondent à l'entrée.
  4.  Renseignez le champ 'source' avec la valeur retournée par l'outil.
  
  RÈGLES CRITIQUES:
  - L'URL de l'affiche ('posterUrl') DOIT provenir exclusivement du résultat de l'outil 'findMediaOnTmdb'. Ne l'inventez jamais et ne la cherchez pas ailleurs.
  - Si l'outil ne retourne pas d'URL pour l'affiche, retournez une chaîne vide "".

  Retournez toutes les informations au format JSON.`,
});

async function verifyImageUrl(url: string): Promise<boolean> {
    if (!url) return false;
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
        return false;
    }
}

const enrichExtractedMovieDetailsFlow = ai.defineFlow(
  {
    name: 'enrichExtractedMovieDetailsFlow',
    inputSchema: EnrichExtractedMovieDetailsInputSchema,
    outputSchema: EnrichExtractedMovieDetailsOutputSchema,
  },
  async input => {
    const {output} = await enrichExtractedMovieDetailsPrompt(input);
    
    // Validation post-traitement de l'URL de l'affiche
    if (output?.posterUrl) {
      const isUrlValid = await verifyImageUrl(output.posterUrl);
      if (!isUrlValid) {
        console.warn(`Invalid or inaccessible poster URL detected and discarded: ${output.posterUrl}`);
        output.posterUrl = ''; // Réinitialiser si l'URL n'est pas valide
      }
    }
    
    return output!;
  }
);
