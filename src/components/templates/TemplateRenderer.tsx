import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BiodataProfile, HoroscopeChartHouses } from '../../types/biodata';
import { TEMPLATES_CATALOG, TemplateMetadata } from '../../data/templatesData';
import { getRasiWatermarkSvg } from '../../services/rasiWatermarks';

interface TemplateRendererProps {
  biodata: BiodataProfile;
  isWordMode?: boolean;
  onUpdateField?: <K extends keyof BiodataProfile>(key: K, value: BiodataProfile[K]) => void;
  onUpdatePhotoTransform?: (zoom: number, posX: number, posY: number) => void;
  isRepositioningPhoto?: boolean;
}

const WordModeContext = React.createContext<{
  isWordMode: boolean;
  onUpdateField?: <K extends keyof BiodataProfile>(key: K, value: BiodataProfile[K]) => void;
}>({ isWordMode: false });

const InlineWordInput = ({
  field,
  value,
  style,
  placeholder,
  multiline = false,
}: {
  field: keyof BiodataProfile;
  value: string;
  style: any;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const { isWordMode, onUpdateField } = React.useContext(WordModeContext);
  if (!isWordMode || !onUpdateField) {
    return (
      <Text style={style}>
        {value || placeholder || '-'}
      </Text>
    );
  }
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onUpdateField(field, text as any)}
      style={[
        style,
        {
          borderBottomWidth: 1.5,
          borderBottomColor: '#2563EB',
          backgroundColor: 'rgba(239, 246, 255, 0.75)',
          borderRadius: 3,
          paddingHorizontal: 4,
          paddingVertical: 1,
        },
      ]}
      placeholder={placeholder || 'உள்ளிடுக...'}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
    />
  );
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  biodata,
  isWordMode = false,
  onUpdateField,
  onUpdatePhotoTransform,
  isRepositioningPhoto = false,
}) => {
  const isGroom = biodata.gender === 'groom';

  const template: TemplateMetadata =
    TEMPLATES_CATALOG.find((t) => t.id === biodata.templateId) || TEMPLATES_CATALOG[0];
  const theme = template.palette;

  const finalGodInvocation =
    biodata.godInvocation === 'தனிப்பயன் குலதெய்வம் (Custom)'
      ? biodata.customGodInvocation || '|| ஸ்ரீ குலதெய்வம் துணை ||'
      : biodata.godInvocation || '|| ஸ்ரீ விநாயகர் துணை ||';

  // Format siblings summary
  const siblingsText =
    biodata.siblings && biodata.siblings.length > 0
      ? biodata.siblings
          .map(
            (s) =>
              `${s.relation} - ${s.maritalStatus}${s.details ? ` (${s.details})` : ''}`
          )
          .join('; ')
      : `${biodata.brothersCount > 0 ? `சகோதரர்: ${biodata.brothersCount}` : ''} ${
          biodata.sistersCount > 0 ? `சகோதரி: ${biodata.sistersCount}` : ''
        }`.trim() || '-';

  // Format height string
  const heightText = `${biodata.heightFeet || 5} அடி ${biodata.heightInches || 0} அங் (${
    biodata.heightCm || 165
  } செ.மீ)`;

  // Frame Border Styles
  const getFrameBorderStyle = () => {
    switch (biodata.photoFrameBorder) {
      case 'ornamental_gold':
        return {
          borderWidth: 3.5,
          borderColor: '#D97706',
          shadowColor: '#B45309',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        };
      case 'temple_arch':
        return {
          borderWidth: 2.5,
          borderColor: '#991B1B',
        };
      case 'double_border':
        return {
          borderWidth: 2.5,
          borderColor: '#B91C1C',
          padding: 2,
        };
      case 'rounded':
        return {
          borderWidth: 1.5,
          borderColor: '#9CA3AF',
        };
      case 'none':
      default:
        return {
          borderWidth: 0,
        };
    }
  };

  // Shape Changer Styles
  const getPhotoShapeStyle = () => {
    switch (biodata.photoShape) {
      case 'circle':
        return { borderRadius: 999 };
      case 'temple_arch':
        return {
          borderTopLeftRadius: 85,
          borderTopRightRadius: 85,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
        };
      case 'hexagon':
      case 'diamond':
        return {
          borderRadius: 16,
          // @ts-ignore
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        };
      case 'scallop':
        return {
          borderTopLeftRadius: 45,
          borderBottomRightRadius: 45,
          borderTopRightRadius: 15,
          borderBottomLeftRadius: 15,
        };
      case 'gaussian_blur':
        return {
          borderRadius: 0,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%)',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%)',
        };
      case 'feather_bottom':
        return {
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%)',
        };
      case 'feather_abstract':
        return {
          borderRadius: 0,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%)',
        };
      case 'feather_temple':
        return {
          borderTopLeftRadius: 85,
          borderTopRightRadius: 85,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%)',
        };
      case 'tilak_flame':
        return {
          borderTopLeftRadius: 105,
          borderTopRightRadius: 105,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          // @ts-ignore
          maskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0.55) 86%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0.55) 86%, transparent 100%)',
        };
      case 'royal_oval':
        return {
          borderRadius: 80,
          // @ts-ignore
          maskImage: 'radial-gradient(ellipse 78% 88% at 50% 50%, #000 48%, rgba(0,0,0,0.68) 78%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 88% at 50% 50%, #000 48%, rgba(0,0,0,0.68) 78%, transparent 100%)',
        };
      case 'rectangle':
      default:
        return { borderRadius: 6 };
    }
  };

  const PLANET_ENG_MAP: Record<string, string> = {
    'சூ': 'Sun',
    'சந்': 'Moon',
    'செ': 'Mars',
    'பு': 'Mercury',
    'கு': 'Jupiter',
    'சு': 'Venus',
    'ச': 'Saturn',
    'ரா': 'Rahu',
    'கே': 'Ketu',
    'லக்': 'Lagna',
    'மா': 'Mandi',
  };

  const getFrameBgColor = () => {
    // Keep transparent for all gradient or abstract styles so they don't form a hard rectangular box
    switch (biodata.photoBackground) {
      case 'cream':
        return '#FFFDF5';
      case 'transparent':
      case 'original':
      default:
        return 'transparent';
    }
  };

  const getFrameBgGradient = () => {
    switch (biodata.photoBackground) {
      case 'abstract_warm':
        return 'radial-gradient(circle at 50% 38%, rgba(255, 253, 245, 0.95) 0%, rgba(254, 243, 199, 0.70) 45%, rgba(255, 251, 235, 0.30) 75%, transparent 100%)';
      case 'abstract_silk':
        return 'radial-gradient(circle at 50% 38%, rgba(254, 249, 195, 0.92) 0%, rgba(254, 240, 138, 0.65) 42%, rgba(255, 251, 235, 0.28) 75%, transparent 100%)';
      case 'abstract_rose':
        return 'radial-gradient(circle at 50% 38%, rgba(255, 241, 242, 0.92) 0%, rgba(255, 228, 230, 0.65) 45%, rgba(250, 250, 249, 0.25) 75%, transparent 100%)';
      case 'abstract_studio':
        return 'radial-gradient(circle at 50% 38%, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.65) 45%, rgba(255, 255, 255, 0.20) 78%, transparent 100%)';
      case 'gold_gradient':
        return 'radial-gradient(circle at 50% 38%, rgba(254, 240, 138, 0.92) 0%, rgba(253, 230, 138, 0.62) 45%, rgba(254, 243, 199, 0.26) 75%, transparent 100%)';
      case 'maroon_gradient':
        return 'radial-gradient(circle at 50% 38%, rgba(252, 231, 243, 0.90) 0%, rgba(254, 205, 211, 0.58) 45%, rgba(255, 241, 242, 0.22) 75%, transparent 100%)';
      case 'silk_gradient':
        return 'radial-gradient(circle at 50% 38%, rgba(209, 250, 229, 0.90) 0%, rgba(167, 243, 208, 0.55) 45%, rgba(236, 253, 245, 0.20) 75%, transparent 100%)';
      case 'cream':
        return 'linear-gradient(135deg, rgba(255, 253, 245, 0.90) 0%, rgba(254, 243, 199, 0.45) 60%, transparent 100%)';
      case 'transparent':
      default:
        return 'transparent';
    }
  };

  // 12-House South Indian Chart Component for side-by-side rendering (Image 2 Design)
  const renderSouthIndianChart = (title: string, data: HoroscopeChartHouses) => {
    const houseNames: Record<number, string> = {
      1: 'மேஷம்', 2: 'ரிஷபம்', 3: 'மிதுனம்', 4: 'கடகம்',
      5: 'சிம்மம்', 6: 'கன்னி', 7: 'துலாம்', 8: 'விருச்சிகம்',
      9: 'தனுசு', 10: 'மகரம்', 11: 'கும்பம்', 12: 'மீனம்',
    };

    const renderCell = (num: number) => {
      const planets = data[num as keyof HoroscopeChartHouses] || [];
      const hasPlanets = planets.length > 0;
      // Auto font: if many planets in a cell, shrink text
      const planetCount = planets.length;
      const autoFontScale = planetCount > 3 ? 0.85 : planetCount > 2 ? 0.92 : 1.0;
      const effectiveFontScale = hsFontScale * autoFontScale;
      return (
        <View style={[
          styles.miniHouseCell,
          { borderColor: theme.accent },
          hasPlanets && styles.miniHouseCellOccupied,
        ]}>
          <Text style={[styles.miniHouseName, { color: theme.accent, fontSize: 6.8 * hsFontScale }]}>
            {houseNames[num]}
          </Text>
          {planets.length === 0 ? (
            <Text style={styles.miniEmptyPlus}>+</Text>
          ) : (
            <View style={styles.miniPlanetsRow}>
              {planets.map((p, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.miniPlanetBadge,
                    p === 'லக்' && { backgroundColor: '#DC2626' },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniPlanetText,
                      p === 'லக்' && { color: '#FFFFFF' },
                      { fontSize: 7.8 * effectiveFontScale },
                    ]}
                  >
                    {p}
                  </Text>
                  {PLANET_ENG_MAP[p] ? (
                    <Text
                      style={[
                        styles.miniPlanetSubText,
                        p === 'லக்' && { color: '#FEE2E2' },
                        { fontSize: 5 * effectiveFontScale },
                      ]}
                    >
                      {PLANET_ENG_MAP[p]}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.miniChartBox}>
        <Text style={[styles.miniChartHeading, { color: theme.primaryDark }]}>{title}</Text>
        <View style={[styles.miniChartGrid, { borderColor: theme.accent }]}>
          {/* Row 1: 12 (மீனம்), 1 (மேஷம்), 2 (ரிஷபம்), 3 (மிதுனம்) */}
          <View style={styles.miniGridRow}>
            {renderCell(12)}
            {renderCell(1)}
            {renderCell(2)}
            {renderCell(3)}
          </View>
          {/* Row 2: 11 (கும்பம்), Center Title (2 cols), 4 (கடகம்) */}
          <View style={styles.miniGridRow}>
            {renderCell(11)}
            <View style={[styles.miniCenterHouse, { backgroundColor: '#FDFBF7', borderColor: theme.accent }]}>
              <Text style={[styles.miniCenterText, { color: theme.primary }]}>
                {title.replace(' கட்டம்', '')}
              </Text>
            </View>
            {renderCell(4)}
          </View>
          {/* Row 3: 10 (மகரம்), Center Continues, 5 (சிம்மம்) */}
          <View style={styles.miniGridRow}>
            {renderCell(10)}
            <View style={[styles.miniCenterHouse, { backgroundColor: '#FDFBF7', borderColor: theme.accent }]}>
              <MaterialCommunityIcons name="star-four-points" size={12} color={theme.accent} />
              <Text style={[styles.miniCenterSubText, { color: theme.accent }]}>ஜாதகம்</Text>
            </View>
            {renderCell(5)}
          </View>
          {/* Row 4: 9 (தனுசு), 8 (விருச்சிகம்), 7 (துலாம்), 6 (கன்னி) */}
          <View style={styles.miniGridRow}>
            {renderCell(9)}
            {renderCell(8)}
            {renderCell(7)}
            {renderCell(6)}
          </View>
        </View>
      </View>
    );
  };

  const zoom = biodata.photoZoom || 1.0;
  const posX = biodata.photoPositionX || 0;
  const posY = biodata.photoPositionY || 0;
  const rotation = biodata.photoRotation || 0;
  const frameH = biodata.photoFrameHeight || 280;

  const rasiWatermarkSvg = getRasiWatermarkSvg(biodata.rasi);
  const watermarkDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(rasiWatermarkSvg)}`;

  // Border design helpers
  const borderColor = biodata.borderColor || '#B91C1C';
  const borderStroke = biodata.borderStrokeWidth ?? 3.5;
  const borderOpacity = (biodata.borderOpacity ?? 100) / 100;
  const borderGradient = biodata.borderGradientEnabled ?? true;
  const borderStyle = biodata.borderElementStyle || 'traditional_vel';

  // Build border color with opacity
  const hexWithOpacity = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  const borderColorWithAlpha = hexWithOpacity(borderColor, borderOpacity);
  const borderColorLight = hexWithOpacity(borderColor, borderOpacity * 0.5);

  // Horoscope font size scale
  const hsSize = biodata.horoscopeFontSize || 'auto';
  const hsFontScale = hsSize === 'small' ? 0.85 : hsSize === 'large' ? 1.25 : hsSize === 'xlarge' ? 1.45 : hsSize === 'medium' ? 1.05 : 1.15;

  return (
    <WordModeContext.Provider value={{ isWordMode, onUpdateField }}>
      <View style={[
      styles.outerFrame,
      {
        borderColor: borderStyle !== 'none' ? borderColorWithAlpha : 'transparent',
        borderWidth: borderStyle !== 'none' ? borderStroke : 0,
        backgroundColor: theme.background,
      },
      // Gradient-blend: fade inner border to paper background
      borderGradient && borderStyle !== 'none' ? {
        // @ts-ignore
        boxShadow: `inset 0 0 ${borderStroke * 3}px ${borderColorLight}`,
      } : {},
    ]}>
      <View style={[
        styles.innerFrame,
        {
          borderColor: borderStyle !== 'none' ? borderColorLight : theme.accent,
          borderWidth: borderStyle !== 'none' ? Math.max(1, borderStroke - 1.5) : 1.5,
        }
      ]}>
        
        {/* Auspicious Rasi Watermark in Background */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Image
            source={{ uri: watermarkDataUri }}
            style={styles.watermarkImage}
            resizeMode="contain"
          />
        </View>

        {/* Top Auspicious Invocation Header */}
        <View style={styles.topSacredRow}>
          <View style={styles.centerWorshipCol}>
            {biodata.headerSymbol === 'pillaiyar_suzhi' && (
              <Text style={[styles.tamilSymbolTop, { color: theme.primary }]}>உ</Text>
            )}
            {biodata.headerSymbol === 'om' && (
              <Text style={[styles.tamilSymbolTop, { color: theme.primary }]}>ௐ</Text>
            )}
            {/* Fix: render ஸ்ரீ properly with strict normal letter-spacing to prevent ligature distortion */}
            {isWordMode && onUpdateField ? (
              <TextInput
                value={biodata.godInvocation === 'தனிப்பயன் குலதெய்வம் (Custom)' ? (biodata.customGodInvocation || '') : biodata.godInvocation}
                onChangeText={(t) => {
                  if (biodata.godInvocation !== 'தனிப்பயன் குலதெய்வம் (Custom)') {
                    onUpdateField('godInvocation', 'தனிப்பயன் குலதெய்வம் (Custom)');
                  }
                  onUpdateField('customGodInvocation', t);
                }}
                style={[styles.godInvocationText, styles.inlineWordInputActive, { color: theme.primaryDark }]}
                placeholder="|| ஸ்ரீ விநாயகர் துணை ||"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text
                style={[styles.godInvocationText, { color: theme.primaryDark }]}
                // @ts-ignore
                dataDetectorTypes="none"
              >
                {finalGodInvocation}
              </Text>
            )}
          </View>
        </View>

        {/* Document Sub-Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.bannerTitle}>
            {isGroom ? 'சுப வரன் திருமண விபரம்' : 'சுப மணமகள் திருமண விபரம்'}
          </Text>
        </View>

        {/* 2-COLUMN MODERN MATRIMONIAL LAYOUT */}
        <View style={styles.twoColumnMain}>
          {/* LEFT COLUMN: Personal, Family & Career Details */}
          <View style={[styles.leftDetailsCol, !biodata.photoUri && { flex: 1 }]}>
            
            {/* 1. Candidate Name */}
            <View style={styles.nameHeaderRow}>
              <Text style={styles.detailLabel}>பெயர்</Text>
              <Text style={styles.detailColon}>:</Text>
              <InlineWordInput
                field="fullName"
                value={biodata.fullName}
                style={[styles.candidateBigName, { color: theme.primary }]}
                placeholder="பெயர் உள்ளிடுக"
              />
            </View>

            {/* 2. Birth Details & Optional Age */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {biodata.age && biodata.age.trim() ? 'பிறந்த தேதி & வயது' : 'பிறந்த தேதி'}
              </Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                  <InlineWordInput
                    field="dateOfBirth"
                    value={biodata.dateOfBirth}
                    style={styles.detailValue}
                    placeholder="DD-MM-YYYY"
                  />
                  <InlineWordInput
                    field="age"
                    value={biodata.age || ''}
                    style={[styles.detailValue, { maxWidth: 80 }]}
                    placeholder="வயது"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {biodata.dateOfBirth || '-'}
                  {biodata.age && biodata.age.trim() ? ` (${biodata.age.includes('வயது') ? biodata.age.trim() : `வயது: ${biodata.age.trim()}`})` : ''}
                  {biodata.timeOfBirth ? ` (${biodata.timeOfBirth} ${biodata.timePeriod || ''})` : ''}
                  {biodata.placeOfBirth ? ` @ ${biodata.placeOfBirth}` : ''}
                </Text>
              )}
            </View>

            {/* 3. Height, Complexion & Food Habit */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {biodata.foodHabit?.trim() ? 'உயரம் & உணவு' : (biodata.complexion ? 'உயரம் & நிறம்' : 'உயரம்')}
              </Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <InlineWordInput
                  field="foodHabit"
                  value={biodata.foodHabit || ''}
                  style={styles.detailValue}
                  placeholder="உணவு / நிறம்"
                />
              ) : (
                <Text style={styles.detailValue}>
                  {[heightText, biodata.complexion?.trim(), biodata.foodHabit?.trim()].filter(Boolean).join(' | ')}
                </Text>
              )}
            </View>

            {/* 4. Caste, Religion, Gothram & Kuladeivam */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>குலம் & கோத்திரம்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, gap: 4 }}>
                  <InlineWordInput
                    field="caste"
                    value={biodata.caste}
                    style={styles.detailValue}
                    placeholder="இனம் / சாதி"
                  />
                  <InlineWordInput
                    field="gothram"
                    value={biodata.gothram}
                    style={styles.detailValue}
                    placeholder="கோத்திரம்"
                  />
                  <InlineWordInput
                    field="kuladeivam"
                    value={biodata.kuladeivam}
                    style={styles.detailValue}
                    placeholder="குலதெய்வம்"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {biodata.religion} {biodata.caste ? `• ${biodata.caste}` : ''}
                  {biodata.gothram ? ` • ${biodata.gothram}` : ''}
                  {biodata.kuladeivam ? ` • குலதெய்வம்: ${biodata.kuladeivam}` : ''}
                </Text>
              )}
            </View>

            {/* 5. Education */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>படிப்பு</Text>
              <Text style={styles.detailColon}>:</Text>
              <InlineWordInput
                field="qualification"
                value={biodata.qualification}
                style={[styles.detailValue, { fontWeight: '800' }]}
                placeholder="கல்வித் தகுதி"
              />
            </View>

            {/* 6. Occupation & Company */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>வேலை விபரம்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, gap: 4 }}>
                  <InlineWordInput
                    field="occupation"
                    value={biodata.occupation}
                    style={[styles.detailValue, { color: theme.primary, fontWeight: '800' }]}
                    placeholder="பதவி / வேலை"
                  />
                  <InlineWordInput
                    field="companyName"
                    value={biodata.companyName}
                    style={styles.detailValue}
                    placeholder="நிறுவனம் / தொழில்"
                  />
                </View>
              ) : (
                <Text style={[styles.detailValue, { color: theme.primary, fontWeight: '800' }]}>
                  {biodata.occupation || '-'}
                  {biodata.companyName ? ` (${biodata.companyName})` : ''}
                  {biodata.workLocation ? ` - ${biodata.workLocation}` : ''}
                </Text>
              )}
            </View>

            {/* 7. Income */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>வருமானம்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <InlineWordInput
                  field="annualIncome"
                  value={biodata.annualIncome}
                  style={[styles.detailValue, { color: '#B45309', fontWeight: '800' }]}
                  placeholder="வருமானம் (எ.கா. 25,000 / மாதம்)"
                />
              ) : (
                biodata.annualIncome ? (
                  <Text style={[styles.detailValue, { color: '#B45309', fontWeight: '800' }]}>
                    ₹ {biodata.annualIncome} / {biodata.incomePeriod === 'yearly' ? 'ஆண்டுக்கு' : 'மாதம்'}
                  </Text>
                ) : (
                  <Text style={styles.detailValue}>-</Text>
                )
              )}
            </View>

            {/* 8. Father Details */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>தந்தை பெயர்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                  <InlineWordInput
                    field="fatherName"
                    value={biodata.fatherName}
                    style={styles.detailValue}
                    placeholder="தந்தை பெயர்"
                  />
                  <InlineWordInput
                    field="fatherOccupation"
                    value={biodata.fatherOccupation}
                    style={styles.detailValue}
                    placeholder="தொழில்"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {biodata.fatherName || '-'} {biodata.fatherOccupation ? `(${biodata.fatherOccupation})` : ''}
                </Text>
              )}
            </View>

            {/* 9. Mother Details */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>தாயார் பெயர்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                  <InlineWordInput
                    field="motherName"
                    value={biodata.motherName}
                    style={styles.detailValue}
                    placeholder="தாயார் பெயர்"
                  />
                  <InlineWordInput
                    field="motherOccupation"
                    value={biodata.motherOccupation}
                    style={styles.detailValue}
                    placeholder="தொழில்"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {biodata.motherName || '-'} {biodata.motherOccupation ? `(${biodata.motherOccupation})` : ''}
                </Text>
              )}
            </View>

            {/* 10. Native Place */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>பூர்வீகம்</Text>
              <Text style={styles.detailColon}>:</Text>
              <InlineWordInput
                field="nativePlace"
                value={biodata.nativePlace}
                style={styles.detailValue}
                placeholder="பூர்வீக ஊர்"
              />
            </View>

            {/* 11. Siblings */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>உடன்பிறந்தவர்கள்</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{siblingsText}</Text>
            </View>

            {/* 12. Property / Assets */}
            {(biodata.showAssets || isWordMode) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>சொத்து விபரம்</Text>
                <Text style={styles.detailColon}>:</Text>
                <InlineWordInput
                  field="assetsDescription"
                  value={biodata.assetsDescription}
                  style={styles.detailValue}
                  placeholder="சொத்து விவரங்கள்"
                />
              </View>
            )}

            {/* 13. Address & Phone */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>முகவரி & செல்</Text>
              <Text style={styles.detailColon}>:</Text>
              {isWordMode ? (
                <View style={{ flex: 1, gap: 4 }}>
                  <InlineWordInput
                    field="residentialAddress"
                    value={biodata.residentialAddress}
                    style={styles.detailValue}
                    placeholder="முகவரி"
                    multiline
                  />
                  <InlineWordInput
                    field="parentsContact"
                    value={biodata.parentsContact}
                    style={styles.detailValue}
                    placeholder="செல் 1"
                  />
                  <InlineWordInput
                    field="contactNumber2"
                    value={biodata.contactNumber2}
                    style={styles.detailValue}
                    placeholder="செல் 2"
                  />
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {biodata.residentialAddress ? `${biodata.residentialAddress}. ` : ''}
                  {biodata.parentsContact ? `செல்: ${biodata.parentsContact}` : ''}
                  {biodata.contactNumber2 ? `, ${biodata.contactNumber2}` : ''}
                </Text>
              )}
            </View>
          </View>

          {/* RIGHT COLUMN: Candidate Photo with Reposition & Zoom Controls */}
          {biodata.photoUri && (
            <View style={[styles.rightPhotoCol, { height: frameH }]}>
              {/* Interactive Photo Floating Controls in Word Mode or Reposition Mode */}
              {(isWordMode || isRepositioningPhoto) && (
                <View style={styles.photoControlBar}>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(Math.min(2.5, parseFloat((zoom + 0.1).toFixed(2))), posX, posY)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="magnify-plus-outline" size={13} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(Math.max(0.5, parseFloat((zoom - 0.1).toFixed(2))), posX, posY)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="magnify-minus-outline" size={13} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(zoom, posX - 8, posY)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="arrow-left" size={12} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(zoom, posX + 8, posY)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="arrow-right" size={12} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(zoom, posX, posY - 8)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="arrow-up" size={12} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(zoom, posX, posY + 8)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="arrow-down" size={12} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onUpdatePhotoTransform && onUpdatePhotoTransform(1.0, 0, 0)}
                    style={styles.photoMiniBtn}
                  >
                    <MaterialCommunityIcons name="refresh" size={12} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}

              <View
                style={[
                  styles.photoFrameHolder,
                  {
                    height: frameH,
                    backgroundColor: getFrameBgColor(),
                    // @ts-ignore
                    backgroundImage: getFrameBgGradient(),
                  },
                  getPhotoShapeStyle(),
                  getFrameBorderStyle(),
                ]}
              >
                <Image
                  source={{ uri: biodata.photoUri }}
                  style={[
                    styles.candidateImage,
                    {
                      transform: [
                        { translateX: posX },
                        { translateY: posY },
                        { scale: zoom },
                        { rotate: `${rotation}deg` },
                      ],
                    },
                  ]}
                  resizeMode={biodata.photoLayout === 'standing_cutout' ? 'contain' : 'cover'}
                />

                {/* Beautification Glow overlay */}
                {(biodata.photoBeautify || 0) > 0 && (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: 'rgba(255, 237, 213, 0.12)' },
                    ]}
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* HOROSCOPE CHARTS SIDE-BY-SIDE */}
        <View style={styles.chartsRow}>
          {renderSouthIndianChart('ராசி கட்டம்', biodata.rasiChart)}
          {renderSouthIndianChart('நவாம்சம் கட்டம்', biodata.navamsamChart)}
        </View>

        {/* BOTTOM HOROSCOPE METRICS BAR */}
        <View style={[styles.bottomAstroBar, { backgroundColor: theme.headerBg, borderColor: theme.accent }]}>
          <Text style={[styles.astroSummaryText, { color: theme.primaryDark }]}>
            {biodata.sunMahadashaYears ? `சூரிய மகாதிசை இருப்பு: ${biodata.sunMahadashaYears} வருடம், ${biodata.sunMahadashaMonths || 0} மாதம், ${biodata.sunMahadashaDays || 0} நாள்  •  ` : ''}
            நட்சத்திரம்: <Text style={{ fontWeight: '800', color: theme.primary }}>{biodata.nakshatram || '-'} {biodata.padham ? `${biodata.padham}-ஆம் பாதம்` : ''}</Text>  •  
            ராசி: <Text style={{ fontWeight: '800', color: theme.primary }}>{biodata.rasi || '-'}</Text>  •  
            லக்னம்: <Text style={{ fontWeight: '800', color: theme.primary }}>{biodata.lagnam || '-'}</Text>
            {biodata.dosham ? `  •  தோஷம்: ${biodata.dosham}` : ''}
          </Text>
        </View>

      </View>
    </View>
    </WordModeContext.Provider>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    borderWidth: 4,
    borderRadius: 8,
    padding: 6,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  innerFrame: {
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -120 }],
    width: 240,
    height: 240,
    opacity: 0.065,
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
  },

  /* Sacred Top Row */
  topSacredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cornerVelText: {
    fontSize: 18,
  },
  centerWorshipCol: {
    alignItems: 'center',
    flex: 1,
  },
  tamilSymbolTop: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  godInvocationText: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0,
    // Fix ஸ்ரீ rendering - use proper unicode settings
    // @ts-ignore
    unicodeBidi: 'plaintext',
    writingDirection: 'ltr',
    fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
  },

  /* Banner */
  bannerContainer: {
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 7,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  inlineWordInputActive: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563EB',
    backgroundColor: 'rgba(239, 246, 255, 0.75)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  photoControlBar: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
  },
  photoMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  /* 2-Column Main Body */
  twoColumnMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  leftDetailsCol: {
    flex: 1.4,
    gap: 3.5,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  candidateBigName: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    lineHeight: 15,
  },
  detailLabel: {
    width: 124,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#374151',
    lineHeight: 16,
  },
  detailColon: {
    width: 12,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6B7280',
  },
  detailValue: {
    flex: 1,
    fontSize: 10.5,
    color: '#1F2937',
    fontWeight: '700',
    lineHeight: 16,
  },

  /* Right Photo Column */
  rightPhotoCol: {
    flex: 1,
    maxWidth: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrameHolder: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateImage: {
    width: '100%',
    height: '100%',
  },

  /* Side-by-side Horoscope Charts */
  chartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 3,
    marginBottom: 6,
  },
  miniChartBox: {
    flex: 1,
    alignItems: 'center',
  },
  miniChartHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  miniChartGrid: {
    width: '100%',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
  },
  miniGridRow: {
    flexDirection: 'row',
    height: 40,
  },
  miniHouseCell: {
    flex: 1,
    borderWidth: 0.5,
    padding: 1.5,
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EA',
    borderRadius: 3,
  },
  miniHouseCellOccupied: {
    backgroundColor: '#FFFDF9',
  },
  miniEmptyPlus: {
    fontSize: 11,
    color: '#D1C7B7',
    fontWeight: '700',
    alignSelf: 'center',
    marginVertical: 'auto',
  },
  miniHouseName: {
    fontSize: 6.8,
    fontWeight: '800',
  },
  miniPlanetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1.5,
  },
  miniPlanetBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 2,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    alignItems: 'center',
  },
  miniPlanetText: {
    fontSize: 7.8,
    fontWeight: '800',
    color: '#78350F',
  },
  miniPlanetSubText: {
    fontSize: 5,
    fontWeight: '600',
    color: '#92400E',
  },
  miniCenterHouse: {
    flex: 2,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  miniCenterOm: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 1,
  },
  miniCenterText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  miniCenterSubText: {
    fontSize: 7.5,
    fontWeight: '700',
  },

  /* Central Deity */
  centralDeityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  sacredAura: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deityTitle: {
    fontSize: 7,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Bottom Astro Bar */
  bottomAstroBar: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  astroSummaryText: {
    fontSize: 8.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
  },
});
