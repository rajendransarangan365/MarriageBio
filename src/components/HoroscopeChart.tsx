import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HoroscopeChartHouses, PlanetCode } from '../types/biodata';

interface HoroscopeChartProps {
  rasiChart: HoroscopeChartHouses;
  navamsamChart: HoroscopeChartHouses;
  onUpdateRasiHouse: (houseNumber: keyof HoroscopeChartHouses, planets: PlanetCode[]) => void;
  onUpdateNavamsamHouse: (houseNumber: keyof HoroscopeChartHouses, planets: PlanetCode[]) => void;
  readOnly?: boolean;
}

const HOUSE_METADATA: Record<keyof HoroscopeChartHouses, { name: string; english: string }> = {
  1: { name: 'மேஷம்', english: 'Aries' },
  2: { name: 'ரிஷபம்', english: 'Taurus' },
  3: { name: 'மிதுனம்', english: 'Gemini' },
  4: { name: 'கடகம்', english: 'Cancer' },
  5: { name: 'சிம்மம்', english: 'Leo' },
  6: { name: 'கன்னி', english: 'Virgo' },
  7: { name: 'துலாம்', english: 'Libra' },
  8: { name: 'விருச்சிகம்', english: 'Scorpio' },
  9: { name: 'தனுசு', english: 'Sagittarius' },
  10: { name: 'மகரம்', english: 'Capricorn' },
  11: { name: 'கும்பம்', english: 'Aquarius' },
  12: { name: 'மீனம்', english: 'Pisces' },
};

const ALL_PLANETS: { code: PlanetCode; name: string }[] = [
  { code: 'சூரி', name: 'சூரியன் (Sun)' },
  { code: 'சந்', name: 'சந்திரன் (Moon)' },
  { code: 'செவ்', name: 'செவ்வாய் (Mars)' },
  { code: 'புத', name: 'புதன் (Mercury)' },
  { code: 'குரு', name: 'குரு / வியாழன் (Jupiter)' },
  { code: 'சுக்', name: 'சுக்கிரன் (Venus)' },
  { code: 'சனி', name: 'சனி பகவான் (Saturn)' },
  { code: 'ராகு', name: 'ராகு (Rahu)' },
  { code: 'கேது', name: 'கேது (Ketu)' },
  { code: 'லக்', name: 'லக்னம் (Lagnam)' },
];

