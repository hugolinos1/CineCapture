'use client';

import { cn } from '@/lib/utils';
import { AppleTVPlusLogo, CanalPlusLogo, DisneyPlusLogo, NetflixLogo, PrimeVideoLogo } from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

const platformAssets: Record<string, { component: React.ElementType, name: string }> = {
  'netflix': { component: NetflixLogo, name: 'Netflix' },
  'amazon prime video': { component: PrimeVideoLogo, name: 'Prime Video' },
  'prime video': { component: PrimeVideoLogo, name: 'Prime Video' },
  'disney plus': { component: DisneyPlusLogo, name: 'Disney+' },
  'apple tv plus': { component: AppleTVPlusLogo, name: 'Apple TV+' },
  'canal+': { component: CanalPlusLogo, name: 'Canal+' },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (!platform) return null;

  const assetKey = Object.keys(platformAssets).find(key => platform.toLowerCase().includes(key));
  
  if (!assetKey) {
    return (
      <div className={cn("text-xs font-semibold text-white", className)}>
        <span>{platform}</span>
      </div>
    );
  }

  const { component: LogoComponent, name } = platformAssets[assetKey];
  
  return (
    <div className={cn("flex items-center justify-center h-full", className)} title={name}>
      <LogoComponent className="h-full w-auto" />
    </div>
  );
}
