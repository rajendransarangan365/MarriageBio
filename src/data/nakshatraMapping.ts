export interface NakshatraDefinition {
  id: string;
  tamilName: string;
  englishName: string;
  paathams: {
    paatham: 1 | 2 | 3 | 4;
    rasiTamil: string;
    rasiEnglish: string;
  }[];
}

export const ALL_RASIS = [
  { id: 'மேஷம்', tamil: 'மேஷம்', english: 'Aries' },
  { id: 'ரிஷபம்', tamil: 'ரிஷபம்', english: 'Taurus' },
  { id: 'மிதுனம்', tamil: 'மிதுனம்', english: 'Gemini' },
  { id: 'கடகம்', tamil: 'கடகம்', english: 'Cancer' },
  { id: 'சிம்மம்', tamil: 'சிம்மம்', english: 'Leo' },
  { id: 'கன்னி', tamil: 'கன்னி', english: 'Virgo' },
  { id: 'துலாம்', tamil: 'துலாம்', english: 'Libra' },
  { id: 'விருச்சிகம்', tamil: 'விருச்சிகம்', english: 'Scorpio' },
  { id: 'தனுசு', tamil: 'தனுசு', english: 'Sagittarius' },
  { id: 'மகரம்', tamil: 'மகரம்', english: 'Capricorn' },
  { id: 'கும்பம்', tamil: 'கும்பம்', english: 'Aquarius' },
  { id: 'மீனம்', tamil: 'மீனம்', english: 'Pisces' },
] as const;

