import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  NAKSHATRAS,
  ALL_RASIS,
  getValidPaathams,
  getSuggestedRasi,
} from '../../data/nakshatraMapping';

interface NakshatraRasiPickerProps {
  selectedNakshatra: string;
  selectedPaatham: string;
  selectedRasi: string;
  selectedLagnam: string;
  onChangeNakshatra: (nakshatra: string) => void;
  onChangePaatham: (paatham: string) => void;
  onChangeRasi: (rasi: string) => void;
  onChangeLagnam: (lagnam: string) => void;
}

export const NakshatraRasiPicker: React.FC<NakshatraRasiPickerProps> = ({
  selectedNakshatra,
  selectedPaatham,
  selectedRasi,
  selectedLagnam,
  onChangeNakshatra,
  onChangePaatham,
  onChangeRasi,
  onChangeLagnam,
}) => {
  const [showNakshatraModal, setShowNakshatraModal] = useState(false);
  const [showRasiModal, setShowRasiModal] = useState(false);
  const [showLagnamModal, setShowLagnamModal] = useState(false);
  const [isManualRasiOverride, setIsManualRasiOverride] = useState(false);

  const validPaathams = selectedNakshatra
    ? getValidPaathams(selectedNakshatra)
    : [1, 2, 3, 4];

  const handleSelectNakshatra = (nakshatraTamil: string) => {
    onChangeNakshatra(nakshatraTamil);
    setShowNakshatraModal(false);

    // If paatham is selected, update Rasi according to the mapping
    const currentPaathamNum = parseInt(selectedPaatham, 10) || 1;
    const suggested = getSuggestedRasi(nakshatraTamil, currentPaathamNum);
    if (suggested && !isManualRasiOverride) {
      onChangeRasi(suggested.rasiTamil);
    }
  };

  const handleSelectPaatham = (paathamNum: number) => {
    const pStr = paathamNum.toString();
    onChangePaatham(pStr);

    if (selectedNakshatra && !isManualRasiOverride) {
      const suggested = getSuggestedRasi(selectedNakshatra, paathamNum);
      if (suggested) {
        onChangeRasi(suggested.rasiTamil);
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="star-shooting" size={18} color="#991B1B" />
        <Text style={styles.cardTitle}>நட்சத்திரம், பாதம் & ராசி பொருத்தம்</Text>
      </View>
      <Text style={styles.cardSub}>
        நட்சத்திரம் மற்றும் பாதத்தைத் தேர்ந்தெடுத்தால் ராசி தானாகவே கணிக்கப்படும்
      </Text>

      {/* Nakshatra Selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>நட்சத்திரம் (Nakshatra):</Text>
        <TouchableOpacity
          onPress={() => setShowNakshatraModal(true)}
          style={styles.pickerTrigger}
        >
          <Text
            style={[
              styles.pickerTriggerText,
              !selectedNakshatra && styles.placeholderText,
            ]}
          >
            {selectedNakshatra || 'நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Paatham Selector Chips */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>பாதம் (Paatham):</Text>
        <View style={styles.paathamRow}>
          {[1, 2, 3, 4].map((num) => {
            const isSelected = selectedPaatham === num.toString();
            const isValid = validPaathams.includes(num);

            return (
              <TouchableOpacity
                key={num}
                onPress={() => handleSelectPaatham(num)}
                style={[
                  styles.paathamChip,
                  isSelected && styles.paathamChipSelected,
                  !isValid && styles.paathamChipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.paathamChipText,
                    isSelected && styles.paathamChipTextSelected,
                  ]}
                >
                  {num}-ஆம் பாதம்
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rasi & Lagna in Two Columns */}
      <View style={styles.twoCols}>
        {/* Rasi with Auto-Match & Manual Override */}
        <View style={styles.flex1}>
          <View style={styles.labelWithHint}>
            <Text style={styles.fieldLabel}>ராசி (Rasi):</Text>
            {isManualRasiOverride && (
              <Text style={styles.overrideHint}>(சுய தேர்வு)</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowRasiModal(true)}
            style={styles.pickerTrigger}
          >
            <Text style={styles.pickerTriggerText}>
              {selectedRasi || 'ராசி தேர்வு'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Lagnam */}
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>லக்னம் (Lagnam):</Text>
          <TouchableOpacity
            onPress={() => setShowLagnamModal(true)}
            style={styles.pickerTrigger}
          >
            <Text style={styles.pickerTriggerText}>
              {selectedLagnam || 'லக்னம் தேர்வு'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Nakshatras (All 27) */}
      <Modal
        visible={showNakshatraModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNakshatraModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>27 நட்சத்திரங்கள் பட்டியல்</Text>
              <TouchableOpacity
                onPress={() => setShowNakshatraModal(false)}
                style={styles.modalClose}
              >
                <MaterialCommunityIcons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.nakshatraGrid}>
              {NAKSHATRAS.map((item, idx) => {
                const selected = selectedNakshatra === item.tamilName;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectNakshatra(item.tamilName)}
                    style={[
                      styles.nakshatraItem,
                      selected && styles.nakshatraItemSelected,
                    ]}
                  >
                    <Text style={styles.itemNum}>{idx + 1}</Text>
                    <View style={styles.itemTexts}>
                      <Text
                        style={[
                          styles.itemTamil,
                          selected && styles.itemTamilSelected,
                        ]}
                      >
                        {item.tamilName}
                      </Text>
                      <Text style={styles.itemEnglish}>({item.englishName})</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={selected ? 'check-circle' : 'circle-outline'}
                      size={18}
                      color={selected ? '#991B1B' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal for Rasi Selector (All 12) */}
      <Modal
        visible={showRasiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRasiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>12 ராசிகள் பட்டியல்</Text>
              <TouchableOpacity
                onPress={() => setShowRasiModal(false)}
                style={styles.modalClose}
              >
                <MaterialCommunityIcons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.rasiGrid}>
              {ALL_RASIS.map((rasi) => {
                const selected = selectedRasi === rasi.tamil;
                return (
                  <TouchableOpacity
                    key={rasi.id}
                    onPress={() => {
                      onChangeRasi(rasi.tamil);
                      setIsManualRasiOverride(true);
                      setShowRasiModal(false);
                    }}
                    style={[
                      styles.rasiItem,
                      selected && styles.rasiItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rasiItemText,
                        selected && styles.rasiItemTextSelected,
                      ]}
                    >
                      {rasi.tamil}
                    </Text>
                    <Text style={styles.rasiItemEng}>({rasi.english})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal for Lagna Selector */}
      <Modal
        visible={showLagnamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLagnamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalHeading}>லக்னம் தேர்வு (12 ராசிகள்)</Text>
              <TouchableOpacity
                onPress={() => setShowLagnamModal(false)}
                style={styles.modalClose}
              >
                <MaterialCommunityIcons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.rasiGrid}>
              {ALL_RASIS.map((rasi) => {
                const selected = selectedLagnam === rasi.tamil;
                return (
                  <TouchableOpacity
                    key={rasi.id}
                    onPress={() => {
                      onChangeLagnam(rasi.tamil);
                      setShowLagnamModal(false);
                    }}
                    style={[
                      styles.rasiItem,
                      selected && styles.rasiItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rasiItemText,
                        selected && styles.rasiItemTextSelected,
                      ]}
                    >
                      {rasi.tamil} லக்னம்
                    </Text>
                    <Text style={styles.rasiItemEng}>({rasi.english})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  cardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  pickerTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  paathamRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paathamChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  paathamChipSelected: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  paathamChipDisabled: {
    opacity: 0.5,
  },
  paathamChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  paathamChipTextSelected: {
    color: '#FFFFFF',
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  labelWithHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overrideHint: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  nakshatraGrid: {
    gap: 6,
  },
  nakshatraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  nakshatraItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  itemNum: {
    width: 20,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  itemTexts: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTamil: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemTamilSelected: {
    color: '#991B1B',
    fontWeight: '700',
  },
  itemEnglish: {
    fontSize: 11,
    color: '#6B7280',
  },
  rasiGrid: {
    gap: 8,
  },
  rasiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  rasiItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  rasiItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  rasiItemTextSelected: {
    color: '#991B1B',
    fontWeight: '700',
  },
  rasiItemEng: {
    fontSize: 12,
    color: '#6B7280',
  },
});
