
'use client';

import {
  NetflixIcon,
  PrimeVideoIcon,
  DisneyPlusIcon,
  AppleTvPlusIcon,
  CanalPlusIcon,
} from './platform-icons';

interface PlatformLogoProps {
  platform?: string;
}

export default function PlatformLogo({ platform }: PlatformLogoProps) {
  if (!platform) return null;

  const lowerCasePlatform = platform.toLowerCase();
  
  if (lowerCasePlatform.includes('netflix')) {
    return <NetflixIcon className="h-8 w-auto" />;
  }
  if (lowerCasePlatform.includes('prime video') || lowerCasePlatform.includes('amazon')) {
    return <PrimeVideoIcon className="h-8 w-auto" />;
  }
  if (lowerCasePlatform.includes('disney plus')) {
    return <DisneyPlusIcon className="h-8 w-auto" />;
  }
  if (lowerCasePlatform.includes('apple tv plus')) {
    return <AppleTvPlusIcon className="h-8 w-auto text-white" />;
  }
  if (lowerCasePlatform.includes('canal+')) {
    return <CanalPlusIcon className="h-8 w-auto text-white" />;
  }

  // Fallback to displaying the text if no logo is found
  return (
    <div className="text-sm font-semibold text-white">
      <span>{platform}</span>
    </div>
  );
}
