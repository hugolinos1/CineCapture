
'use client';

import Image from 'next/image';
import { PLATFORM_LOGOS } from '@/lib/platforms';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (!platform) return null;

  const lowerCasePlatform = platform.toLowerCase();
  let logoInfo = null;

  for (const key in PLATFORM_LOGOS) {
    if (lowerCasePlatform.includes(key)) {
      logoInfo = PLATFORM_LOGOS[key];
      break;
    }
  }

  if (!logoInfo) {
    return (
      <div className="flex items-center h-full">
        <span className="text-sm font-semibold text-white">{platform}</span>
      </div>
    );
  }

  const imageStyle: React.CSSProperties = {};
  if (logoInfo.invertOnDark) {
    imageStyle.filter = 'invert(1)';
  }
  
  return (
    <div className={cn("relative h-full w-auto", className)}>
      <Image
        src={logoInfo.url}
        alt={`${platform} logo`}
        fill
        sizes="100px"
        className="object-contain object-left"
        style={imageStyle}
        unoptimized
      />
    </div>
  );
}
