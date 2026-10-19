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
import { HoroscopeChartHouses } from '../../types/biodata';
import { PLANETS_MASTER, DEFAULT_PLANET_ABBRS } from '../../data/planets';

interface EditableChartProps {
  chartTitle: 'ராசி கட்டம்' | 'நவாம்சம் கட்டம்';
  chartData: HoroscopeChartHouses;
  onChangeHouse: (houseNumber: keyof HoroscopeChartHouses, planets: string[]) => void;
  readOnly?: boolean;
  accentColor?: string;
}

const HOUSE_DATA: Record<keyof HoroscopeChartHouses, { name: string; english: string }> = {
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

export const EditableChart: React.FC<EditableChartProps> = ({
  chartTitle,
  chartData,
  onChangeHouse,
  readOnly = false,
  accentColor = '#991B1B',
}) => {
  const [editingHouse, setEditingHouse] = useState<keyof HoroscopeChartHouses | null>(null);

  const handleCellPress = (houseNum: keyof HoroscopeChartHouses) => {
    if (!readOnly) {
      setEditingHouse(houseNum);
    }
  };

  const togglePlanet = (planetAbbr: string) => {
    if (!editingHouse) return;
    const current = chartData[editingHouse] || [];
    let updated: string[];
    if (current.includes(planetAbbr)) {
      updated = current.filter((p) => p !== planetAbbr);
    } else {
      updated = [...current, planetAbbr];
    }
    onChangeHouse(editingHouse, updated);
  };

  const clearCurrentHouse = () => {
    if (!editingHouse) return;
    onChangeHouse(editingHouse, []);
  };

  const getPlanetEnglishName = (abbr: string): string => {
    const found = PLANETS_MASTER.find((p) => p.defaultAbbr === abbr);
    return found ? found.englishName : '';
  };

  const renderHouseCell = (houseNum: keyof HoroscopeChartHouses) => {
    const planets = chartData[houseNum] || [];
    const meta = HOUSE_DATA[houseNum];

    return (
      <TouchableOpacity
        key={houseNum}
        activeOpacity={readOnly ? 1 : 0.7}
        onPress={() => handleCellPress(houseNum)}
        style={[
          styles.cell,
          !readOnly && styles.cellInteractive,
          planets.length > 0 && styles.cellOccupied,
        ]}
      >
        <Text style={styles.houseTitle}>{meta.name}</Text>
        {planets.length === 0 ? (
          <View style={styles.emptyCenterContainer}>
            <Text style={styles.emptyPlus}>+</Text>
          </View>
        ) : (
          <View style={styles.planetsCardContainer}>
            {planets.map((p, idx) => (
              <View key={`${p}_${idx}`} style={styles.planetBadgeItem}>
                <Text style={[styles.planetTamilText, p === 'லக்' && styles.lagnamTamilText]}>
                  {p}
                </Text>
                <Text style={styles.planetEngText}>
                  {getPlanetEnglishName(p)}
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
      <View style={styles.chartHeader}>
        <MaterialCommunityIcons name="star-four-points" size={16} color={accentColor} />
        <Text style={[styles.chartHeaderTitle, { color: accentColor }]}>
          {chartTitle}
        </Text>
        {!readOnly && (
          <Text style={styles.tapHelper}>
            (கட்டத்தைத் தொட்டு கிரகங்களை உள்ளிடவும்)
          </Text>
        )}
      </View>

      {/* Traditional South Indian 4x4 Uniform Card Grid (Image 2 Design) */}
      <View style={[styles.gridBox, { borderColor: accentColor }]}>
        {/* Row 1: 12 (மீனம்), 1 (மேஷம்), 2 (ரிஷபம்), 3 (மிதுனம்) */}
        <View style={styles.gridRow}>
          {renderHouseCell(12)}
          {renderHouseCell(1)}
          {renderHouseCell(2)}
          {renderHouseCell(3)}
        </View>

        {/* Row 2: 11 (கும்பம்), Center Top-Left, Center Top-Right, 4 (கடகம்) */}
        <View style={styles.gridRow}>
          {renderHouseCell(11)}
          <View style={[styles.centerCell, { borderColor: accentColor }]}>
            <Text style={[styles.centerChartTitle, { color: accentColor }]}>
              {chartTitle.replace(' கட்டம்', '')}
            </Text>
          </View>
          <View style={[styles.centerCell, { borderColor: accentColor }]}>
            <Text style={[styles.centerChartTitle, { color: accentColor }]}>
              {chartTitle.replace(' கட்டம்', '')}
            </Text>
          </View>
          {renderHouseCell(4)}
        </View>

        {/* Row 3: 10 (மகரம்), Center Bot-Left, Center Bot-Right, 5 (சிம்மம்) */}
        <View style={styles.gridRow}>
          {renderHouseCell(10)}
          <View style={[styles.centerCell, { borderColor: accentColor }]}>
            <Text style={styles.centerSubText}>ஜாதகம்</Text>
          </View>
          <View style={[styles.centerCell, { borderColor: accentColor }]}>
            <Text style={styles.centerPlusText}>+</Text>
          </View>
          {renderHouseCell(5)}
        </View>

        {/* Row 4: 9 (தனுசு), 8 (விருச்சிகம்), 7 (துலாம்), 6 (கன்னி) */}
        <View style={styles.gridRow}>
          {renderHouseCell(9)}
          {renderHouseCell(8)}
          {renderHouseCell(7)}
          {renderHouseCell(6)}
        </View>
      </View>

      {/* Planet Selection Modal / Bottom Sheet */}
      {editingHouse && (
        <Modal
          visible={!!editingHouse}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingHouse(null)}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {HOUSE_DATA[editingHouse].name} ({HOUSE_DATA[editingHouse].english})
                  </Text>
                  <Text style={styles.modalSub}>
                    இந்த கட்டத்திற்குரிய கிரகங்களைத் தேர்ந்தெடுக்கவும்
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditingHouse(null)}
                  style={styles.closeBtn}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.planetList}>
                {PLANETS_MASTER.map((planet) => {
                  const abbr = planet.defaultAbbr;
                  const isSelected = (chartData[editingHouse] || []).includes(abbr);

                  return (
                    <TouchableOpacity
                      key={planet.id}
                      onPress={() => togglePlanet(abbr)}
                      style={[
                        styles.planetRow,
                        isSelected && styles.planetRowSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.abbrPill,
                          isSelected && styles.abbrPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.abbrPillText,
                            isSelected && styles.abbrPillTextSelected,
                          ]}
                        >
                          {abbr}
                        </Text>
                      </View>
                      <View style={styles.planetNamesCol}>
                        <Text style={styles.tamilPlanetName}>{planet.tamilName}</Text>
                        <Text style={styles.englishPlanetName}>
                          {planet.englishName}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={22}
                        color={isSelected ? accentColor : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={clearCurrentHouse}
                  style={styles.clearBtn}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                  <Text style={styles.clearBtnText}>கட்டத்தை அழிக்க</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEditingHouse(null)}
                  style={[styles.saveBtn, { backgroundColor: accentColor }]}
                >
                  <MaterialCommunityIcons name="check-bold" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>சேமி (Done)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  chartHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  tapHelper: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  gridBox: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 4,
    justifyContent: 'space-between',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 2.5,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#E6D7BD',
    borderRadius: 8,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cellInteractive: {},
  cellOccupied: {
    backgroundColor: '#F7F0DF',
    borderColor: '#D4AF37',
  },
  houseTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
    alignSelf: 'center',
    marginBottom: 2,
  },
  emptyCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlus: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  planetsCardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    paddingVertical: 1,
  },
  planetBadgeItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  planetTamilText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#831843',
    lineHeight: 16,
  },
  lagnamTamilText: {
    color: '#DC2626',
    fontWeight: '900',
  },
  planetEngText: {
    fontSize: 8.5,
    color: '#78350F',
    fontWeight: '600',
    lineHeight: 10,
  },
  centerCell: {
    flex: 1,
    margin: 2.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOmSymbol: {
    fontSize: 22,
    fontWeight: '800',
  },
  centerChartTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  centerSubText: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '700',
  },
  centerPlusText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  planetList: {
    gap: 6,
    paddingVertical: 6,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  planetRowSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  abbrPill: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abbrPillSelected: {
    backgroundColor: '#991B1B',
  },
  abbrPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },
  abbrPillTextSelected: {
    color: '#FFFFFF',
  },
  planetNamesCol: {
    flex: 1,
  },
  tamilPlanetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  englishPlanetName: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
