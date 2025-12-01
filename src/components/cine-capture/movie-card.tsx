import Image from 'next/image';
import type { MediaItem } from '@/lib/types';
import { CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusIcons = {
  watched: <CheckCircle className="h-4 w-4 text-green-400" />,
  'in-progress': <PlayCircle className="h-4 w-4 text-blue-400" />,
  unwatched: <Clock className="h-4 w-4 text-gray-400" />,
};

export default function MovieCard({ item }: { item: MediaItem }) {
  return (
    <Card className="overflow-hidden group relative aspect-[2/3] border-0 shadow-lg">
      <CardContent className="p-0">
        <Image
          src={item.posterUrl}
          alt={`Affiche pour ${item.title}`}
          width={500}
          height={750}
          className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <h3 className="font-bold text-lg text-white drop-shadow-md">{item.title}</h3>
             <p className="text-xs text-gray-300 line-clamp-2">{item.summary}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
          <Badge className="bg-black/50 backdrop-blur-sm border-none text-white">
            {statusIcons[item.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
