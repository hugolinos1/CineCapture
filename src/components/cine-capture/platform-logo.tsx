'use client';

import { cn } from '@/lib/utils';
import { AppleTVPlusLogo, CanalPlusLogo, DisneyPlusLogo, NetflixLogo, PrimeVideoLogo } from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
}

const platformAssets: Record<string, { component: React.ElementType, name: string, needsInvert: boolean }> = {
  'netflix': { component: NetflixLogo, name: 'Netflix', needsInvert: false },
  'amazon prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInvert: false },
  'prime video': { component: PrimeVideoLogo, name: 'Prime Video', needsInvert: false },
  'disney plus': { component: DisneyPlusLogo, name: 'Disney+', needsInvert: false },
  'apple tv plus': { component: AppleTVPlusLogo, name: 'Apple TV+', needsInvert: true },
  'canal+': { component: CanalPlusLogo, name: 'Canal+', needsInvert: true },
};

export default function PlatformLogo({ platform }: PlatformLogoProps) {
  if (!platform) return null;

  const assetKey = Object.keys(platformAssets).find(key => platform.toLowerCase().includes(key));
  
  if (!assetKey) {
    return (
      <div className="text-xs font-semibold text-white">
        <span>{platform}</span>
      </div>
    );
  }

  const { component: LogoComponent, name, needsInvert } = platformAssets[assetKey];
  
  return (
    <div className="flex items-center justify-center h-full" title={name}>
      <LogoComponent className={cn("h-4 w-auto", needsInvert && "fill-white")} />
    </div>
  );
}
