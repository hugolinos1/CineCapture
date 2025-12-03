'use client';
import Image from 'next/image';

interface PlatformLogoProps {
  platform?: string;
  className?: string;
}

const platformAssets: Record<string, { logo: string; name: string }> = {
  'Netflix': { logo: '/platforms/netflix.svg', name: 'Netflix' },
  'Amazon Prime Video': { logo: '/platforms/prime-video.svg', name: 'Prime Video' },
  'Disney Plus': { logo: '/platforms/disney-plus.svg', name: 'Disney+' },
  'Apple TV Plus': { logo: '/platforms/apple-tv-plus.svg', name: 'Apple TV+' },
  'Canal+': { logo: '/platforms/canal-plus.svg', name: 'Canal+' },
};

export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (!platform) return null;

  const asset = Object.keys(platformAssets).find(key => platform.includes(key));
  if (!asset) {
    return (
      <div className={className}>
        <span className="text-xs font-semibold">{platform}</span>
      </div>
    );
  }

  const { logo, name } = platformAssets[asset];

  return (
    <div className={className} title={name}>
      <Image src={logo} alt={`${name} logo`} width={24} height={24} className="h-full w-auto" />
    </div>
  );
}

    