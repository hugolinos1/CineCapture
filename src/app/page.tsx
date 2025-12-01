import AppLayout from '@/components/layout/app-layout';
import UploadDialog from '@/components/cine-capture/upload-dialog';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <AppLayout>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40">
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
                  Fatigué du désordre des captures d'écran ? CineCapture analyse vos captures, extrait les détails des films et construit automatiquement votre liste personnelle.
                </p>
              </div>
              <Card className="w-full max-w-md border-2 border-dashed border-primary/50 bg-transparent shadow-lg hover:border-primary transition-colors duration-300">
                <CardContent className="p-6">
                   <UploadDialog />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