export const NAKSHATRAS: NakshatraDefinition[] = [
  {
    id: 'ashwini',
    tamilName: 'அசுவினி',
    englishName: 'Ashwini',
    paathams: [
      { paatham: 1, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 2, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 3, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 4, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
    ],
  },
  {
    id: 'bharani',
    tamilName: 'பரணி',
    englishName: 'Bharani',
    paathams: [
      { paatham: 1, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 2, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 3, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 4, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
    ],
  },
  {
    id: 'krittika',
    tamilName: 'கார்த்திகை',
    englishName: 'Krittika',
    paathams: [
      { paatham: 1, rasiTamil: 'மேஷம்', rasiEnglish: 'Aries' },
      { paatham: 2, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 3, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 4, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
    ],
  },
  {
    id: 'rohini',
    tamilName: 'ரோகிணி',
    englishName: 'Rohini',
    paathams: [
      { paatham: 1, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 2, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 3, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 4, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
    ],
  },
  {
    id: 'mrigasirsha',
    tamilName: 'மிருகசீரிடம்',
    englishName: 'Mrigashirsha',
    paathams: [
      { paatham: 1, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 2, rasiTamil: 'ரிஷபம்', rasiEnglish: 'Taurus' },
      { paatham: 3, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 4, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
    ],
  },
  {
    id: 'ardra',
    tamilName: 'திருவாதிரை',
    englishName: 'Ardra',
    paathams: [
      { paatham: 1, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 2, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 3, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 4, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
    ],
  },
  {
    id: 'punarvasu',
    tamilName: 'புனர்பூசம்',
    englishName: 'Punarvasu',
    paathams: [
      { paatham: 1, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 2, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 3, rasiTamil: 'மிதுனம்', rasiEnglish: 'Gemini' },
      { paatham: 4, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
    ],
  },
  {
    id: 'pushya',
    tamilName: 'பூசம்',
    englishName: 'Pushya',
    paathams: [
      { paatham: 1, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 2, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 3, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 4, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
    ],
  },
  {
    id: 'ashlesha',
    tamilName: 'ஆயில்யம்',
    englishName: 'Ashlesha',
    paathams: [
      { paatham: 1, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 2, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 3, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
      { paatham: 4, rasiTamil: 'கடகம்', rasiEnglish: 'Cancer' },
    ],
  },
  {
    id: 'magha',
    tamilName: 'மகம்',
    englishName: 'Magha',
    paathams: [
      { paatham: 1, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 2, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 3, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 4, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
    ],
  },
  {
    id: 'purva_phalguni',
    tamilName: 'பூரம்',
    englishName: 'Purva Phalguni',
    paathams: [
      { paatham: 1, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 2, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 3, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 4, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
    ],
  },
  {
    id: 'uttara_phalguni',
    tamilName: 'உத்திரம்',
    englishName: 'Uttara Phalguni',
    paathams: [
      { paatham: 1, rasiTamil: 'சிம்மம்', rasiEnglish: 'Leo' },
      { paatham: 2, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 3, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 4, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
    ],
  },
  {
    id: 'hasta',
    tamilName: 'அஸ்தம்',
    englishName: 'Hasta',
    paathams: [
      { paatham: 1, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 2, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 3, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 4, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
    ],
  },
  {
    id: 'chitra',
    tamilName: 'சித்திரை',
    englishName: 'Chitra',
    paathams: [
      { paatham: 1, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 2, rasiTamil: 'கன்னி', rasiEnglish: 'Virgo' },
      { paatham: 3, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 4, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
    ],
  },
  {
    id: 'swati',
    tamilName: 'சுவாதி',
    englishName: 'Swati',
    paathams: [
      { paatham: 1, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 2, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 3, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 4, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
    ],
  },
  {
    id: 'vishakha',
    tamilName: 'விசாகம்',
    englishName: 'Vishakha',
    paathams: [
      { paatham: 1, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 2, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 3, rasiTamil: 'துலாம்', rasiEnglish: 'Libra' },
      { paatham: 4, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
    ],
  },
  {
    id: 'anuradha',
    tamilName: 'அனுஷம்',
    englishName: 'Anuradha',
    paathams: [
      { paatham: 1, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 2, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 3, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 4, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
    ],
  },
  {
    id: 'jyeshtha',
    tamilName: 'கேட்டை',
    englishName: 'Jyeshtha',
    paathams: [
      { paatham: 1, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 2, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 3, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
      { paatham: 4, rasiTamil: 'விருச்சிகம்', rasiEnglish: 'Scorpio' },
    ],
  },
  {
    id: 'mula',
    tamilName: 'மூலம்',
    englishName: 'Mula',
    paathams: [
      { paatham: 1, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 2, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 3, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 4, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
    ],
  },
  {
    id: 'purva_ashadha',
    tamilName: 'பூராடம்',
    englishName: 'Purva Ashadha',
    paathams: [
      { paatham: 1, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 2, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 3, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 4, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
    ],
  },
  {
    id: 'uttara_ashadha',
    tamilName: 'உத்திராடம்',
    englishName: 'Uttara Ashadha',
    paathams: [
      { paatham: 1, rasiTamil: 'தனுசு', rasiEnglish: 'Sagittarius' },
      { paatham: 2, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 3, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 4, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
    ],
  },
  {
    id: 'shravana',
    tamilName: 'திருவோணம்',
    englishName: 'Shravana',
    paathams: [
      { paatham: 1, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 2, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 3, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 4, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
    ],
  },
  {
    id: 'dhanishta',
    tamilName: 'அவிட்டம்',
    englishName: 'Dhanishta',
    paathams: [
      { paatham: 1, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 2, rasiTamil: 'மகரம்', rasiEnglish: 'Capricorn' },
      { paatham: 3, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 4, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
    ],
  },
  {
    id: 'shatabhisha',
    tamilName: 'சதயம்',
    englishName: 'Shatabhisha',
    paathams: [
      { paatham: 1, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 2, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 3, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 4, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
    ],
  },
  {
    id: 'purva_bhadrapada',
    tamilName: 'பூரட்டாதி',
    englishName: 'Purva Bhadrapada',
    paathams: [
      { paatham: 1, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 2, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 3, rasiTamil: 'கும்பம்', rasiEnglish: 'Aquarius' },
      { paatham: 4, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
    ],
  },
  {
    id: 'uttara_bhadrapada',
    tamilName: 'உத்திரட்டாதி',
    englishName: 'Uttara Bhadrapada',
    paathams: [
      { paatham: 1, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 2, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 3, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 4, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
    ],
  },
  {
    id: 'revati',
    tamilName: 'ரேவதி',
    englishName: 'Revati',
    paathams: [
      { paatham: 1, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 2, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 3, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
      { paatham: 4, rasiTamil: 'மீனம்', rasiEnglish: 'Pisces' },
    ],
  },
];

export function findNakshatra(nameOrId: string): NakshatraDefinition | undefined {
  const query = nameOrId.trim().toLowerCase();
  return NAKSHATRAS.find(
    (n) =>
      n.id.toLowerCase() === query ||
      n.tamilName === nameOrId.trim() ||
      n.englishName.toLowerCase() === query
  );
}

export function getValidPaathams(nakshatraNameOrId: string): number[] {
  const nakshatra = findNakshatra(nakshatraNameOrId);
  return nakshatra ? nakshatra.paathams.map((p) => p.paatham) : [1, 2, 3, 4];
}

export function getSuggestedRasi(
  nakshatraNameOrId: string,
  paatham: number
): { rasiTamil: string; rasiEnglish: string } | undefined {
  const nakshatra = findNakshatra(nakshatraNameOrId);
  if (!nakshatra) return undefined;
  const match = nakshatra.paathams.find((p) => p.paatham === paatham);
  return match ? { rasiTamil: match.rasiTamil, rasiEnglish: match.rasiEnglish } : undefined;
}
