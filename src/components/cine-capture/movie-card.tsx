import Image from 'next/image';
import Link from 'next/link';
import type { MediaItem } from '@/lib/types';
import { CheckCircle, PlayCircle, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';

const statusIcons = {
  watched: <CheckCircle className="h-4 w-4 text-green-400" />,
  'in-progress': <PlayCircle className="h-4 w-4 text-blue-400" />,
  unwatched: <Clock className="h-4 w-4 text-gray-400" />,
};

interface MovieCardProps {
  item: MediaItem;
  onDeleteRequest: (item: MediaItem) => void;
}

export default function MovieCard({ item, onDeleteRequest }: MovieCardProps) {
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRequest(item);
  };

  return (
    <Card className="overflow-hidden group relative aspect-[2/3] border-0 shadow-lg h-full">
      <Link href={`/library/${item.id}`} passHref className="absolute inset-0 z-0 cursor-pointer">
        <CardContent className="p-0 h-full">
          <Image
            src={item.posterUrl}
            alt={`Affiche pour ${item.title}`}
            width={500}
            height={750}
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            data-ai-hint="movie poster"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div>
               <h3 className="font-bold text-base text-white drop-shadow-md">{item.title}</h3>
               <p className="text-xs text-gray-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.summary}</p>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 transition-opacity duration-300">
        <Badge className="bg-black/50 backdrop-blur-sm border-none text-white group-hover:opacity-0 transition-opacity duration-300">
          {statusIcons[item.status]}
        </Badge>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      </div>
    </Card>
  );
}
