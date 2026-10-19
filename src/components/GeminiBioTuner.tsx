import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BiodataState } from '../types/biodata';
import { polishBioWithGemini } from '../services/geminiService';
import { VoiceInputButton } from './VoiceInputButton';

interface GeminiBioTunerProps {
  biodata: BiodataState;
  onApplyBio: (field: 'aboutCandidate' | 'partnerExpectations', text: string) => void;
}

export const GeminiBioTuner: React.FC<GeminiBioTunerProps> = ({
  biodata,
  onApplyBio,
}) => {
  const [selectedField, setSelectedField] = useState<'aboutCandidate' | 'partnerExpectations'>('aboutCandidate');
  const [tone, setTone] = useState<'traditional' | 'modern' | 'bilingual'>('traditional');
  const [rawInput, setRawInput] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAppliedSuccess(false);
    try {
      const polished = await polishBioWithGemini({
        apiKey: geminiApiKey,
        tone,
        rawInput: rawInput.trim() || 'அன்பான பாரம்பரிய குடும்பப் பின்னணி, நல்லொழுக்கம் கொண்ட நபர்.',
        field: selectedField,
        biodata,
      });
      setGeneratedResult(polished);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedResult) {
      onApplyBio(selectedField, generatedResult);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2500);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="creation" size={24} color="#7C3AED" />
        <View style={styles.headerTextCol}>
          <Text style={styles.cardTitle}>Gemini AI - சுயவிவர மெருகேற்றல்</Text>
          <Text style={styles.cardSubtitle}>
            உங்கள் குறிப்புகளை கலாச்சார விழுமியங்களுடன் கூடிய நேர்த்தியான வரன் விபரமாக மாற்றவும்
          </Text>
        </View>
      </View>

      {/* Target Field Switcher */}
      <View style={styles.targetFieldRow}>
        <TouchableOpacity
          onPress={() => {
            setSelectedField('aboutCandidate');
            setGeneratedResult(null);
          }}
          style={[
            styles.targetBtn,
            selectedField === 'aboutCandidate' && styles.targetBtnActive,
          ]}
        >
          <MaterialCommunityIcons
            name="account-details"
            size={16}
            color={selectedField === 'aboutCandidate' ? '#7C3AED' : '#6B7280'}
          />
          <Text
            style={[
              styles.targetBtnText,
              selectedField === 'aboutCandidate' && styles.targetBtnTextActive,
            ]}
          >
            சுயவிவரக் குறிப்பு (About Candidate)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedField('partnerExpectations');
            setGeneratedResult(null);
          }}
          style={[
            styles.targetBtn,
            selectedField === 'partnerExpectations' && styles.targetBtnActive,
          ]}
        >
          <MaterialCommunityIcons
            name="heart-outline"
            size={16}
            color={selectedField === 'partnerExpectations' ? '#7C3AED' : '#6B7280'}
          />
          <Text
            style={[
              styles.targetBtnText,
              selectedField === 'partnerExpectations' && styles.targetBtnTextActive,
            ]}
          >
            எதிர்பார்ப்புகள் (Expectations)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tone Selection */}
      <Text style={styles.sectionLabel}>நடை / முறை (Writing Tone):</Text>
      <View style={styles.toneRow}>
        <TouchableOpacity
          onPress={() => setTone('traditional')}
          style={[styles.toneChip, tone === 'traditional' && styles.toneChipActive]}
        >
          <Text
            style={[
              styles.toneChipText,
              tone === 'traditional' && styles.toneChipTextActive,
            ]}
          >
            மரபுசார் தூய தமிழ்
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTone('modern')}
          style={[styles.toneChip, tone === 'modern' && styles.toneChipActive]}
        >
          <Text
            style={[
              styles.toneChipText,
              tone === 'modern' && styles.toneChipTextActive,
            ]}
          >
            சமகால தமிழ்
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTone('bilingual')}
          style={[styles.toneChip, tone === 'bilingual' && styles.toneChipActive]}
        >
          <Text
            style={[
              styles.toneChipText,
              tone === 'bilingual' && styles.toneChipTextActive,
            ]}
          >
            தமிழ் + English
          </Text>
        </TouchableOpacity>
      </View>

      {/* Raw Input Box with Tamil Voice Typing */}
      <Text style={styles.sectionLabel}>உங்கள் சுருக்கமான குறிப்புகள் அல்லது குரல் வழி:</Text>
      <View style={styles.inputAreaWrapper}>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={3}
          value={rawInput}
          onChangeText={setRawInput}
          placeholder="எ.கா: படித்துவிட்டு சென்னையில் நல்ல நிறுவனத்தில் வேலை செய்கிறார். குடும்பத்தை நேசிக்கும் நபர்..."
          placeholderTextColor="#9CA3AF"
        />
        <View style={styles.voiceToolbar}>
          <VoiceInputButton
            onTranscript={(txt) => setRawInput((prev) => (prev ? `${prev} ${txt}` : txt))}
            label="தமிழில் பேசி உள்ளிடவும்"
          />
        </View>
      </View>

      {/* Optional Gemini API Key Toggle */}
      <TouchableOpacity
        onPress={() => setShowApiKeyInput(!showApiKeyInput)}
        style={styles.apiToggle}
      >
        <MaterialCommunityIcons name="key-variant" size={16} color="#6B7280" />
        <Text style={styles.apiToggleText}>
          {showApiKeyInput ? 'API Key அமைப்பை மறை' : 'சொந்த Gemini API Key பயன்படுத்த (விருப்பம்)'}
        </Text>
      </TouchableOpacity>

      {showApiKeyInput && (
        <View style={styles.apiKeyBox}>
          <TextInput
            style={styles.apiKeyInput}
            value={geminiApiKey}
            onChangeText={setGeminiApiKey}
            placeholder="Google Gemini API Key ஒட்டவும் (AI Studio)"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
          <Text style={styles.apiKeyHint}>
            குறிப்பு: API Key இல்லையென்றாலும் உள்ளமைக்கப்பட்ட உயர்தர AI மாதிரி இயங்கும்.
          </Text>
        </View>
      )}

      {/* Generate Action Button */}
      <TouchableOpacity
        onPress={handleGenerate}
        disabled={isGenerating}
        style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <MaterialCommunityIcons name="auto-fix" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.generateBtnText}>
          {isGenerating ? 'Gemini AI மெருகேற்றுகிறது...' : 'AI மூலம் மெருகேற்று (Fine-tune with Gemini)'}
        </Text>
      </TouchableOpacity>

      {/* Polished Result Preview */}
      {generatedResult && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="check-decagram" size={18} color="#059669" />
            <Text style={styles.resultTitle}>Gemini AI மெருகேற்றிய உரை:</Text>
          </View>
          <Text style={styles.resultContent}>{generatedResult}</Text>

          <View style={styles.resultActionRow}>
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.applyBtn, appliedSuccess && styles.applyBtnSuccess]}
            >
              <MaterialCommunityIcons
                name={appliedSuccess ? 'check-bold' : 'arrow-down-bold-circle-outline'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.applyBtnText}>
                {appliedSuccess ? 'விபரத்தில் சேர்க்கப்பட்டது!' : 'விபரத்தில் சேர் (Apply to Bio)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGenerate} style={styles.retryBtn}>
              <MaterialCommunityIcons name="refresh" size={18} color="#4B5563" />
              <Text style={styles.retryBtnText}>மறுமுறை உருவாக்கு</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    shadowColor: '#581C87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B21A8',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7E22CE',
    marginTop: 2,
  },
  targetFieldRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  targetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  targetBtnActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  targetBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  targetBtnTextActive: {
    color: '#6B21A8',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  toneRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  toneChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  toneChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#6B21A8',
  },
  toneChipText: {
    fontSize: 11,
    color: '#6B21A8',
    fontWeight: '600',
  },
  toneChipTextActive: {
    color: '#FFFFFF',
  },
  inputAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8B4FE',
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 65,
    fontSize: 13,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  voiceToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
    paddingTop: 6,
    alignItems: 'flex-start',
  },
  apiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 8,
  },
  apiToggleText: {
    fontSize: 11,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  apiKeyBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  apiKeyInput: {
    height: 38,
    fontSize: 12,
    color: '#1F2937',
  },
  apiKeyHint: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateBtnDisabled: {
    backgroundColor: '#A78BFA',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  resultContent: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
  },
  applyBtnSuccess: {
    backgroundColor: '#047857',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  retryBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
});
