export type Gender = 'groom' | 'bride';

export type SiblingRelation = 'அண்ணன் (Elder Brother)' | 'தம்பி (Younger Brother)' | 'அக்கா (Elder Sister)' | 'தங்கை (Younger Sister)';
export type MaritalStatus = 'திருமணமானவர் (Married)' | 'திருமணமாகாதவர் (Unmarried)';

export interface SiblingItem {
  id: string;
  relation: SiblingRelation;
  maritalStatus: MaritalStatus;
  details?: string;
}

export interface HoroscopeChartHouses {
  1: string[]; // மேஷம் (Aries)
  2: string[]; // ரிஷபம் (Taurus)
  3: string[]; // மிதுனம் (Gemini)
  4: string[]; // கடகம் (Cancer)
  5: string[]; // சிம்மம் (Leo)
  6: string[]; // கன்னி (Virgo)
  7: string[]; // துலாம் (Libra)
  8: string[]; // விருச்சிகம் (Scorpio)
  9: string[]; // தனுசு (Sagittarius)
  10: string[]; // மகரம் (Capricorn)
  11: string[]; // கும்பம் (Aquarius)
  12: string[]; // மீனம் (Pisces)
}

export interface BiodataProfile {
  id: string;
  createdAt: number;
  updatedAt: number;

  // 1. Invocation & Header
  godInvocation: string;
  customGodInvocation: string;
  headerSymbol: 'pillaiyar_suzhi' | 'om' | 'kalasam' | 'vilakku';

  // 2. Personal Particulars
  gender: Gender;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD or DD-MM-YYYY
  timeOfBirth: string; // HH:MM
  timePeriod: 'AM' | 'PM';
  placeOfBirth: string;
  religion: string;
  caste: string;
  complexion: string;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  motherTongue: string;
  gothram: string;
  kuladeivam: string;

  // 3. Education & Career
  qualification: string;
  collegeOrUniversity: string;
  occupation: string;
  companyName: string;
  annualIncome: string;
  incomePeriod: 'monthly' | 'yearly';
  workLocation: string;
  hobbies: string;

  // 4. Family Details
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  nativePlace: string;
  parentsContact: string;
  contactNumber2: string;
  email: string;
  residentialAddress: string;

  // Siblings & Birth Order
  siblings: SiblingItem[];
  brothersCount: number;
  sistersCount: number;
  birthOrder: string;

  // Optional Assets
  showAssets: boolean;
  selectedAssets: string[];
  assetsDescription: string;

  // 5. Horoscope & Astrology
  sunMahadashaYears: string;
  sunMahadashaMonths: string;
  sunMahadashaDays: string;
  rasi: string;
  nakshatram: string;
  padham: string;
  lagnam: string;
  dhasaBukthi: string;
  dosham: string;
  rasiChart: HoroscopeChartHouses;
  navamsamChart: HoroscopeChartHouses;

  // 5.1 Lifestyle & Habits
  foodHabit?: string;

  // 6. Photo & ImageToolbox-Style Frame & Shape Controls
  photoUri: string | null;
  photoOriginalUri?: string | null; // For restoring if background removed
  photoFrameStyle: 'rounded' | 'circle' | 'ornamental_gold' | 'double_border';
  photoBackground: 'original' | 'transparent' | 'cream' | 'gold_gradient' | 'maroon_gradient' | 'silk_gradient';
  photoLayout: 'standing_cutout' | 'framed_right' | 'circle_frame';
  photoCutoutEnabled: boolean;
  photoZoom: number; // 0.5 to 2.5 (1.0 default)
  photoPositionX: number; // in pixels offset
  photoPositionY: number; // in pixels offset
  photoRotation: number; // in degrees
  photoFrameBorder: 'none' | 'ornamental_gold' | 'temple_arch' | 'double_border' | 'rounded';
  photoShape: 'rectangle' | 'temple_arch' | 'circle' | 'hexagon' | 'scallop' | 'diamond' | 'gaussian_blur' | 'feather_bottom' | 'feather_abstract' | 'feather_temple';
  photoFrameHeight: number; // in px
  photoFrameWidth: number; // in px
  photoBrightness: number; // 50 to 150 (100 default)
  photoContrast: number; // 50 to 150 (100 default)
  photoBeautify: number; // 0 to 100 (skin glow / glamour)
  photoSaturation: number; // 50 to 150 (100 default)
  photoWarmth: number; // 0 to 100 (golden tone)
  photoVignette: boolean;

  // 7. Border Design Element for PDF & Previews
  borderElementStyle: 'traditional_vel' | 'gold_double' | 'temple_pillar' | 'floral_vine' | 'modern_art_deco';

