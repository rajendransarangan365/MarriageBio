import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageService } from '../../database/storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onRefreshProfiles: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onRefreshProfiles,
}) => {
  const [backupJson, setBackupJson] = useState('');
  const [showJsonBox, setShowJsonBox] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleExportBackup = async () => {
    try {
      const json = await StorageService.exportBackup();
      setBackupJson(json);
      setShowJsonBox(true);
      setStatusMsg('காப்புநகல் JSON உருவாக்கப்பட்டது. கீழே உள்ள உரையை நகலெடுக்கலாம்.');
    } catch (e: any) {
      Alert.alert('பிழை', 'காப்புநகல் எடுப்பதில் சிக்கல் ஏற்பட்டது.');
    }
  };

  const handleImportBackup = async () => {
    if (!backupJson.trim()) {
      Alert.alert('எச்சரிக்கை', 'மீட்டமைக்க வேண்டிய JSON உரையை உள்ளிடவும்.');
      return;
    }
    const result = await StorageService.importBackup(backupJson);
    setStatusMsg(result.message);
    if (result.success) {
      onRefreshProfiles();
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="cog" size={22} color="#991B1B" />
              <Text style={styles.modalTitle}>அமைப்புகள் & காப்புநகல்</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Offline Privacy Note */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#15803D" />
              <Text style={styles.infoText}>
                உங்கள் அனைத்து வரன் விவரங்களும் உங்கள் சாதனத்திலேயே பாதுகாப்பாக சேமிக்கப்படுகின்றன (100% Offline & Private).
              </Text>
            </View>

            {/* Backup & Restore Section */}
            <Text style={styles.sectionHeading}>தரவு காப்புநகல் & மீட்டமைப்பு (Backup & Restore)</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleExportBackup} style={styles.backupBtn}>
                <MaterialCommunityIcons name="download" size={16} color="#FFFFFF" />
                <Text style={styles.backupBtnText}>காப்புநகல் எடு (Export)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowJsonBox(true);
                  setBackupJson('');
                  setStatusMsg('மீட்டமைக்க வேண்டிய JSON உரையை கீழே ஒட்டவும்.');
                }}
                style={styles.restoreBtn}
              >
                <MaterialCommunityIcons name="upload" size={16} color="#991B1B" />
                <Text style={styles.restoreBtnText}>மீட்டமை (Import)</Text>
              </TouchableOpacity>
            </View>

            {statusMsg ? (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{statusMsg}</Text>
              </View>
            ) : null}

            {showJsonBox && (
              <View style={styles.jsonBoxContainer}>
                <Text style={styles.jsonBoxLabel}>JSON தரவு உரை:</Text>
                <TextInput
                  style={styles.jsonInput}
                  multiline
                  numberOfLines={6}
                  value={backupJson}
                  onChangeText={setBackupJson}
                  placeholder="காப்புநகல் JSON உரையை இங்கே ஒட்டவும்..."
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={handleImportBackup} style={styles.applyImportBtn}>
                  <Text style={styles.applyImportBtnText}>சுயவிவரங்களை மீட்டமைக்க (Confirm Import)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* App Info */}
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>மணமக்கள் ஜாதகம் - பதிப்பு 1.0.0</Text>
              <Text style={styles.aboutText}>
                தமிழ் பாரம்பரிய திருமணம் மற்றும் ஜாதகக் கட்ட தயாரிப்பாளர்.{'\n'}
                React Native & Expo மூலம் உருவாக்கப்பட்டது.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalBody: {
    paddingVertical: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  infoText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  backupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingVertical: 10,
    borderRadius: 8,
  },
  backupBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 10,
    borderRadius: 8,
  },
  restoreBtnText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#FEFCE8',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF08A',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 11,
    color: '#854D0E',
    fontWeight: '600',
  },
  jsonBoxContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  jsonBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 4,
  },
  jsonInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    fontSize: 11,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  applyImportBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  applyImportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aboutCard: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  aboutText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
  },
});
