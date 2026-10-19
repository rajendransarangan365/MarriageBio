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
  Platform,
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
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [readyDownload, setReadyDownload] = useState<{ url: string; filename: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Export Full Clone with Images (.vclone)
  const handleExportVClone = async () => {
    setIsProcessing(true);
    setStatusMsg({ text: 'முழுமையான .vclone காப்புநகல் தயாரிக்கப்படுகிறது...' });
    try {
      const res = await StorageService.downloadBackup(true, 'vclone');
      if (res.success) {
        setStatusMsg({ text: `✅ ${res.message}` });
        if (res.url) {
          setReadyDownload({ url: res.url, filename: res.filename });
        }
      } else {
        setStatusMsg({ text: `❌ ${res.message}`, isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ காப்புநகல் பிழை: ${err.message}`, isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Export Data Only (.json)
  const handleExportDataOnly = async () => {
    setIsProcessing(true);
    setStatusMsg({ text: 'தரவு மட்டும் (.json) காப்புநகல் தயாரிக்கப்படுகிறது...' });
    try {
      const res = await StorageService.downloadBackup(false, 'json');
      if (res.success) {
        setStatusMsg({ text: `✅ ${res.message}` });
        if (res.url) {
          setReadyDownload({ url: res.url, filename: res.filename });
        }
      } else {
        setStatusMsg({ text: `❌ ${res.message}`, isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ காப்புநகல் பிழை: ${err.message}`, isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Upload & Import .vclone or .json File
  const handleFileImport = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.vclone,.json,application/json,application/octet-stream,text/plain,*/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setStatusMsg({ text: `கோப்பு "${file.name}" படிக்கப்படுகிறது...` });

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            if (!content) {
              setStatusMsg({ text: '❌ கோப்பில் தகவல்கள் இல்லை.', isError: true });
              setIsProcessing(false);
              return;
            }

            const result = await StorageService.importBackup(content);
            if (result.success) {
              setStatusMsg({ text: `🎉 ${result.message}` });
              onRefreshProfiles();
              setTimeout(() => {
                onClose();
              }, 2000);
            } else {
              setStatusMsg({ text: `❌ ${result.message}`, isError: true });
            }
          } catch (err: any) {
            setStatusMsg({ text: `❌ கோப்பை வாசிப்பதில் பிழை: ${err.message}`, isError: true });
          } finally {
            setIsProcessing(false);
          }
        };

        reader.onerror = () => {
          setStatusMsg({ text: '❌ கோப்பை வாசிக்க முடியவில்லை.', isError: true });
          setIsProcessing(false);
        };

        reader.readAsText(file);
      };

      input.click();
    } else {
      setShowJsonBox(true);
      setStatusMsg({ text: 'கீழே உள்ள உரைப்பெட்டியில் JSON உரையை ஒட்டி மீட்டமைக்கவும்.' });
    }
  };

  // 4. Manual Textarea Import Fallback
  const handleManualImport = async () => {
    if (!backupJson.trim()) {
      Alert.alert('எச்சரிக்கை', 'மீட்டமைக்க வேண்டிய .vclone அல்லது JSON உரையை உள்ளிடவும்.');
      return;
    }
    setIsProcessing(true);
    const result = await StorageService.importBackup(backupJson);
    if (result.success) {
      setStatusMsg({ text: `🎉 ${result.message}` });
      onRefreshProfiles();
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setStatusMsg({ text: `❌ ${result.message}`, isError: true });
    }
    setIsProcessing(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="cog" size={22} color="#991B1B" />
              <Text style={styles.modalTitle}>அமைப்புகள் &amp; காப்புநகல் (Backup &amp; Clone)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Offline Privacy Note */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#15803D" />
              <Text style={styles.infoText}>
                உங்கள் அனைத்து வரன் விவரங்களும் மற்றும் படங்களும் உங்கள் சாதனத்திலேயே 100% பாதுகாப்பாக சேமிக்கப்படுகின்றன.
              </Text>
            </View>

            {/* Status Message */}
            {statusMsg ? (
              <View style={[styles.statusBox, statusMsg.isError && styles.statusBoxError]}>
                <Text style={[styles.statusText, statusMsg.isError && styles.statusTextError]}>
                  {statusMsg.text}
                </Text>
              </View>
            ) : null}

            {/* Direct Instant Download Action (Guarantee for Android Chrome & PC) */}
            {readyDownload && (
              <View style={styles.directDownloadCard}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.directDownloadTitle}>பதிவிறக்கத் தயார் (Ready to Save):</Text>
                  <Text style={styles.directDownloadFileName} numberOfLines={1}>
                    {readyDownload.filename}
                  </Text>
                </View>
                {Platform.OS === 'web' && (
                  <a
                    href={readyDownload.url}
                    download={readyDownload.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#15803D',
                      color: '#FFFFFF',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    📥 பதிவிறக்கு (Download)
                  </a>
                )}
              </View>
            )}

            {/* EXPORT SECTION */}
            <Text style={styles.sectionHeading}>
              தரவு ஏற்றுமதி &amp; பதிவிறக்கம் (Export &amp; Download)
            </Text>

            <View style={styles.exportCardsContainer}>
              {/* Option 1: .vclone with images */}
              <TouchableOpacity
                onPress={handleExportVClone}
                disabled={isProcessing}
                style={styles.vcloneCard}
                activeOpacity={0.8}
              >
                <View style={styles.exportIconBox}>
                  <MaterialCommunityIcons name="cloud-download" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.vcloneTitle}>முழுமையான காப்புநகல் (.vclone)</Text>
                    <View style={styles.badgeRecommended}>
                      <Text style={styles.badgeRecommendedText}>பரிந்துரை</Text>
                    </View>
                  </View>
                  <Text style={styles.vcloneSub}>
                    மணமக்கள் புகைப்படங்கள், ஸ்டுடியோ மாற்றங்கள் மற்றும் ஜாதகம் உட்பட அனைத்தும் ஒரே கோப்பாக பதிவிறக்கப்படும்.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: .json data only */}
              <TouchableOpacity
                onPress={handleExportDataOnly}
                disabled={isProcessing}
                style={styles.jsonCard}
                activeOpacity={0.8}
              >
                <View style={styles.jsonIconBox}>
                  <MaterialCommunityIcons name="file-document-outline" size={22} color="#78350F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jsonCardTitle}>தரவு மட்டும் (.json கோப்பு)</Text>
                  <Text style={styles.jsonCardSub}>
                    புகைப்படங்கள் இன்றி வெறும் எழுத்து விவரங்கள் மற்றும் ஜாதகம் மட்டும் சிறிய கோப்பாக பதிவிறக்கப்படும்.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* IMPORT SECTION */}
            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
              தரவு மீட்டமைப்பு (Import / Restore)
            </Text>

            {/* Primary File Upload Button */}
            <TouchableOpacity
              onPress={handleFileImport}
              disabled={isProcessing}
              style={styles.uploadImportBtn}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="file-upload" size={22} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadImportBtnText}>
                  கோப்பைத் தேர்ந்தெடுத்து மீட்டமை (Upload .vclone / .json)
                </Text>
                <Text style={styles.uploadImportBtnSub}>
                  முன்பு சேமித்த .vclone அல்லது .json கோப்பைத் தேர்ந்தெடுக்கவும்
                </Text>
              </View>
            </TouchableOpacity>

            {/* Manual Textbox Toggle */}
            <TouchableOpacity
              onPress={() => setShowJsonBox(!showJsonBox)}
              style={styles.toggleJsonBtn}
            >
              <MaterialCommunityIcons
                name={showJsonBox ? 'chevron-up' : 'code-json'}
                size={16}
                color="#6B7280"
              />
              <Text style={styles.toggleJsonBtnText}>
                {showJsonBox ? 'உரைப்பெட்டியை மறைக்க' : 'அல்லது உரையை நேரடியாக ஒட்டி மீட்டமைக்க (Paste JSON)'}
              </Text>
            </TouchableOpacity>

            {showJsonBox && (
              <View style={styles.jsonBoxContainer}>
                <Text style={styles.jsonBoxLabel}>.vclone / .json உரை:</Text>
                <TextInput
                  style={styles.jsonInput}
                  multiline
                  numberOfLines={5}
                  value={backupJson}
                  onChangeText={setBackupJson}
                  placeholder=".vclone அல்லது JSON உரையை இங்கே ஒட்டவும்..."
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={handleManualImport}
                  disabled={isProcessing}
                  style={styles.applyImportBtn}
                >
                  <Text style={styles.applyImportBtnText}>சுயவிவரங்களை மீட்டமைக்க (Confirm Import)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* App Info */}
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>தமிழ் திருமண பயோடேட்டா மேக்கர் - பதிப்பு 1.0.0</Text>
              <Text style={styles.aboutText}>
                முழுமையான ஆஃப்லைன் பாதுகாப்பு &amp; .vclone காப்புநகல் தொழில்நுட்பம்.{'\n'}
                React Native &amp; Expo மூலம் உருவாக்கப்பட்டது.
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
    padding: 18,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
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
    marginBottom: 12,
  },
  infoText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  statusBox: {
    backgroundColor: '#FEFCE8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF08A',
    marginBottom: 12,
  },
  statusBoxError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 12,
    color: '#854D0E',
    fontWeight: '700',
    lineHeight: 16,
  },
  statusTextError: {
    color: '#991B1B',
  },
  directDownloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  directDownloadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  directDownloadFileName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  exportCardsContainer: {
    gap: 8,
  },
  vcloneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#991B1B',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  exportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vcloneTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  badgeRecommended: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeRecommendedText: {
    color: '#854D0E',
    fontSize: 9,
    fontWeight: '800',
  },
  vcloneSub: {
    color: '#FEE2E2',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  jsonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 10,
  },
  jsonIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jsonCardTitle: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '800',
  },
  jsonCardSub: {
    color: '#92400E',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  uploadImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#15803D',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  uploadImportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  uploadImportBtnSub: {
    color: '#DCFCE7',
    fontSize: 10,
    marginTop: 2,
  },
  toggleJsonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  toggleJsonBtnText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  jsonBoxContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 8,
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
    minHeight: 70,
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
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  aboutText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
});
