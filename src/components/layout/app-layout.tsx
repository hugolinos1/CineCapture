import type React from 'react';
import Header from './header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col flex-1 bg-background">
      <Header />
      {children}
    </div>
  );
}
