import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BiodataProfile } from '../types/biodata';

interface BorderDesignPanelProps {
  biodata: BiodataProfile;
  onChangeBiodata: <K extends keyof BiodataProfile>(key: K, value: BiodataProfile[K]) => void;
}

type BorderStyle = BiodataProfile['borderElementStyle'];

interface BorderPresetItem {
  id: BorderStyle;
  labelTamil: string;
  labelEng: string;
  icon: string;
}

const BORDER_PRESETS: BorderPresetItem[] = [
  { id: 'none', labelTamil: 'பார்டர் இல்லை', labelEng: 'No Border', icon: 'border-none-variant' },
  { id: 'traditional_vel', labelTamil: 'தங்க பார்டர்', labelEng: 'Gold Traditional', icon: 'crown' },
  { id: 'gold_double', labelTamil: 'கோவில் தோரணம்', labelEng: 'Temple Arch', icon: 'pillar' },
  { id: 'temple_pillar', labelTamil: 'இரட்டைக் கோடு', labelEng: 'Double Line', icon: 'border-all' },
  { id: 'floral_vine', labelTamil: 'வளைந்த மாலைகள்', labelEng: 'Floral Vine', icon: 'flower-outline' },
  { id: 'royal_filigree', labelTamil: 'ராஜ அலங்காரம்', labelEng: 'Royal Filigree', icon: 'flare' },
  { id: 'gopuram_arch', labelTamil: 'கோபுர வளைவு', labelEng: 'Gopuram Arch', icon: 'temple-hindu' },
  { id: 'kolam_corners', labelTamil: 'கோல மூலைகள்', labelEng: 'Rangoli Corners', icon: 'dots-grid' },
  { id: 'lotus_petals', labelTamil: 'தாமரை இதழ்', labelEng: 'Lotus Petals', icon: 'spa' },
  { id: 'modern_art_deco', labelTamil: 'நவீன ஆர்ட் டெக்கோ', labelEng: 'Art Deco', icon: 'hexagon-outline' },
  { id: 'peacock_feather', labelTamil: 'மயில் தோகை', labelEng: 'Peacock Feather', icon: 'feather' },
  { id: 'divine_arch', labelTamil: 'தெய்வீக வளைவு', labelEng: 'Divine Arch', icon: 'arch' },
  { id: 'royal_mandala', labelTamil: 'ராஜ மண்டலம்', labelEng: 'Royal Mandala', icon: 'star-circle-outline' },
  { id: 'vintage_scroll', labelTamil: 'பாரம்பர்ய சுருள்', labelEng: 'Vintage Scroll', icon: 'script-text-outline' },
];

const COLOR_SWATCHES = [
  '#B91C1C', '#991B1B', '#D97706', '#B45309',
  '#854D0E', '#7C3AED', '#6B21A8', '#1D4ED8',
  '#0E7490', '#065F46', '#166534', '#831843',
  '#9D174D', '#374151', '#0F172A', '#1E3A5F',
];

function StepSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onValueChange,
  color = '#991B1B',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onValueChange: (v: number) => void;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <View style={sliderSt.row}>
      <View style={sliderSt.labelRow}>
        <Text style={sliderSt.label}>{label}</Text>
        <Text style={[sliderSt.val, { color }]}>{value}{unit}</Text>
      </View>
      <View style={sliderSt.controls}>
        <TouchableOpacity
          onPress={() => onValueChange(Math.max(min, parseFloat((value - step).toFixed(2))))}
          style={sliderSt.btn}
        >
          <MaterialCommunityIcons name="minus" size={13} color="#374151" />
        </TouchableOpacity>
        <View style={sliderSt.track}>
          <View style={[sliderSt.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
        </View>
        <TouchableOpacity
          onPress={() => onValueChange(Math.min(max, parseFloat((value + step).toFixed(2))))}
          style={sliderSt.btn}
        >
          <MaterialCommunityIcons name="plus" size={13} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sliderSt = StyleSheet.create({
  row: { marginBottom: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 11.5, fontWeight: '600', color: '#374151' },
  val: { fontSize: 12, fontWeight: '800' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

export const BorderDesignPanel: React.FC<BorderDesignPanelProps> = ({ biodata, onChangeBiodata }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hexInput, setHexInput] = useState(biodata.borderColor || '#B91C1C');

  const selected = biodata.borderElementStyle || 'traditional_vel';
  const borderColor = biodata.borderColor || '#B91C1C';
  const strokeWidth = biodata.borderStrokeWidth ?? 3.5;
  const opacity = biodata.borderOpacity ?? 100;
  const gradientEnabled = biodata.borderGradientEnabled ?? true;

  const opacityHex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="border-outside" size={20} color="#B45309" />
        <Text style={styles.title}>பார்டர் அலங்கார வடிவமைப்பு (Border Filigree)</Text>
      </View>
      <Text style={styles.subText}>
        ஆவணத்தைச் சுற்றி அழகான பாரம்பரிய / நவீன வேலைப்பாடுகளைத் தேர்வு செய்யவும்
      </Text>

      {/* Style Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
        {BORDER_PRESETS.map((preset) => {
          const isActive = selected === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onChangeBiodata('borderElementStyle', preset.id)}
              style={[
                styles.chip,
                isActive && { backgroundColor: borderColor, borderColor },
              ]}
            >
              <MaterialCommunityIcons
                name={preset.icon as any}
                size={14}
                color={isActive ? '#FFFFFF' : '#78350F'}
              />
              <View>
                <Text style={[styles.chipTamil, isActive && styles.chipTxtActive]}>
                  {preset.labelTamil}
                </Text>
                <Text style={[styles.chipEng, isActive && { color: 'rgba(255,255,255,0.72)' }]}>
                  {preset.labelEng}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      {/* Color Selector */}
      <Text style={styles.sectionLabel}>🎨 நிற தேர்வு (Border Color):</Text>
      <View style={styles.colorRow}>
        {COLOR_SWATCHES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => { onChangeBiodata('borderColor', c); setHexInput(c); }}
            style={[styles.swatch, { backgroundColor: c }, borderColor === c && styles.swatchActive]}
          />
        ))}
        <TouchableOpacity
          onPress={() => setShowColorPicker(!showColorPicker)}
          style={[styles.swatch, styles.pickerBtn, { borderColor }]}
        >
          <MaterialCommunityIcons name="eyedropper" size={13} color={borderColor} />
        </TouchableOpacity>
      </View>

      {showColorPicker && (
        <View style={styles.hexBox}>
          <Text style={styles.hexLabel}>HEX குறியீடு (#RRGGBB):</Text>
          <View style={styles.hexRow}>
            <View style={[styles.hexPreview, { backgroundColor: hexInput }]} />
            <TextInput
              style={styles.hexInput}
              value={hexInput}
              onChangeText={(t) => {
                setHexInput(t);
                if (/^#[0-9A-Fa-f]{6}$/.test(t)) onChangeBiodata('borderColor', t);
              }}
              placeholder="#B91C1C"
              maxLength={7}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={() => { if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) onChangeBiodata('borderColor', hexInput); }}
              style={styles.hexApplyBtn}
            >
              <Text style={styles.hexApplyText}>சரி ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Stroke & Opacity */}
      <Text style={styles.sectionLabel}>📏 கோட்டின் தடிமன் (Stroke Width):</Text>
      <StepSlider label="Stroke" value={strokeWidth} min={0.5} max={8} step={0.5} unit="px"
        onValueChange={(v) => onChangeBiodata('borderStrokeWidth', v)} color={borderColor} />

      <Text style={styles.sectionLabel}>🌫️ ஒளிபுகுந்தன் (Opacity):</Text>
      <StepSlider label="Opacity" value={opacity} min={10} max={100} step={5} unit="%"
        onValueChange={(v) => onChangeBiodata('borderOpacity', v)} color={borderColor} />

      <View style={styles.divider} />

      {/* Auto Gradient Toggle */}
      <TouchableOpacity
        onPress={() => onChangeBiodata('borderGradientEnabled', !gradientEnabled)}
        style={styles.toggleRow}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <MaterialCommunityIcons name="auto-fix" size={18} color={gradientEnabled ? borderColor : '#6B7280'} />
          <View>
            <Text style={styles.toggleTitle}>பின்னணி தேய்வு (Auto Paper Blend)</Text>
            <Text style={styles.toggleSub}>தாள் நிறத்துடன் தேய்ந்து இயல்பாகக் கலக்கும்</Text>
          </View>
        </View>
        <View style={[styles.sw, gradientEnabled && { backgroundColor: borderColor }]}>
          <View style={[styles.swKnob, gradientEnabled && styles.swKnobOn]} />
        </View>
      </TouchableOpacity>

      {/* Live Preview */}
      {selected !== 'none' && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewTitle}>முன்னோட்டம்:</Text>
          <View style={[
            styles.previewOuter,
            { borderColor: `${borderColor}${opacityHex}`, borderWidth: Math.min(strokeWidth, 6) }
          ]}>
            <View style={[
              styles.previewInner,
              { borderColor: `${borderColor}66`, borderWidth: Math.max(1, strokeWidth - 1.5) }
            ]}>
              <Text style={[styles.previewGodText, { color: borderColor }]}>
                || ஸ்ரீ குலதெய்வம் துணை ||
              </Text>
              <Text style={styles.previewSubText}>சுப வரன் திருமண விபரம்</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 13.5, fontWeight: '700', color: '#92400E', flex: 1 },
  subText: { fontSize: 11, color: '#78350F', marginBottom: 10 },
  chipsScroll: { flexDirection: 'row', gap: 7, paddingVertical: 4, paddingBottom: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  chipTamil: { fontSize: 11, fontWeight: '700', color: '#78350F', lineHeight: 14 },
  chipEng: { fontSize: 9, fontWeight: '500', color: '#92400E', lineHeight: 12 },
  chipTxtActive: { color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: '#FDE68A', marginVertical: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#78350F', marginBottom: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#1F2937', borderWidth: 2.5, elevation: 3 },
  pickerBtn: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  hexLabel: { fontSize: 11, fontWeight: '600', color: '#78350F', marginBottom: 6 },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hexPreview: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  hexInput: {
    flex: 1, height: 36, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 10, fontSize: 13, fontWeight: '700',
    backgroundColor: '#F9FAFB', color: '#1F2937', letterSpacing: 1,
  },
  hexApplyBtn: {
    backgroundColor: '#991B1B', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  hexApplyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 4,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleTitle: { fontSize: 12, fontWeight: '700', color: '#374151' },
  toggleSub: { fontSize: 10, color: '#6B7280', marginTop: 1 },
  sw: {
    width: 40, height: 22, borderRadius: 11,
    backgroundColor: '#D1D5DB', padding: 2, justifyContent: 'center',
  },
  swKnob: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  swKnobOn: { alignSelf: 'flex-end' },
  previewWrap: { marginTop: 12 },
  previewTitle: { fontSize: 11, fontWeight: '600', color: '#78350F', marginBottom: 6 },
  previewOuter: { borderRadius: 6, padding: 5 },
  previewInner: {
    borderRadius: 4, borderStyle: 'dashed',
    padding: 10, alignItems: 'center',
  },
  previewGodText: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  previewSubText: { fontSize: 9, color: '#6B7280', marginTop: 3 },
});
