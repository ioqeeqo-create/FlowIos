/** Формат трека с шлюза (совместим с десктопным Flow). */
export type FlowTrack = {
  title: string;
  artist: string;
  url: string | null;
  cover?: string | null;
  source: string;
  id: string;
  bg?: string;
  scTranscoding?: string | null;
  scClientId?: string;
  ytId?: string;
  ytInstance?: string | null;
  duration?: number;
};

export type SearchSource =
  | 'hybrid'
  | 'spotify'
  | 'soundcloud'
  | 'audius'
  | 'yandex'
  | 'vk'
  | 'youtube';
