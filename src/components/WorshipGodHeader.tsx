import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VoiceInputButton } from './VoiceInputButton';

interface WorshipGodHeaderProps {
  godInvocation: string;
  customGodInvocation: string;
  headerSymbol: 'pillaiyar_suzhi' | 'om' | 'kalasam' | 'vilakku';
  onUpdateInvocation: (value: string) => void;
  onUpdateCustomInvocation: (value: string) => void;
  onUpdateSymbol: (symbol: 'pillaiyar_suzhi' | 'om' | 'kalasam' | 'vilakku') => void;
}

const PRESET_INVOCATIONS = [
  '|| ஸ்ரீ விநாயகர் துணை ||',
  '|| சிவமயம் ||',
  '|| ஸ்ரீ முருகப் பெருமான் துணை ||',
  '|| ஓம் சக்தி ||',
  '|| ஸ்ரீ பெருமாள் துணை ||',
  '|| ஸ்ரீ வெங்கடேசாய நமஹ ||',
  '|| ஸ்ரீ ஆஞ்சநேயர் துணை ||',
  'தனிப்பயன் குலதெய்வம் (Custom)',
];

export const WorshipGodHeader: React.FC<WorshipGodHeaderProps> = ({
  godInvocation,
  customGodInvocation,
  headerSymbol,
  onUpdateInvocation,
  onUpdateCustomInvocation,
  onUpdateSymbol,
}) => {
  const isCustom = godInvocation === 'தனிப்பயன் குலதெய்வம் (Custom)';

  return (
    <View style={styles.card}>
      <View style={styles.headerTitleRow}>
        <MaterialCommunityIcons name="hands-pray" size={22} color="#B45309" />
        <Text style={styles.titleText}>தெய்வ வணக்கம் / தலைப்புத் துதி</Text>
      </View>
      <Text style={styles.subText}>
        சுப விபரம் தொடங்கும் முன் தலைப்பில் இடம்பெற வேண்டிய தெய்வப் பெயரைத் தேர்ந்தெடுக்கவும்
      </Text>

      {/* Preset Invocations Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {PRESET_INVOCATIONS.map((item) => {
          const selected = godInvocation === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onUpdateInvocation(item)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <MaterialCommunityIcons
                name={selected ? 'check-circle' : 'circle-outline'}
                size={14}
                color={selected ? '#FFFFFF' : '#78350F'}
              />
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Custom God / Kuladeivam Input */}
      {isCustom && (
        <View style={styles.customBox}>
          <Text style={styles.fieldLabel}>குலதெய்வம் அல்லது இஷ்டதெய்வம் பெயர்:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={customGodInvocation}
              onChangeText={onUpdateCustomInvocation}
              placeholder="எ.கா: || ஸ்ரீ அங்காள பரமேஸ்வரி துணை ||"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <VoiceInputButton
            onTranscript={(txt) => {
              const formatted = `|| ${txt.trim()} துணை ||`;
              onUpdateCustomInvocation(formatted);
            }}
            label="தெய்வப் பெயரை தமிழில் கூறவும்"
          />
        </View>
      )}

      {/* Auspicious Symbol Selector */}
      <View style={styles.symbolSection}>
        <Text style={styles.fieldLabel}>தலைப்பு மங்கள சின்னம் (Auspicious Symbol):</Text>
        <View style={styles.symbolRow}>
          <TouchableOpacity
            onPress={() => onUpdateSymbol('pillaiyar_suzhi')}
            style={[
              styles.symbolBtn,
              headerSymbol === 'pillaiyar_suzhi' && styles.symbolBtnActive,
            ]}
          >
            <Text style={styles.tamilSymbol}>உ</Text>
            <Text style={styles.symbolLabel}>பிள்ளையார் சுழி</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onUpdateSymbol('om')}
            style={[
              styles.symbolBtn,
              headerSymbol === 'om' && styles.symbolBtnActive,
            ]}
          >
            <Text style={styles.tamilSymbol}>ௐ</Text>
            <Text style={styles.symbolLabel}>ஓம்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onUpdateSymbol('kalasam')}
            style={[
              styles.symbolBtn,
              headerSymbol === 'kalasam' && styles.symbolBtnActive,
            ]}
          >
            <MaterialCommunityIcons name="spa" size={20} color="#B45309" />
            <Text style={styles.symbolLabel}>கலசம்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onUpdateSymbol('vilakku')}
            style={[
              styles.symbolBtn,
              headerSymbol === 'vilakku' && styles.symbolBtnActive,
            ]}
          >
            <MaterialCommunityIcons name="fire" size={20} color="#D97706" />
            <Text style={styles.symbolLabel}>விளக்கு</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  subText: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  chipSelected: {
    backgroundColor: '#B45309',
    borderColor: '#92400E',
  },
  chipText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  customBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1F2937',
  },
  symbolSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: 12,
  },
  symbolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  symbolBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  symbolBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#B45309',
    borderWidth: 1.5,
  },
  tamilSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
  },
  symbolLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
});
