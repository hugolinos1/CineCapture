import UploadDialog from '@/components/cine-capture/upload-dialog';
import { Card, CardContent } from '@/components/ui/card';
import SearchForm from '@/components/cine-capture/search-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Search } from 'lucide-react';
import TrendingSection from '@/components/cine-capture/trending-section';

export default function Home() {
  return (
      <main className="flex-1">
        <section className="w-full pt-20 md:pt-32 lg:pt-40 pb-10 md:pb-16 lg:pb-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-4xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Propulsé par l'IA
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                  Ne perdez plus jamais une recommandation de film.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  CineCapture analyse vos captures d'écran ou vos recherches textuelles, extrait les détails et construit automatiquement votre liste personnelle.
                </p>
              </div>
              <Card className="w-full max-w-md bg-transparent shadow-lg">
                <CardContent className="p-0">
                  <Tabs defaultValue="screenshot" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="screenshot"><UploadCloud className='mr-2'/> Capture d'écran</TabsTrigger>
                      <TabsTrigger value="text"><Search className='mr-2'/> Recherche</TabsTrigger>
                    </TabsList>
                    <TabsContent value="screenshot">
                       <Card className="border-0 border-t rounded-t-none bg-card">
                         <CardContent className="p-6">
                           <UploadDialog />
                         </CardContent>
                       </Card>
                    </TabsContent>
                    <TabsContent value="text">
                       <Card className="border-0 border-t rounded-t-none bg-card">
                         <CardContent className="p-6">
                            <SearchForm />
                         </CardContent>
                       </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full pb-12 md:pb-24 lg:pb-32">
            <div className="container px-4 md:px-6 space-y-12">
                <TrendingSection mediaType="movie" title="Les meilleurs nouveaux films" />
                <TrendingSection mediaType="tv" title="Les meilleures nouvelles séries" />
            </div>
        </section>
      </main>
  );
}
