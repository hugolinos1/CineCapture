'use server';
/**
 * @fileOverview A Genkit tool for interacting with The Movie Database (TMDB) API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const TmdbSearchInputSchema = z.object({
  title: z.string().describe('The title of the media to search for.'),
  type: z.enum(['movie', 'series', 'miniseries']).describe('The type of media.'),
});

const TmdbSearchOutputSchema = z.object({
  title: z.string().optional(),
  posterUrl: z.string().optional(),
  source: z.string().optional(),
  rating: z.number().optional(),
});

export const findMediaOnTmdb = ai.defineTool(
  {
    name: 'findMediaOnTmdb',
    description: 'Finds a movie or TV series on The Movie Database (TMDB) and returns its details, including a poster URL and rating.',
    inputSchema: TmdbSearchInputSchema,
    outputSchema: TmdbSearchOutputSchema,
  },
  async (input) => {
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not set. Skipping tool execution.');
      return { source: 'TMDB API (Not configured)' };
    }

    const typeToQuery = input.type === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/search/${typeToQuery}?query=${encodeURIComponent(input.title)}&language=fr-FR&page=1&api_key=${TMDB_API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`TMDB API request failed with status: ${response.status}`);
        return { source: `TMDB API (Request Failed ${response.status})` };
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const bestMatch = data.results[0];
        const posterPath = bestMatch.poster_path;
        
        return {
          title: bestMatch.title || bestMatch.name,
          posterUrl: posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : '',
          rating: bestMatch.vote_average,
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
