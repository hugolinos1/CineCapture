'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AppleTVPlusLogo, CanalPlusLogo, DisneyPlusLogo, NetflixLogo, PrimeVideoLogo } from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

// Map platform names (lowercase) to their corresponding SVG component and display name.
const platformAssets: Record<string, { component: React.ElementType, name: string }> = {
  'netflix': { component: NetflixLogo, name: 'Netflix' },
  'amazon prime video': { component: PrimeVideoLogo, name: 'Prime Video' },
  'prime video': { component: PrimeVideoLogo, name: 'Prime Video' },
  'disney plus': { component: DisneyPlusLogo, name: 'Disney+' },
  'apple tv plus': { component: AppleTVPlusLogo, name: 'Apple TV+' },
  'canal+': { component: CanalPlusLogo, name: 'Canal+' },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client, after the component has mounted.
  // This helps avoid hydration mismatch errors.
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!platform || !isClient) return null;

  // Find the correct platform asset, ignoring case.
  const assetKey = Object.keys(platformAssets).find(key => platform.toLowerCase().includes(key));
  
  if (!assetKey) {
    // If the platform is not in our asset list, just display the name.
    return (
      <div className={cn("text-xs font-semibold", className)}>
        <span>{platform}</span>
      </div>
    );
  }

  const { component: LogoComponent, name } = platformAssets[assetKey];
  
  // Logos that use `currentColor` for their fill will adapt to the text color.
  // In dark mode, text is white, so the logo will be white.
  const needsColorInversion = ['canal+', 'apple tv plus'].includes(assetKey);
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className={className} title={name}>
      <LogoComponent 
        className={cn(
            "h-full w-auto",
            isDark && needsColorInversion ? "text-white" : "text-black"
        )}
      />
    </div>
  );
}