export const HoroscopeChart: React.FC<HoroscopeChartProps> = ({
  rasiChart,
  navamsamChart,
  onUpdateRasiHouse,
  onUpdateNavamsamHouse,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'rasi' | 'navamsam'>('rasi');
  const [editingHouse, setEditingHouse] = useState<keyof HoroscopeChartHouses | null>(null);

  const currentChart = activeTab === 'rasi' ? rasiChart : navamsamChart;
  const updateHouse = activeTab === 'rasi' ? onUpdateRasiHouse : onUpdateNavamsamHouse;

  const handleHousePress = (houseNumber: keyof HoroscopeChartHouses) => {
    if (!readOnly) {
      setEditingHouse(houseNumber);
    }
  };

  const togglePlanet = (planet: PlanetCode) => {
    if (!editingHouse) return;
    const currentPlanets = currentChart[editingHouse] || [];
    let updated: PlanetCode[];
    if (currentPlanets.includes(planet)) {
      updated = currentPlanets.filter((p) => p !== planet);
    } else {
      updated = [...currentPlanets, planet];
    }
    updateHouse(editingHouse, updated);
  };

  const renderCell = (houseNumber: keyof HoroscopeChartHouses) => {
    const planets = currentChart[houseNumber] || [];
    const meta = HOUSE_METADATA[houseNumber];

    return (
      <TouchableOpacity
        key={houseNumber}
        activeOpacity={readOnly ? 1 : 0.7}
        onPress={() => handleHousePress(houseNumber)}
        style={[styles.houseCell, !readOnly && styles.houseCellEditable]}
      >
        <Text style={styles.houseName}>{meta.name}</Text>
        {planets.length === 0 ? (
          <View style={styles.emptyCenterContainer}>
            <Text style={styles.emptyPlus}>+</Text>
          </View>
        ) : (
          <View style={styles.planetsContainer}>
            {planets.map((p, idx) => (
              <View
                key={idx}
                style={[
                  styles.planetBadge,
                  p === 'லக்' ? styles.lagnamBadge : styles.normalPlanetBadge,
                ]}
              >
                <Text
                  style={[
                    styles.planetBadgeText,
                    p === 'லக்' ? styles.lagnamText : styles.normalPlanetText,
                  ]}
                >
                  {p}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Header Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('rasi')}
          style={[styles.tabBtn, activeTab === 'rasi' && styles.tabBtnActive]}
        >
          <MaterialCommunityIcons
            name="compass-rose"
            size={18}
            color={activeTab === 'rasi' ? '#991B1B' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'rasi' && styles.tabBtnTextActive,
            ]}
          >
            ராசி கட்டம் (Rasi Chart)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('navamsam')}
          style={[styles.tabBtn, activeTab === 'navamsam' && styles.tabBtnActive]}
        >
          <MaterialCommunityIcons
            name="star-four-points"
            size={18}
            color={activeTab === 'navamsam' ? '#991B1B' : '#6B7280'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'navamsam' && styles.tabBtnTextActive,
            ]}
          >
            நவாம்சம் கட்டம் (Navamsam)
          </Text>
        </TouchableOpacity>
      </View>

      {!readOnly && (
        <Text style={styles.instructionText}>
          கட்டத்தில் கிரகங்களை உள்ளிட அல்லது மாற்ற குறிப்பிட்ட கட்டத்தை அழுத்தவும் (Tap any house to add/edit planets)
        </Text>
      )}

      {/* Traditional South Indian 4x4 Card Grid (Image 2 Design) */}
      <View style={styles.gridContainer}>
        {/* Row 1: Houses 12 (மீனம்), 1 (மேஷம்), 2 (ரிஷபம்), 3 (மிதுனம்) */}
        <View style={styles.gridRow}>
          {renderCell(12)}
          {renderCell(1)}
          {renderCell(2)}
          {renderCell(3)}
        </View>

        {/* Row 2: House 11 (கும்பம்), Center Top-Left, Center Top-Right, House 4 (கடகம்) */}
        <View style={styles.gridRow}>
          {renderCell(11)}
          <View style={styles.centerCell}>
            <Text style={styles.centerTitle}>
              {activeTab === 'rasi' ? 'ராசி' : 'நவாம்சம்'}
            </Text>
          </View>
          <View style={styles.centerCell}>
            <Text style={styles.centerTitle}>
              {activeTab === 'rasi' ? 'ராசி' : 'நவாம்சம்'}
            </Text>
          </View>
          {renderCell(4)}
        </View>

        {/* Row 3: House 10 (மகரம்), Center Bot-Left, Center Bot-Right, House 5 (சிம்மம்) */}
        <View style={styles.gridRow}>
          {renderCell(10)}
          <View style={styles.centerCell}>
            <Text style={styles.centerSub}>ஜாதகம்</Text>
          </View>
          <View style={styles.centerCell}>
            <Text style={styles.emptyPlus}>+</Text>
          </View>
          {renderCell(5)}
        </View>

        {/* Row 4: Houses 9 (தனுசு), 8 (விருச்சிகம்), 7 (துலாம்), 6 (கன்னி) */}
        <View style={styles.gridRow}>
          {renderCell(9)}
          {renderCell(8)}
          {renderCell(7)}
          {renderCell(6)}
        </View>
      </View>

      {/* Modal for selecting planets in a house */}
      {editingHouse && (
        <Modal
          visible={!!editingHouse}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingHouse(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {HOUSE_METADATA[editingHouse].name} - கிரகங்கள்
                  </Text>
                  <Text style={styles.modalSub}>
                    {HOUSE_METADATA[editingHouse].english} (House {editingHouse})
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditingHouse(null)}
                  style={styles.closeBtn}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHelper}>
                இந்த வீட்டில் உள்ள கிரகங்களைத் தொட்டு சேர்க்கவும் / நீக்கவும்:
              </Text>

              <ScrollView contentContainerStyle={styles.planetsPicker}>
                {ALL_PLANETS.map((planet) => {
                  const selected = (currentChart[editingHouse] || []).includes(
                    planet.code
                  );
                  return (
                    <TouchableOpacity
                      key={planet.code}
                      onPress={() => togglePlanet(planet.code)}
                      style={[
                        styles.planetPickItem,
                        selected && styles.planetPickItemSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.planetBadgePreview,
                          selected && styles.planetBadgePreviewSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.planetBadgePreviewText,
                            selected && styles.planetBadgePreviewTextSelected,
                          ]}
                        >
                          {planet.code}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.planetItemLabel,
                          selected && styles.planetItemLabelSelected,
                        ]}
                      >
                        {planet.name}
                      </Text>
                      <MaterialCommunityIcons
                        name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={20}
                        color={selected ? '#991B1B' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setEditingHouse(null)}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>சேமி (Done)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  gridContainer: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#78350F',
    backgroundColor: '#FFFDF9',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  houseCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B45309',
    padding: 3,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  houseCellEditable: {
    backgroundColor: '#FEFCE8',
  },
  houseName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'left',
  },
  planetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 2,
  },
  planetBadge: {
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  normalPlanetBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 0.5,
    borderColor: '#D97706',
  },
  lagnamBadge: {
    backgroundColor: '#DC2626',
  },
  planetBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  normalPlanetText: {
    color: '#92400E',
  },
  lagnamText: {
    color: '#FFFFFF',
  },
  emptyCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlus: {
    fontSize: 18,
    color: '#D1C7B7',
    fontWeight: '700',
  },
  centerCell: {
    flex: 1,
    backgroundColor: '#FAF5EA',
    borderWidth: 0.5,
    borderRadius: 6,
    margin: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  centerOm: {
    fontSize: 22,
    fontWeight: '800',
    color: '#78350F',
  },
  centerMerged: {
    position: 'absolute',
    left: '25%',
    top: 0,
    width: '50%',
    height: '200%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#78350F',
    marginTop: 4,
  },
  centerSub: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalHelper: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  planetsPicker: {
    gap: 8,
    paddingVertical: 4,
  },
  planetPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  planetPickItemSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  planetBadgePreview: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetBadgePreviewSelected: {
    backgroundColor: '#991B1B',
  },
  planetBadgePreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  planetBadgePreviewTextSelected: {
    color: '#FFFFFF',
  },
  planetItemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  planetItemLabelSelected: {
    color: '#991B1B',
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
