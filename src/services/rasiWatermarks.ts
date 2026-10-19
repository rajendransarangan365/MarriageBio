/**
 * All 12 Vedic Rasi Auspicious Watermark SVGs
 * Mesham, Rishabam, Mithunam, Kadagam, Simmam, Kanni,
 * Thulam, Vrichigam, Dhanusu, Magaram, Kumbam, Meenam
 */

export const RASI_WATERMARKS: Record<string, string> = {
  // 1. மேஷம் (Aries - Ram)
  mesham: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Ram Horns -->
    <path d="M 88 68 C 76 38 38 44 40 74 C 42 94 65 92 72 82 C 75 78 65 72 56 72" fill="none" stroke="#B45309" stroke-width="3"/>
    <path d="M 112 68 C 124 38 162 44 160 74 C 158 94 135 92 128 82 C 125 78 135 72 144 72" fill="none" stroke="#B45309" stroke-width="3"/>
    <!-- Face -->
    <path d="M 84 68 C 84 96 88 122 100 130 C 112 122 116 96 116 68 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2.2"/>
    <!-- Ears -->
    <path d="M 74 74 Q 58 84 70 90 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 126 74 Q 142 84 130 90 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <!-- Eyes & Snout -->
    <ellipse cx="88" cy="86" rx="2.5" ry="3.5" fill="#B45309"/>
    <ellipse cx="112" cy="86" rx="2.5" ry="3.5" fill="#B45309"/>
    <path d="M 94 120 Q 100 124 106 120" stroke="#B45309" stroke-width="2" fill="none"/>
    <line x1="100" y1="70" x2="100" y2="82" stroke="#DC2626" stroke-width="2.5"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">மேஷம் (Aries)</text>
  </g>
</svg>`,

  // 2. ரிஷபம் (Taurus - Bull / Nandi)
  rishabam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Horns -->
    <path d="M 80 72 C 64 38 48 24 56 18 C 64 12 76 30 90 64" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
    <path d="M 120 72 C 136 38 152 24 144 18 C 136 12 124 30 110 64" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
    <!-- Head -->
    <path d="M 76 68 C 76 98 82 134 100 142 C 118 134 124 98 124 68 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2.2"/>
    <path d="M 70 78 Q 50 88 66 98 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 130 78 Q 150 88 134 98 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <!-- Muzzle & Nose Ring -->
    <ellipse cx="100" cy="126" rx="14" ry="9" fill="#FDE68A" stroke="#B45309" stroke-width="1.8"/>
    <circle cx="100" cy="136" r="5" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <ellipse cx="86" cy="88" rx="3" ry="4" fill="#B45309"/>
    <ellipse cx="114" cy="88" rx="3" ry="4" fill="#B45309"/>
    <circle cx="100" cy="78" r="3.5" fill="#DC2626"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">ரிஷபம் (Taurus)</text>
  </g>
</svg>`,

  // 3. மிதுனம் (Gemini - Twins)
  mithunam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Left Figure -->
    <circle cx="80" cy="68" r="17" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 70 54 Q 80 40 90 54 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 68 85 C 65 115 76 138 92 144 C 98 122 88 95 84 85 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>
    <!-- Right Figure -->
    <circle cx="120" cy="68" r="17" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 110 54 Q 120 40 130 54 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 132 85 C 135 115 124 138 108 144 C 102 122 112 95 116 85 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>
    <!-- Divine Harmony Lotus -->
    <circle cx="100" cy="100" r="4.5" fill="#EF4444"/>
    <path d="M 94 100 Q 100 88 106 100 Q 100 112 94 100 Z" fill="#FCA5A5" stroke="#DC2626" stroke-width="1.2"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">மிதுனம் (Gemini)</text>
  </g>
</svg>`,

  // 4. கடகம் (Cancer - Crab)
  kadagam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Shell -->
    <ellipse cx="100" cy="96" rx="28" ry="22" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/>
    <path d="M 85 90 Q 100 84 115 90" stroke="#B45309" stroke-width="1.5" fill="none"/>
    <path d="M 82 100 Q 100 106 118 100" stroke="#B45309" stroke-width="1.5" fill="none"/>
    <!-- Eyes -->
    <circle cx="92" cy="74" r="3" fill="#B45309"/>
    <circle cx="108" cy="74" r="3" fill="#B45309"/>
    <line x1="92" y1="74" x2="94" y2="80" stroke="#B45309" stroke-width="2"/>
    <line x1="108" y1="74" x2="106" y2="80" stroke="#B45309" stroke-width="2"/>
    <!-- Pincers -->
    <path d="M 76 84 C 54 62 38 66 45 46 C 58 52 62 68 80 76" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <path d="M 124 84 C 146 62 162 66 155 46 C 142 52 138 68 120 76" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <!-- Walking Legs -->
    <path d="M 74 95 Q 52 105 44 118" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 73 104 Q 54 118 50 134" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 126 95 Q 148 105 156 118" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 127 104 Q 146 118 150 134" stroke="#B45309" stroke-width="2" fill="none"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">கடகம் (Cancer)</text>
  </g>
</svg>`,

  // 5. சிம்மம் (Leo - Lion)
  simmam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Mane Curls -->
    <circle cx="100" cy="92" r="50" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/>
    <path d="M 52 80 Q 38 98 54 114 Q 44 128 62 136 Q 80 150 100 150 Q 120 150 138 136 Q 156 128 146 114 Q 162 98 148 80" stroke="#B45309" stroke-width="2" fill="none"/>
    <!-- Ears -->
    <path d="M 64 60 Q 52 46 70 46 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 136 60 Q 148 46 130 46 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <!-- Muzzle & Face -->
    <path d="M 88 86 Q 100 78 112 86 Q 112 116 100 124 Q 88 116 88 86 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.8"/>
    <path d="M 94 102 L 106 102 L 100 110 Z" fill="#B45309"/>
    <ellipse cx="84" cy="84" rx="3" ry="4" fill="#B45309"/>
    <ellipse cx="116" cy="84" rx="3" ry="4" fill="#B45309"/>
    <circle cx="100" cy="66" r="3.5" fill="#DC2626"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">சிம்மம் (Leo)</text>
  </g>
</svg>`,

  // 6. கன்னி (Virgo - Maiden)
  kanni: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Maiden Face & Tiara -->
    <circle cx="100" cy="54" r="16" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 90 42 Q 100 30 110 42 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <circle cx="100" cy="52" r="2.5" fill="#DC2626"/>
    <!-- Flowing Hair -->
    <path d="M 85 54 C 78 74 72 96 78 118" stroke="#B45309" stroke-width="2" fill="none"/>
    <path d="M 115 54 C 122 74 128 96 122 118" stroke="#B45309" stroke-width="2" fill="none"/>
    <!-- Figure & Sari -->
    <path d="M 88 70 C 80 95 72 136 100 146 C 128 136 120 95 112 70 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <!-- Sacred Grain Sheaf (கதிர்) in Hand -->
    <path d="M 74 102 Q 58 82 56 64 Q 70 78 78 94" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <!-- Auspicious Lotus -->
    <path d="M 126 102 Q 142 82 144 64 Q 130 78 122 94" fill="#FCA5A5" stroke="#DC2626" stroke-width="1.5"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">கன்னி (Virgo)</text>
  </g>
</svg>`,

  // 7. துலாம் (Libra - Scales)
  thulam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Center Pillar -->
    <line x1="100" y1="36" x2="100" y2="148" stroke="#B45309" stroke-width="3"/>
    <path d="M 80 148 L 120 148 L 114 142 L 86 142 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <circle cx="100" cy="34" r="5" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
    <!-- Beam -->
    <line x1="45" y1="56" x2="155" y2="56" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
    <!-- Left Scale Pan -->
    <line x1="48" y1="58" x2="35" y2="106" stroke="#B45309" stroke-width="1.2"/>
    <line x1="48" y1="58" x2="65" y2="106" stroke="#B45309" stroke-width="1.2"/>
    <path d="M 32 106 Q 50 120 68 106 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <!-- Right Scale Pan -->
    <line x1="152" y1="58" x2="135" y2="106" stroke="#B45309" stroke-width="1.2"/>
    <line x1="152" y1="58" x2="165" y2="106" stroke="#B45309" stroke-width="1.2"/>
    <path d="M 132 106 Q 150 120 168 106 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">துலாம் (Libra)</text>
  </g>
</svg>`,

  // 8. விருச்சிகம் (Scorpio - Scorpion)
  vrichigam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Body -->
    <ellipse cx="100" cy="116" rx="14" ry="16" fill="#FEF3C7" stroke="#B45309" stroke-width="2.2"/>
    <ellipse cx="100" cy="94" rx="16" ry="12" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <circle cx="100" cy="78" r="10" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <!-- Pincers -->
    <path d="M 90 74 Q 65 58 52 44 Q 64 56 78 68" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <path d="M 110 74 Q 135 58 148 44 Q 136 56 122 68" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <!-- Tail & Stinger -->
    <path d="M 100 132 C 100 156 126 158 130 140 C 134 122 120 108 120 84 C 120 64 110 48 96 44" fill="none" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
    <path d="M 96 44 Q 92 38 98 34 Q 102 42 96 44 Z" fill="#DC2626" stroke="#B45309" stroke-width="1.2"/>
    <!-- Legs -->
    <path d="M 88 98 Q 65 104 56 116" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <path d="M 88 110 Q 68 118 62 132" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <path d="M 112 98 Q 135 104 144 116" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <path d="M 112 110 Q 132 118 138 132" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">விருச்சிகம் (Scorpio)</text>
  </g>
</svg>`,

  // 9. தனுசு (Sagittarius - Bow & Arrow)
  dhanusu: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Taut Bow -->
    <path d="M 48 136 C 42 78 78 42 136 48" fill="none" stroke="#B45309" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="48" y1="136" x2="136" y2="48" stroke="#D97706" stroke-width="1.5" stroke-dasharray="2 1"/>
    <!-- Arrow -->
    <line x1="56" y1="128" x2="152" y2="32" stroke="#B45309" stroke-width="2.8"/>
    <path d="M 152 32 L 138 38 L 146 46 Z" fill="#DC2626" stroke="#B45309" stroke-width="1.5"/>
    <path d="M 60 124 L 52 136 L 64 132" stroke="#B45309" stroke-width="2" fill="none"/>
    <!-- Solar Aura -->
    <circle cx="95" cy="92" r="42" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">தனுசு (Sagittarius)</text>
  </g>
</svg>`,

  // 10. மகரம் (Capricorn - Makara)
  magaram: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Makara Head -->
    <path d="M 74 74 C 58 68 50 54 62 48 C 74 42 86 54 94 64 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 50 54 Q 40 60 54 66" stroke="#B45309" stroke-width="1.8" fill="none"/>
    <circle cx="68" cy="56" r="2.5" fill="#B45309"/>
    <!-- Curled Fish Body -->
    <path d="M 88 64 C 118 74 144 98 134 124 C 124 144 94 144 84 128 C 74 114 84 98 98 100" fill="none" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
    <path d="M 84 128 Q 68 144 64 134 Q 74 124 84 128 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.8"/>
    <path d="M 114 84 Q 124 78 124 88 Q 134 94 130 104" stroke="#B45309" stroke-width="1.5" fill="none"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">மகரம் (Capricorn)</text>
  </g>
</svg>`,

  // 11. கும்பம் (Aquarius - Kalash / Water Pot)
  kumbam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="100" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M 60 162 C 60 152, 75 148, 100 148 C 125 148, 140 152, 140 162 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
    <path d="M 48 166 Q 64 150 80 160 Q 100 146 120 160 Q 136 150 152 166 C 142 174 58 174 48 166 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="1.8"/>
    <path d="M 78 106 C 54 116 50 148 76 156 C 90 160 110 160 124 156 C 150 148 146 116 122 106 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
    <path d="M 76 106 L 74 94 C 74 89 82 87 100 87 C 118 87 126 89 126 94 L 124 106 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
    <line x1="75" y1="98" x2="125" y2="98" stroke="#B45309" stroke-width="1.5"/>
    <ellipse cx="100" cy="90" rx="28" ry="5" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
    <path d="M 100 84 Q 96 52 100 30 Q 104 52 100 84 Z" fill="#34D399" stroke="#047857" stroke-width="1.8"/>
    <path d="M 78 86 Q 52 76 38 60 Q 60 66 82 84 Z" fill="#10B981" stroke="#047857" stroke-width="1.8"/>
    <path d="M 85 85 Q 66 60 58 38 Q 78 56 92 84 Z" fill="#34D399" stroke="#047857" stroke-width="1.8"/>
    <path d="M 115 85 Q 134 60 142 38 Q 122 56 108 84 Z" fill="#34D399" stroke="#047857" stroke-width="1.8"/>
    <path d="M 122 86 Q 148 76 162 60 Q 140 66 118 84 Z" fill="#10B981" stroke="#047857" stroke-width="1.8"/>
    <path d="M 85 86 C 78 66 85 42 100 24 C 115 42 122 66 115 86 Z" fill="#D97706" stroke="#92400E" stroke-width="2.2"/>
    <path d="M 100 24 Q 96 14 100 6 Q 104 14 100 24 Z" fill="#78350F" stroke="#78350F" stroke-width="1.2"/>
    <line x1="86" y1="124" x2="114" y2="124" stroke="#FFFFFF" stroke-width="2.2"/>
    <line x1="86" y1="129" x2="114" y2="129" stroke="#FFFFFF" stroke-width="2.2"/>
    <circle cx="100" cy="129" r="3.5" fill="#DC2626"/>
    <text x="100" y="188" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">கும்பம் (Aquarius)</text>
  </g>
</svg>`,

  // 12. மீனம் (Pisces - Two Fishes)
  meenam: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="92" r="76" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="0.5"/>
    <circle cx="100" cy="92" r="68" stroke="#D97706" stroke-width="0.8" fill="none" opacity="0.4"/>
    <!-- Upper Fish (swimming left-to-right) -->
    <path d="M 58 68 C 78 48 118 48 138 68 C 118 83 78 83 58 68 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 58 68 L 44 58 L 47 68 L 44 78 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <circle cx="128" cy="66" r="2.5" fill="#B45309"/>
    <path d="M 98 56 Q 103 46 110 54" stroke="#B45309" stroke-width="1.5" fill="none"/>
    <!-- Lower Fish (swimming right-to-left) -->
    <path d="M 142 118 C 122 138 82 138 62 118 C 82 103 122 103 142 118 Z" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>
    <path d="M 142 118 L 156 108 L 153 118 L 156 128 Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.5"/>
    <circle cx="72" cy="120" r="2.5" fill="#B45309"/>
    <path d="M 102 130 Q 97 140 90 132" stroke="#B45309" stroke-width="1.5" fill="none"/>
    <text x="100" y="184" text-anchor="middle" font-size="14" font-weight="800" fill="#B45309" font-family="'Anek Tamil', sans-serif" letter-spacing="0.5">மீனம் (Pisces)</text>
  </g>
</svg>`,
};

