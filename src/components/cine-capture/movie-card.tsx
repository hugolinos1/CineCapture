import Image from 'next/image';
import Link from 'next/link';
import type { MediaItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface MovieCardProps {
  item: MediaItem;
}

export default function MovieCard({ item }: MovieCardProps) {
  return (
    <Link href={`/library/${item.id}`} passHref>
      <Card className="overflow-hidden group relative aspect-[2/3] border-0 shadow-lg h-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-primary/20">
        <CardContent className="p-0 h-full">
          <Image
            src={item.posterUrl}
            alt={`Affiche pour ${item.title}`}
            width={500}
            height={750}
            className="object-cover w-full h-full"
            data-ai-hint="movie poster"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-bold text-base text-white drop-shadow-md truncate">{item.title}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
