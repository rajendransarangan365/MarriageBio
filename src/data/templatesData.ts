export interface TemplateMetadata {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  category: 'traditional' | 'modern' | 'heritage' | 'floral';
  genderRecommendation: 'groom' | 'bride' | 'all';
  description: string;
  palette: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    cardBg: string;
    borderOuter: string;
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    sectionHeaderBg: string;
  };
  borderStyle: 'ornamental' | 'gold_double' | 'floral_soft' | 'sleek' | 'temple_pillar';
}

export const TEMPLATES_CATALOG: TemplateMetadata[] = [
  {
    id: 'classic_tamil',
    nameTamil: '1. மரபுசார் பாரம்பரியம்',
    nameEnglish: 'Classic Tamil Traditional',
    category: 'traditional',
    genderRecommendation: 'all',
    description: 'பாரம்பரிய குங்கும சிவப்பு மற்றும் தங்க நிற வேலைப்பாடுகளுடன் கூடிய முகூர்த்த விபரம்.',
    palette: {
      primary: '#991B1B',
      primaryDark: '#7F1D1D',
      accent: '#B45309',
      background: '#FFFDF9',
      cardBg: '#FFFFFF',
      borderOuter: '#B91C1C',
      headerBg: '#FEF2F2',
      badgeBg: '#FEE2E2',
      badgeText: '#991B1B',
      sectionHeaderBg: '#FED7AA',
    },
    borderStyle: 'ornamental',
  },
  {
    id: 'modern_minimal',
    nameTamil: '2. நவீன எளிய வடிவம்',
    nameEnglish: 'Modern Minimal',
    category: 'modern',
    genderRecommendation: 'all',
    description: 'எளிய, தெளிவான எழுத்துரு மற்றும் மெல்லிய சாம்பல்/நீல கோடுகளுடன் கூடிய நேர்த்தியான வடிவம்.',
    palette: {
      primary: '#334155',
      primaryDark: '#0F172A',
      accent: '#64748B',
      background: '#F8FAFC',
      cardBg: '#FFFFFF',
      borderOuter: '#CBD5E1',
      headerBg: '#F1F5F9',
      badgeBg: '#E2E8F0',
      badgeText: '#1E293B',
      sectionHeaderBg: '#E2E8F0',
    },
    borderStyle: 'sleek',
  },
  {
    id: 'premium_gold_heritage',
    nameTamil: '3. முகூர்த்தப் பொன் பாரம்பரியம்',
    nameEnglish: 'Premium Gold Heritage',
    category: 'heritage',
    genderRecommendation: 'groom',
    description: 'அரச கம்பீரமும், தங்க ஜரிகை பார்டரும் கொண்ட உயர்தர முகூர்த்தப் பட்டு வடிவம்.',
    palette: {
      primary: '#854D0E',
      primaryDark: '#713F12',
      accent: '#CA8A04',
      background: '#FEFCE8',
      cardBg: '#FFFFFF',
      borderOuter: '#EAB308',
      headerBg: '#FEF9C3',
      badgeBg: '#FEF08A',
      badgeText: '#854D0E',
      sectionHeaderBg: '#FDE047',
    },
    borderStyle: 'gold_double',
  },
  {
    id: 'floral_elegance',
    nameTamil: '4. மலர் எழில்',
    nameEnglish: 'Floral Elegance',
    category: 'floral',
    genderRecommendation: 'bride',
    description: 'மென்மையான ரோஸ் மற்றும் மல்லிகை மலர் வடிவமைப்புடன் கூடிய மணமகள் சிறப்பு வடிவம்.',
    palette: {
      primary: '#BE185D',
      primaryDark: '#9D174D',
      accent: '#F472B6',
      background: '#FDF2F8',
      cardBg: '#FFFFFF',
      borderOuter: '#EC4899',
      headerBg: '#FCE7F3',
      badgeBg: '#FBCFE8',
      badgeText: '#BE185D',
      sectionHeaderBg: '#F9A8D4',
    },
    borderStyle: 'floral_soft',
  },
  {
    id: 'modern_professional',
    nameTamil: '5. நவீன தொழில்சார் வடிவம்',
    nameEnglish: 'Modern Professional',
    category: 'modern',
    genderRecommendation: 'groom',
    description: 'மென்பொருள் மற்றும் தொழில்சார் வரன்களுக்கு ஏற்ற ராயல் நேவி நீல நவீன வடிவமைப்பு.',
    palette: {
      primary: '#1E3A8A',
      primaryDark: '#0F172A',
      accent: '#3B82F6',
      background: '#EFF6FF',
      cardBg: '#FFFFFF',
      borderOuter: '#2563EB',
      headerBg: '#DBEAFE',
      badgeBg: '#BFDBFE',
      badgeText: '#1E3A8A',
      sectionHeaderBg: '#93C5FD',
    },
    borderStyle: 'sleek',
  },
  {
    id: 'temple_traditional',
    nameTamil: '6. கோயில் மங்கள வடிவம்',
    nameEnglish: 'Temple-Inspired Traditional',
    category: 'traditional',
    genderRecommendation: 'all',
    description: 'கோபுர கலச வடிவம், மாக்கோலம் மற்றும் மங்கள தீப சின்னங்களுடன் கூடிய தெய்வீக வடிவம்.',
    palette: {
      primary: '#7C2D12',
      primaryDark: '#431407',
      accent: '#EA580C',
      background: '#FFF7ED',
      cardBg: '#FFFFFF',
      borderOuter: '#C2410C',
      headerBg: '#FFEDD5',
      badgeBg: '#FED7AA',
      badgeText: '#7C2D12',
      sectionHeaderBg: '#FDBA74',
    },
    borderStyle: 'temple_pillar',
  },
  {
    id: 'contemporary_pastel',
    nameTamil: '7. சமகால மென்மை',
    nameEnglish: 'Contemporary Pastel',
    category: 'modern',
    genderRecommendation: 'bride',
    description: 'மென்மையான பச்டேல் பிஸ்தா பச்சை மற்றும் பட்டு வண்ண கலவை.',
    palette: {
      primary: '#047857',
      primaryDark: '#064E3B',
      accent: '#10B981',
      background: '#ECFDF5',
      cardBg: '#FFFFFF',
      borderOuter: '#059669',
      headerBg: '#D1FAE5',
      badgeBg: '#A7F3D0',
      badgeText: '#047857',
      sectionHeaderBg: '#6EE7B7',
    },
    borderStyle: 'sleek',
  },
  {
    id: 'compact_two_column',
    nameTamil: '8. இரு-பத்தி வடிவம்',
    nameEnglish: 'Compact Two-Column',
    category: 'modern',
    genderRecommendation: 'all',
    description: 'ஒற்றைப் பக்கத்தில் அனைத்து விவரங்களும் அடங்கும் வகையில் வடிவமைக்கப்பட்ட இரு-பத்தி வடிவம்.',
    palette: {
      primary: '#4C1D95',
      primaryDark: '#2E1065',
      accent: '#8B5CF6',
      background: '#F5F3FF',
      cardBg: '#FFFFFF',
      borderOuter: '#6D28D9',
      headerBg: '#EDE9FE',
      badgeBg: '#DDD6FE',
      badgeText: '#4C1D95',
      sectionHeaderBg: '#C4B5FD',
    },
    borderStyle: 'sleek',
  },
];