  // 8. Gemini AI Polished Content
  aboutCandidate: string;
  partnerExpectations: string;
  aiTone: 'traditional' | 'modern' | 'bilingual';

  // 9. Template Configuration
  templateId: string;
}

export const INITIAL_HOUSES: HoroscopeChartHouses = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: [],
};

export const createDefaultProfile = (gender: Gender = 'groom'): BiodataProfile => {
  const isGroom = gender === 'groom';
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    godInvocation: '|| ஸ்ரீ விநாயகர் துணை ||',
    customGodInvocation: '',
    headerSymbol: 'pillaiyar_suzhi',
    gender,
    fullName: isGroom ? 'ஆர். ஸ்ரீராம்' : 'எஸ். மீனா பிரியா',
    dateOfBirth: '14-04-1996',
    timeOfBirth: '06:45',
    timePeriod: 'AM',
    placeOfBirth: 'மதுரை',
    religion: 'இந்து (Hindu)',
    caste: 'விஸ்வகர்மா (Viswakarma)',
    complexion: 'மாநிறம் (Wheatish)',
    heightFeet: 5,
    heightInches: 10,
    heightCm: 178,
    motherTongue: 'தமிழ்',
    gothram: 'சிவன் கோத்திரம்',
    kuladeivam: 'ஸ்ரீ காளியம்மன் (திருமங்கலம்)',
    qualification: 'B.E. (Computer Science & Engineering)',
    collegeOrUniversity: '',
    occupation: 'முதுநிலை மென்பொருள் பொறியாளர் (Senior Software Engineer)',
    companyName: 'பிரபல பன்னாட்டு நிறுவனம் (MNC)',
    annualIncome: '18,00,000',
    incomePeriod: 'yearly',
    workLocation: 'சென்னை',
    hobbies: 'ஆன்மீகம், வாசிப்பு, யோகா',
    fatherName: 'ஆர். கிருஷ்ணன்',
    fatherOccupation: 'ஓய்வுபெற்ற அரசு அலுவலர்',
    motherName: 'கே. லட்சுமி',
    motherOccupation: 'குடும்பத் தலைவி (Home Maker)',
    nativePlace: 'மதுரை',
    parentsContact: '+91 98765 43210',
    contactNumber2: '+91 94444 12345',
    email: isGroom ? 'sriram.matrimony@email.com' : 'meena.matrimony@email.com',
    residentialAddress: 'எண் 42, காமராஜர் தெரு, அண்ணா நகர், சென்னை - 600040',
    siblings: [
      {
        id: 'sib_1',
        relation: 'தம்பி (Younger Brother)',
        maritalStatus: 'திருமணமாகாதவர் (Unmarried)',
        details: 'B.Com படித்து வருகிறார்',
      },
    ],
    brothersCount: 1,
    sistersCount: 0,
    birthOrder: 'முதல் குழந்தை / மூத்தவர் (1st Child)',
    showAssets: true,
    selectedAssets: ['சொந்த வீடு / பங்களா (Own House)', 'விவசாய நிலம் (Agricultural Land)'],
    assetsDescription: 'சென்னையில் சொந்த வீடு மற்றும் பூர்வீக ஊரில் விவசாய நிலம் உள்ளது.',
    sunMahadashaYears: '3',
    sunMahadashaMonths: '4',
    sunMahadashaDays: '12',
    rasi: 'கன்னி',
    nakshatram: 'அஸ்தம்',
    padham: '2',
    lagnam: 'மேஷம்',
    dhasaBukthi: 'சூரிய திசை இருப்பு 3 வருடம் 4 மாதம் 12 நாள்',
    dosham: 'தோஷம் ஏதுமில்லை (சுத்த ஜாதகம்)',
    rasiChart: {
      1: ['லக்'],
      2: ['சந்'],
      3: [],
      4: ['செ'],
      5: ['சூ', 'பு'],
      6: [],
      7: ['சுக்'],
      8: ['கே'],
      9: ['கு'],
      10: ['ச'],
      11: [],
      12: ['ரா'],
    },
    navamsamChart: {
      1: ['சந்'],
      2: ['சூ'],
      3: [],
      4: ['கு'],
      5: ['லக்'],
      6: ['சுக்'],
      7: ['ச'],
      8: [],
      9: ['பு'],
      10: ['செ'],
      11: ['ரா'],
      12: ['கே'],
    },
    foodHabit: 'அசைவம் (Non-Veg)',
    photoUri: null,
    photoOriginalUri: null,
    photoFrameStyle: 'ornamental_gold',
    photoBackground: 'transparent',
    photoLayout: 'standing_cutout',
    photoCutoutEnabled: true,
    photoZoom: 1.0,
    photoPositionX: 0,
    photoPositionY: 0,
    photoRotation: 0,
    photoFrameBorder: 'none',
    photoShape: 'temple_arch',
    photoFrameHeight: 280,
    photoFrameWidth: 190,
    photoBrightness: 100,
    photoContrast: 100,
    photoBeautify: 0,
    photoSaturation: 100,
    photoWarmth: 0,
    photoVignette: false,
    borderElementStyle: 'traditional_vel',
    aboutCandidate: isGroom
      ? 'வரன் B.E முடித்து சென்னையில் முன்னணி மென்பொருள் நிறுவனத்தில் நல்ல ஊதியத்துடன் பணியாற்றுகிறார். பெரியோர்களை மதிக்கும் நற்பண்பும், குடும்பப் பாசமும் கொண்ட நற்குணமுடையவர்.'
      : 'மணமகள் B.Tech முடித்து சென்னையில் முன்னணி நிறுவனத்தில் பணியாற்றுகிறார். பாரம்பரிய பண்பாடும் ஆன்மீக ஈடுபாடும் கொண்ட அன்பான பெண்.',
    partnerExpectations: isGroom
      ? 'குடும்பப் பண்பாடும் நல்லொழுக்கமும் கொண்ட பட்டதாரி பெண் வரன் எதிர்பார்க்கப்படுகிறது. ஜாதகப் பொருத்தம் முக்கியம்.'
      : 'நல்ல வேலையில் உள்ள குடும்பப் பாசம் கொண்ட பட்டதாரி இளைஞர் வரன் எதிர்பார்க்கப்படுகிறது.',
    aiTone: 'traditional',
    templateId: isGroom ? 'classic_tamil' : 'floral_elegance',
  };
};

