
'use client';

import Image from 'next/image';
import type { TrendingMedia } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TrendingMediaCardProps {
  item: TrendingMedia;
}

export default function TrendingMediaCard({ item }: TrendingMediaCardProps) {
  const posterSrc = item.posterUrl || 'https://picsum.photos/seed/placeholder/500/750';

  return (
    <Card className="overflow-hidden group relative aspect-[2/3] border-0 shadow-lg h-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20">
      <CardContent className="p-0 h-full">
        <Image
          src={posterSrc}
          alt={`Affiche pour ${item.title}`}
          width={500}
          height={750}
          className="object-cover w-full h-full"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {item.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 flex items-center gap-1 text-xs text-white">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
          <h3 className="font-bold text-base text-white drop-shadow-md truncate">{item.title}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
