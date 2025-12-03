'use client';

import Image from 'next/image';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

const platformAssets: Record<string, { src: string; name: string; }> = {
  'netflix': { src: '/logos/netflix.svg', name: 'Netflix' },
  'amazon prime video': { src: '/logos/prime-video.svg', name: 'Prime Video' },
  'prime video': { src: '/logos/prime-video.svg', name: 'Prime Video' },
  'disney plus': { src: '/logos/disney-plus.svg', name: 'Disney+' },
  'apple tv plus': { src: '/logos/apple-tv-plus-white.svg', name: 'Apple TV+' },
  'canal+': { src: '/logos/canal-plus-white.svg', name: 'Canal+' },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (!platform) return null;

  const lowerCasePlatform = platform.toLowerCase();
  const assetKey = Object.keys(platformAssets).find(key => lowerCasePlatform.includes(key));
  
  if (!assetKey) {
    return (
      <div className="text-xs font-semibold text-white flex items-center h-full">
        <span>{platform}</span>
      </div>
    );
  }

  const { src, name } = platformAssets[assetKey];
  
  return (
    <div className={className} title={name}>
      <Image
        src={src}
        alt={`${name} logo`}
        height={28}
        width={100}
        className="h-full w-auto"
      />
    </div>
  );
}
