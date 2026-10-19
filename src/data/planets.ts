export interface PlanetInfo {
  id: string;
  tamilName: string;
  englishName: string;
  defaultAbbr: string;
}

export const PLANETS_MASTER: PlanetInfo[] = [
  { id: 'sun', tamilName: 'சூரியன்', englishName: 'Sun', defaultAbbr: 'சூ' },
  { id: 'moon', tamilName: 'சந்திரன்', englishName: 'Moon', defaultAbbr: 'சந்' },
  { id: 'mars', tamilName: 'செவ்வாய்', englishName: 'Mars', defaultAbbr: 'செ' },
  { id: 'mercury', tamilName: 'புதன்', englishName: 'Mercury', defaultAbbr: 'பு' },
  { id: 'jupiter', tamilName: 'குரு', englishName: 'Jupiter', defaultAbbr: 'கு' },
  { id: 'venus', tamilName: 'சுக்கிரன்', englishName: 'Venus', defaultAbbr: 'சுக்' },
  { id: 'saturn', tamilName: 'சனி', englishName: 'Saturn', defaultAbbr: 'ச' },
  { id: 'rahu', tamilName: 'ராகு', englishName: 'Rahu', defaultAbbr: 'ரா' },
  { id: 'ketu', tamilName: 'கேது', englishName: 'Ketu', defaultAbbr: 'கே' },
  { id: 'lagna', tamilName: 'லக்னம்', englishName: 'Lagna', defaultAbbr: 'லக்' },
];

export type PlanetAbbrMap = Record<string, string>;

export const DEFAULT_PLANET_ABBRS: PlanetAbbrMap = {
  சூரியன்: 'சூ',
  சந்திரன்: 'சந்',
  செவ்வாய்: 'செ',
  புதன்: 'பு',
  குரு: 'கு',
  சுக்கிரன்: 'சுக்',
  சனி: 'ச',
  ராகு: 'ரா',
  கேது: 'கே',
  லக்னம்: 'லக்',
};
