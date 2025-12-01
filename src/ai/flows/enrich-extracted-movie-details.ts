'use server';

/**
 * @fileOverview Enriches extracted movie details with additional information from online movie databases.
 * Uses multiple sources with fallback strategy for better poster retrieval.
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
  input: {schema: EnrichExtractedMovieDetailsInputSchema},
  output: {schema: EnrichExtractedMovieDetailsOutputSchema},
  prompt: `Vous êtes un assistant IA expert en cinéma et séries. Votre mission est d'enrichir les informations de base fournies pour un film ou une série en utilisant PLUSIEURS sources de données.

  Informations de base:
  Titre: {{{title}}}
  Type: {{{type}}}
  Résumé initial: {{{summary}}}
  
  STRATÉGIE DE RECHERCHE MULTI-SOURCES (tentez dans cet ordre):
  
  ## SOURCE 1 (PRIORITAIRE): The Movie Database (TMDb)
  1. Cherchez sur www.themoviedb.org
  2. Identifiez le "poster_path" (ex: /8Y43POKJJhOi7eU5ieDUAeyD_H9.jpg)
  3. Construisez l'URL: https://image.tmdb.org/t/p/original{poster_path}
     ⚠️ Utilisez "original" pour la meilleure qualité, pas "w500"
     Exemple: https://image.tmdb.org/t/p/original/8Y43POKJJhOi7eU5ieDUAeyD_H9.jpg
  
  ## SOURCE 2 (FALLBACK): IMDb
  Si TMDb échoue:
  1. Cherchez sur www.imdb.com
  2. Trouvez l'image principale de la page du film/série
  3. Utilisez l'URL directe de l'image (format: https://m.media-amazon.com/images/M/...)
  
  ## SOURCE 3 (FALLBACK): OMDb API
  Si IMDb échoue:
  1. Cherchez via www.omdbapi.com
  2. Utilisez le champ "Poster" qui contient une URL directe
  
  ## SOURCE 4 (DERNIER RECOURS): Recherche d'images générale
  Si toutes les sources échouent:
  1. Effectuez une recherche d'images pour "{title} poster official"
  2. Privilégiez les URLs de sites officiels ou de haute qualité
  3. Vérifiez que l'URL se termine par .jpg, .jpeg ou .png
  
  RÈGLES CRITIQUES:
  - L'URL de l'affiche DOIT être une URL d'image directe (pas une page web)
  - L'URL DOIT être accessible publiquement (pas de liens authentifiés)
  - Préférez toujours la plus haute résolution disponible
  - Testez mentalement si l'URL est valide avant de la retourner
  - Si AUCUNE affiche n'est trouvée après toutes les tentatives, retournez une chaîne vide ""
  
  INFORMATIONS COMPLÉMENTAIRES:
  - Synopsis détaillé en français
  - Distribution principale (5-10 acteurs principaux)
  - Genres (liste complète)
  - Note (sur 10, convertissez si nécessaire)
  - Indiquez dans le champ "source" quelle base de données a été utilisée
  
  Retournez toutes les informations au format JSON.`,
});

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
      const isValidImageUrl = /\.(jpg|jpeg|png|webp)$/i.test(output.posterUrl);
      const isValidProtocol = output.posterUrl.startsWith('http://') || output.posterUrl.startsWith('https://');
      
      if (!isValidImageUrl || !isValidProtocol) {
        console.warn(`Invalid poster URL detected: ${output.posterUrl}`);
        output.posterUrl = ''; // Réinitialiser si l'URL n'est pas valide
      }
    }
    
    return output!;
  }
);
