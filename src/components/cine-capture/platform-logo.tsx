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
  const [isDark, setIsDark] = useState(false);

  // This effect runs only on the client, after the component has mounted.
  // This avoids hydration mismatch errors by not checking the theme on the server.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  if (!platform) return null;

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
  
  // Logos that are just black text (like Canal+ and Apple TV+) need to be filled with white in dark mode.
  // Other logos (like Netflix) have their own colors and should not be changed.
  const needsColorInversion = ['canal+', 'apple tv plus'].includes(assetKey);

  return (
    <div className={className} title={name}>
      <LogoComponent 
        className="h-full w-auto"
        // In dark mode, if the logo needs inversion, set its fill color to white.
        // Otherwise, let the SVG's internal colors take over.
        style={isDark && needsColorInversion ? { color: 'white' } : {}}
      />
    </div>
  );
}
