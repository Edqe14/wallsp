export type Source = {
  repo: string;
  paths?: string[];
  indexDirectory?: boolean;
};

export const sources: Source[] = [
  {
    repo: 'kitsunebishi/Wallpapers',
    paths: ['images'],
  },
  {
    repo: 'Edqe14/wallpapers',
    indexDirectory: true,
  },
  {
    repo: 'dharmx/walls',
    indexDirectory: true,
  },
];
