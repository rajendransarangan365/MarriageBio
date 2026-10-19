import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { speechManager } from '../utils/speechToText';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  label?: string;
  size?: 'small' | 'medium';
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  label = 'தமிழ் குரல் உள்ளீடு',
  size = 'small',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleListening = () => {
    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
      setStatusMessage(null);
    } else {
      setStatusMessage('பேசுங்கள்... (Speak now in Tamil)');
      const started = speechManager.startListening(
        (transcript, isFinal) => {
          if (transcript) {
            onTranscript(transcript);
          }
          if (isFinal) {
            setStatusMessage('பதிவானது!');
            setTimeout(() => setStatusMessage(null), 1500);
          }
        },
        (listening, error) => {
          setIsListening(listening);
          if (error) {
            setStatusMessage(error);
            setTimeout(() => setStatusMessage(null), 3000);
          }
        }
      );

      if (!started) {
        setIsListening(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleListening}
        activeOpacity={0.7}
        style={[
          styles.button,
          size === 'small' ? styles.btnSmall : styles.btnMedium,
          isListening ? styles.btnListening : styles.btnIdle,
        ]}
      >
        <MaterialCommunityIcons
          name={isListening ? 'microphone' : 'microphone-outline'}
          size={size === 'small' ? 16 : 20}
          color={isListening ? '#FFFFFF' : '#991B1B'}
        />
        {label ? (
          <Text
            style={[
              styles.btnText,
              size === 'small' ? styles.textSmall : styles.textMedium,
              isListening ? styles.textListening : styles.textIdle,
            ]}
          >
            {isListening ? 'கேட்கிறது...' : label}
          </Text>
        ) : null}
      </TouchableOpacity>

      {statusMessage ? (
        <View style={styles.tooltip}>
          <MaterialCommunityIcons
            name={isListening ? 'waveform' : 'information-outline'}
            size={14}
            color="#991B1B"
          />
          <Text style={styles.tooltipText}>{statusMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  btnSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  btnMedium: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  btnIdle: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  btnListening: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  btnText: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textIdle: {
    color: '#991B1B',
  },
  textListening: {
    color: '#FFFFFF',
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tooltipText: {
    fontSize: 11,
    color: '#C2410C',
    fontWeight: '500',
  },
});
