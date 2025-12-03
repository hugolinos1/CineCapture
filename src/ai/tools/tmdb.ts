'use server';
/**
 * @fileOverview A Genkit tool for interacting with The Movie Database (TMDB) API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/';

const TmdbSearchInputSchema = z.object({
  title: z.string().describe('The title of the media to search for.'),
  type: z.enum(['movie', 'series', 'miniseries']).describe('The type of media.'),
});

const TmdbSearchOutputSchema = z.object({
  title: z.string().optional(),
  posterUrl: z.string().optional(),
  source: z.string().optional(),
  rating: z.number().optional(),
  platform: z.string().optional().describe('The primary streaming platform in France (e.g., Netflix, Prime Video).'),
});

async function getWatchProvider(mediaId: number, type: 'movie' | 'tv', originalTitle: string): Promise<string | undefined> {
    if (!TMDB_API_KEY) return undefined;

    // Direct keyword check for major originals
    const lowerCaseTitle = originalTitle.toLowerCase();
    if (lowerCaseTitle.includes('netflix')) return 'Netflix';

    const url = `https://api.themoviedb.org/3/${type}/${mediaId}/watch/providers?api_key=${TMDB_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return undefined;
        
        const data = await response.json();
        const providersFR = data.results?.FR;
        if (!providersFR) return undefined;

        // Combine all provider types for a wider search
        const allProviders = [
            ...(providersFR.flatrate || []),
            ...(providersFR.free || []),
            ...(providersFR.ads || []),
            ...(providersFR.rent || []),
        ];

        // Prioritize major platforms
        if (allProviders.length > 0) {
            const priority = ['Netflix', 'Amazon Prime Video', 'Disney Plus', 'Apple TV Plus', 'Canal+'];
            for (const pName of priority) {
                if (allProviders.some((p: any) => p.provider_name.includes(pName))) {
                    return pName;
                }
            }
            // Return the first available if no priority match
            return allProviders[0].provider_name;
        }
        return undefined;

    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return undefined;
    }
}

export const findMediaOnTmdb = ai.defineTool(
  {
    name: 'findMediaOnTmdb',
    description: 'Finds a movie or TV series on The Movie Database (TMDB) and returns its details, including poster URL, rating, and primary streaming platform in France.',
    inputSchema: TmdbSearchInputSchema,
    outputSchema: TmdbSearchOutputSchema,
  },
  async (input) => {
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not set. Skipping tool execution.');
      return { source: 'TMDB API (Not configured)' };
    }

    const typeToQuery = input.type === 'movie' ? 'movie' : 'tv';
    const searchUrl = `https://api.themoviedb.org/3/search/${typeToQuery}?query=${encodeURIComponent(input.title)}&language=fr-FR&page=1&api_key=${TMDB_API_KEY}`;

    try {
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        console.error(`TMDB API search request failed with status: ${searchResponse.status}`);
        return { source: `TMDB API (Request Failed ${searchResponse.status})` };
      }

      const searchData = await searchResponse.json();

      if (searchData.results && searchData.results.length > 0) {
        const bestMatch = searchData.results[0];
        const posterPath = bestMatch.poster_path;
        
        const platform = await getWatchProvider(bestMatch.id, typeToQuery, bestMatch.name || bestMatch.title || '');

        return {
          title: bestMatch.title || bestMatch.name,
          posterUrl: posterPath ? `${BASE_IMAGE_URL}w780${posterPath}` : '',
          rating: bestMatch.vote_average,
          platform: platform,
          source: 'TMDB API',
        };
      } else {
        return { source: 'TMDB API (No results)' };
      }
    } catch (error) {
      console.error('An error occurred while calling the TMDB API:', error);
      return { source: 'TMDB API (Error)' };
    }
  }
);
    