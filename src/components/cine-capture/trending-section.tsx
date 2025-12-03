
import { getTrendingMedia } from '@/lib/actions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import TrendingAdderDialog from './trending-adder-dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ServerCrash } from 'lucide-react';

interface TrendingSectionProps {
  title: string;
  mediaType: 'movie' | 'tv';
}

export default async function TrendingSection({ title, mediaType }: TrendingSectionProps) {
  const items = await getTrendingMedia(mediaType);

  if (!items || items.length === 0) {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 font-headline">{title}</h2>
            <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Erreur de chargement</AlertTitle>
                <AlertDescription>
                    Impossible de récupérer les tendances pour le moment. Veuillez réessayer plus tard.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-headline">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <TrendingAdderDialog item={item} mediaType={mediaType === 'tv' ? 'series' : 'movie'} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </div>
  );
}
