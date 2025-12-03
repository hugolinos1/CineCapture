
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
    // Fallback to displaying the text if no logo is found
    return (
      <div className="text-sm font-semibold text-white">
        <span>{platform}</span>
      </div>
    );
  }

  const imageStyle: React.CSSProperties = {};
  if (logoInfo.invertOnDark) {
    imageStyle.filter = 'invert(1)';
  }
  
  // For PNG, we need to provide width and height. For SVG, we can often rely on viewBox.
  // But to be safe, we provide dimensions for all.
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Image
        src={logoInfo.url}
        alt={`${platform} logo`}
        fill
        className="object-contain"
        style={imageStyle}
        unoptimized // Important for SVGs, also avoids issues with some PNGs
      />
    </div>
  );
}
