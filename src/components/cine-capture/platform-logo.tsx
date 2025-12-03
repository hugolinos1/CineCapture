
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
  className?: string;
}

// This component is now simplified. It just selects the right icon
// and applies the necessary classes for size and color.
export default function PlatformLogo({ platform, className }: PlatformLogoProps) {
  if (!platform) return null;

  const lowerCasePlatform = platform.toLowerCase();
  
  if (lowerCasePlatform.includes('netflix')) {
    return <NetflixIcon className={className} />;
  }
  if (lowerCasePlatform.includes('prime video') || lowerCasePlatform.includes('amazon')) {
    return <PrimeVideoIcon className={className} />;
  }
  if (lowerCasePlatform.includes('disney plus')) {
    return <DisneyPlusIcon className={className} />;
  }
  // For Apple and Canal+, we apply text-white to make them visible on the dark theme.
  // Their SVG `fill` is set to `currentColor`.
  if (lowerCasePlatform.includes('apple tv plus')) {
    return <AppleTvPlusIcon className={`${className} text-white`} />;
  }
  if (lowerCasePlatform.includes('canal+')) {
    return <CanalPlusIcon className={`${className} text-white`} />;
  }

  // Fallback to displaying the text if no logo is found
  return (
    <div className="text-xs font-semibold text-white flex items-center h-full">
      <span>{platform}</span>
    </div>
  );
}

    