'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';


interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

const platformAssets: Record<string, { logo: string; name: string; invertInDark?: boolean }> = {
  'Netflix': { logo: '/platforms/netflix.svg', name: 'Netflix' },
  'Amazon Prime Video': { logo: '/platforms/prime-video.svg', name: 'Prime Video' },
  'Disney Plus': { logo: '/platforms/disney-plus.svg', name: 'Disney+' },
  'Apple TV Plus': { logo: '/platforms/apple-tv-plus.svg', name: 'Apple TV+' },
  'Canal+': { logo: '/platforms/canal-plus.svg', name: 'Canal+', invertInDark: true },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // This avoids hydration mismatch errors.
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);


  if (!platform) return null;

  const assetKey = Object.keys(platformAssets).find(key => platform.toLowerCase().includes(key.toLowerCase()));
  
  if (!assetKey) {
    return (
      <div className={className}>
        <span className="text-xs font-semibold">{platform}</span>
      </div>
    );
  }

  const { logo, name, invertInDark } = platformAssets[assetKey];
  
  const shouldInvert = isDark && invertInDark;

  return (
    <div className={className} title={name}>
      <Image 
        src={logo} 
        alt={`${name} logo`} 
        width={100}
        height={32}
        className={cn(
            "h-full w-auto",
            shouldInvert && 'invert'
        )} 
      />
    </div>
  );
}