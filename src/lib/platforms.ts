
export interface LogoInfo {
  url: string;
  invertOnDark: boolean;
}

export const PLATFORM_LOGOS: Record<string, LogoInfo> = {
  'netflix': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    invertOnDark: false,
  },
  'prime video': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Prime_Video.png',
    invertOnDark: false,
  },
  'disney plus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    invertOnDark: false,
  },
  'max': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    invertOnDark: false,
  },
  'apple tv plus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    invertOnDark: true,
  },
  'paramount plus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg',
    invertOnDark: false,
  },
  'canal+': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Canal%2B.svg',
    invertOnDark: true,
  },
  'molotov': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Logo_Molotov.tv.svg',
    invertOnDark: false,
  },
  'universal+': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Universal%2B_Logo.svg',
    invertOnDark: true,
  },
};
