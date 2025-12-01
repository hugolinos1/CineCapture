import AppLayout from "@/components/layout/app-layout";
import { mockLibrary } from "@/lib/mock-data";
import LibraryView from "@/components/cine-capture/library-view";

export default function LibraryPage() {
  const libraryItems = mockLibrary;

  return (
    <AppLayout>
      <LibraryView initialItems={libraryItems} />
    </AppLayout>
  );
}
