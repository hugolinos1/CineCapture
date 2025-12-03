'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AppleTVPlusLogo, CanalPlusLogo, DisneyPlusLogo, NetflixLogo, PrimeVideoLogo } from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

// Map platform names (lowercase) to their corresponding SVG component and display name.
const platformAssets: Record<string, { component: React.ElementType, name: string, needsInversion: boolean }> = {
  'netflix': { component: NetflixLogo, name: 'Netflix', needsInversion: false },
  'amazon prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInversion: false },
  'prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInversion: false },
  'disney plus': { component: DisneyPlusLogo, name: 'Disney+', needsInversion: false },
  'apple tv plus': { component: AppleTVPlusLogo, name: 'Apple TV+', needsInversion: true },
  'canal+': { component: CanalPlusLogo, name: 'Canal+', needsInversion: true },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client, after the component has mounted.
  // This helps avoid hydration mismatch errors with server-rendered content.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server or before the client has mounted.
  if (!platform || !isClient) return null;

  // Find the correct platform asset, ignoring case.
  const assetKey = Object.keys(platformAssets).find(key => platform.toLowerCase().includes(key));
  
  if (!assetKey) {
    // If the platform is not in our asset list, just display the name.
    return (
      <div className={cn("text-xs font-semibold text-white", className)}>
        <span>{platform}</span>
      </div>
    );
  }

  const { component: LogoComponent, name, needsInversion } = platformAssets[assetKey];
  
  // The app is dark mode only, so we can make a simple decision.
  // If the logo is naturally dark (needsInversion), we fill it with white.
  // Otherwise, we let the SVG's native colors render.
  const props = needsInversion ? { fill: 'white' } : {};

  return (
    <div className={className} title={name}>
      <LogoComponent {...props} className="h-full w-auto" />
    </div>
  );
}
