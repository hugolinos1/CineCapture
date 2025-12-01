import { config } from 'dotenv';
config();

import '@/ai/flows/enrich-extracted-movie-details.ts';
import '@/ai/flows/extract-movie-details-from-screenshot.ts';
import '@/ai/tools/tmdb.ts';