/**
 * Creates a completely clean / blank profile with no dummy text,
 * so the user can enter their own details directly from scratch!
 */
export const createBlankProfile = (gender: Gender = 'groom'): BiodataProfile => {
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    godInvocation: '|| ஸ்ரீ விநாயகர் துணை ||',
    customGodInvocation: '',
    headerSymbol: 'pillaiyar_suzhi',
    gender,
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    timePeriod: 'AM',
    placeOfBirth: '',
    religion: 'இந்து (Hindu)',
    caste: '',
    complexion: '',
    heightFeet: 5,
    heightInches: 8,
    heightCm: 172,
    motherTongue: 'தமிழ்',
    gothram: '',
    kuladeivam: '',
    qualification: '',
    collegeOrUniversity: '',
    occupation: '',
    companyName: '',
    annualIncome: '',
    incomePeriod: 'monthly',
    workLocation: '',
    hobbies: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    nativePlace: '',
    parentsContact: '',
    contactNumber2: '',
    email: '',
    residentialAddress: '',
    siblings: [],
    brothersCount: 0,
    sistersCount: 0,
    birthOrder: '',
    showAssets: false,
    selectedAssets: [],
    assetsDescription: '',
    sunMahadashaYears: '',
    sunMahadashaMonths: '',
    sunMahadashaDays: '',
    rasi: '',
    nakshatram: '',
    padham: '',
    lagnam: '',
    dhasaBukthi: '',
    dosham: 'தோஷம் ஏதுமில்லை (சுத்த ஜாதகம்)',
    rasiChart: { ...INITIAL_HOUSES },
    navamsamChart: { ...INITIAL_HOUSES },
    foodHabit: 'சைவம் (Veg)',
    photoUri: null,
    photoOriginalUri: null,
    photoFrameStyle: 'ornamental_gold',
    photoBackground: 'transparent',
    photoLayout: 'standing_cutout',
    photoCutoutEnabled: true,
    photoZoom: 1.0,
    photoPositionX: 0,
    photoPositionY: 0,
    photoRotation: 0,
    photoFrameBorder: 'none',
    photoShape: 'temple_arch',
    photoFrameHeight: 280,
    photoFrameWidth: 190,
    photoBrightness: 100,
    photoContrast: 100,
    photoBeautify: 0,
    photoSaturation: 100,
    photoWarmth: 0,
    photoVignette: false,
    borderElementStyle: 'traditional_vel',
    aboutCandidate: '',
    partnerExpectations: '',
    aiTone: 'traditional',
    templateId: gender === 'groom' ? 'classic_tamil' : 'floral_elegance',
  };
};

// Aliases for compatibility
export type BiodataState = BiodataProfile;
export const INITIAL_BIODATA = createBlankProfile('groom');
export type PlanetCode = string;
