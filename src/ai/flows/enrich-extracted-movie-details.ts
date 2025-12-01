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
  prompt: `Vous êtes un assistant IA expert en cinéma et séries. Votre mission est d'enrichir les informations de base fournies pour un film ou une série en utilisant The Movie Database (TMDb).

  Informations de base:
  Titre: {{{title}}}
  Type: {{{type}}}
  Résumé initial: {{{summary}}}
  
  Suivez IMPÉRATIVEMENT les étapes suivantes:
  1.  **Recherche**: Cherchez le film ou la série sur le site www.themoviedb.org.
  2.  **Extraction du chemin de l'affiche**: Une fois la bonne page trouvée, identifiez le chemin de l'affiche (le "poster_path"). C'est un chemin qui commence par un "/" et se termine par ".jpg", par exemple : /8Y43POKJJhOi7eU5ieDUAeyD_H9.jpg
  3.  **Construction de l'URL**: Prenez ce chemin et construisez l'URL complète de l'affiche en le préfixant avec "https://image.tmdb.org/t/p/w500". 
      Exemple: "https://image.tmdb.org/t/p/w500" + "/8Y43POKJJhOi7eU5ieDUAeyD_H9.jpg" doit donner "https://image.tmdb.org/t/p/w500/8Y43POKJJhOi7eU5ieDUAeyD_H9.jpg".
      L'URL de l'affiche est la plus importante, elle doit obligatoirement être une URL d'image directe et valide.
  4.  **Autres informations**: Sur la même page, trouvez le synopsis détaillé, la distribution principale (cast), les genres et la note (rating sur 10).
  5.  **Formatage**: Retournez toutes les informations en français au format JSON.

  C'est l'étape la plus importante. Si vous ne trouvez pas d'affiche, laissez le champ "posterUrl" vide, mais vous devez faire de votre mieux pour la trouver.`,
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
