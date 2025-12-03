'use client';

import { cn } from '@/lib/utils';
import { AppleTVPlusLogo, CanalPlusLogo, DisneyPlusLogo, NetflixLogo, PrimeVideoLogo } from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

const platformAssets: Record<string, { component: React.ElementType, name: string, needsInversion: boolean }> = {
  'netflix': { component: NetflixLogo, name: 'Netflix', needsInversion: false },
  'amazon prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInversion: false },
  'prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInversion: false },
  'disney plus': { component: DisneyPlusLogo, name: 'Disney+', needsInversion: false },
  'apple tv plus': { component: AppleTVPlusLogo, name: 'Apple TV+', needsInversion: true },
  'canal+': { component: CanalPlusLogo, name: 'Canal+', needsInversion: true },
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

  const { component: LogoComponent, name, needsInversion } = platformAssets[assetKey];
  
  return (
    <div className={cn("flex items-center justify-center h-full", className)} title={name}>
      <LogoComponent className={cn("h-full w-auto", needsInversion && "fill-white")} />
    </div>
  );
}