// Default fallback is the auspicious Poorna Kumbam
RASI_WATERMARKS['default'] = RASI_WATERMARKS['kumbam'];

/**
 * Resolves the matching auspicious Rasi Watermark SVG from candidate's rasi string
 */
export function getRasiWatermarkSvg(rasiName?: string): string {
  if (!rasiName) return RASI_WATERMARKS['default'];
  const r = rasiName.toLowerCase();

  if (r.includes('மேஷ') || r.includes('aries')) return RASI_WATERMARKS['mesham'];
  if (r.includes('ரிஷப') || r.includes('taurus')) return RASI_WATERMARKS['rishabam'];
  if (r.includes('மிதுன') || r.includes('gemini')) return RASI_WATERMARKS['mithunam'];
  if (r.includes('கடக') || r.includes('cancer')) return RASI_WATERMARKS['kadagam'];
  if (r.includes('சிம்ம') || r.includes('leo')) return RASI_WATERMARKS['simmam'];
  if (r.includes('கன்னி') || r.includes('virgo')) return RASI_WATERMARKS['kanni'];
  if (r.includes('துலா') || r.includes('libra')) return RASI_WATERMARKS['thulam'];
  if (r.includes('விருச்சிக') || r.includes('scorpio')) return RASI_WATERMARKS['vrichigam'];
  if (r.includes('தனு') || r.includes('sagittarius')) return RASI_WATERMARKS['dhanusu'];
  if (r.includes('மகர') || r.includes('capricorn')) return RASI_WATERMARKS['magaram'];
  if (r.includes('கும்ப') || r.includes('aquarius')) return RASI_WATERMARKS['kumbam'];
  if (r.includes('மீன') || r.includes('pisces')) return RASI_WATERMARKS['meenam'];

  return RASI_WATERMARKS['default'];
}
