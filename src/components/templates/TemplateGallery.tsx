import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TEMPLATES_CATALOG } from '../../data/templatesData';
import { Gender, BiodataProfile } from '../../types/biodata';

interface TemplateGalleryProps {
  selectedTemplateId: string;
  candidateGender: Gender;
  candidateProfile?: BiodataProfile;
  onSelectTemplate: (templateId: string) => void;
  isDarkMode?: boolean;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplateId,
  candidateGender,
  candidateProfile,
  onSelectTemplate,
  isDarkMode = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'recommended' | 'traditional' | 'modern'>('all');

  const filteredTemplates = TEMPLATES_CATALOG.filter((t) => {
    if (filter === 'recommended') {
      return t.genderRecommendation === candidateGender || t.genderRecommendation === 'all';
    }
    if (filter === 'traditional') {
      return t.category === 'traditional' || t.category === 'heritage';
    }
    if (filter === 'modern') {
      return t.category === 'modern' || t.category === 'floral';
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="view-carousel-outline" size={20} color="#991B1B" />
        <View>
          <Text style={styles.title}>8 தேர்ந்தெடுக்கப்பட்ட வார்ப்புருக்கள்</Text>
          <Text style={styles.sub}>
            உங்கள் விருப்பத்திற்கேற்ப திருமண வரன் விபரத்தின் பாணியை மாற்றவும்
          </Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            அனைத்தும் (8)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('recommended')}
          style={[styles.filterChip, filter === 'recommended' && styles.filterChipActive]}
        >
          <MaterialCommunityIcons
            name="star-outline"
            size={14}
            color={filter === 'recommended' ? '#FFFFFF' : '#991B1B'}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === 'recommended' && styles.filterChipTextActive,
            ]}
          >
            பரிந்துரைக்கப்பட்டவை ({candidateGender === 'groom' ? 'வரன்' : 'மணமகள்'})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('traditional')}
          style={[styles.filterChip, filter === 'traditional' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'traditional' && styles.filterChipTextActive,
            ]}
          >
            மரபுசார் பாரம்பரியம்
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('modern')}
          style={[styles.filterChip, filter === 'modern' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'modern' && styles.filterChipTextActive,
            ]}
          >
            நவீன வடிவங்கள்
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Templates Grid Cards */}
      <View style={styles.grid}>
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <TouchableOpacity
              key={template.id}
              activeOpacity={0.8}
              onPress={() => onSelectTemplate(template.id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                { borderColor: isSelected ? template.palette.primary : '#E5E7EB' },
              ]}
            >
              {/* Authentic Miniature Biodata Document Preview */}
              <View
                style={[
                  styles.mockupSheet,
                  {
                    borderColor: template.palette.borderOuter,
                    backgroundColor: template.palette.headerBg ? '#FFFFFF' : '#FAFAFA',
                  },
                ]}
              >
                {/* Inner Decorative Border */}
                <View
                  style={[
                    styles.mockupInnerBorder,
                    { borderColor: template.palette.primary },
                  ]}
                >
                  {/* Miniature Top Sacred Header */}
                  <View style={styles.mockupTopSacred}>
                    <Text style={[styles.mockupOmText, { color: template.palette.primary }]}>
                      {template.id === 'templ_minimal' ? '|| ஸ்ரீ ||' : 'ௐ || ஸ்ரீ விநாயகர் துணை ||'}
                    </Text>
                  </View>

                  {/* Miniature Title Banner */}
                  <View
                    style={[
                      styles.mockupBanner,
                      { backgroundColor: template.palette.primary },
                    ]}
                  >
                    <Text style={styles.mockupBannerText}>
                      {candidateGender === 'groom' ? 'சுப வரன் விபரம்' : 'மணமகள் விபரம்'}
                    </Text>
                  </View>

                  {/* Miniature 2-Column Body (Details Left + Photo Right) */}
                  <View style={styles.mockupTwoCol}>
                    <View style={styles.mockupDetailsCol}>
                      {/* Candidate Name in template primary color */}
                      <Text
                        style={[
                          styles.mockupCandidateName,
                          { color: template.palette.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {candidateProfile?.fullName?.trim() || (candidateGender === 'groom' ? 'ஆர். ஸ்ரீராம்' : 'எஸ். திவ்யா')}
                      </Text>

                      {/* Candidate Education */}
                      <Text style={styles.mockupDetailText} numberOfLines={1}>
                        🎓 {candidateProfile?.qualification?.trim() || 'B.E. (CSE)'}
                      </Text>

                      {/* Candidate Occupation */}
                      <Text style={styles.mockupDetailText} numberOfLines={1}>
                        💼 {candidateProfile?.occupation?.trim() || 'Software Engineer'}
                      </Text>

                      {/* Candidate Caste / Religion */}
                      <Text style={styles.mockupDetailText} numberOfLines={1}>
                        🏛️ {candidateProfile?.caste?.trim() || candidateProfile?.religion || 'இந்து'}
                      </Text>
                    </View>

                    {/* Miniature Photo Frame with candidate's actual photo or silhouette */}
                    <View
                      style={[
                        styles.mockupPhotoFrame,
                        {
                          borderColor: template.palette.accent || template.palette.primary,
                          backgroundColor: template.palette.headerBg,
                        },
                      ]}
                    >
                      {candidateProfile?.photoUri ? (
                        <Image
                          source={{ uri: candidateProfile.photoUri }}
                          style={styles.mockupPhotoImg}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={candidateGender === 'groom' ? 'account' : 'face-woman'}
                          size={18}
                          color={template.palette.primary}
                        />
                      )}
                    </View>
                  </View>

                  {/* Miniature Side-by-Side Horoscope Charts */}
                  <View style={styles.mockupChartsRow}>
                    {/* Rasi Chart */}
                    <View
                      style={[
                        styles.mockupChartBox,
                        { borderColor: template.palette.accent || template.palette.primary },
                      ]}
                    >
                      <Text style={[styles.mockupChartLabel, { color: template.palette.primaryDark }]}>
                        ராசி
                      </Text>
                      <View style={styles.mockupMiniGrid}>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                        </View>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={[styles.mockupGridCell, { backgroundColor: '#FFFBEB' }]} />
                          <View style={styles.mockupGridCell} />
                        </View>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                        </View>
                      </View>
                    </View>

                    {/* Navamsam Chart */}
                    <View
                      style={[
                        styles.mockupChartBox,
                        { borderColor: template.palette.accent || template.palette.primary },
                      ]}
                    >
                      <Text style={[styles.mockupChartLabel, { color: template.palette.primaryDark }]}>
                        நவாம்சம்
                      </Text>
                      <View style={styles.mockupMiniGrid}>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                        </View>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={[styles.mockupGridCell, { backgroundColor: '#EFF6FF' }]} />
                          <View style={styles.mockupGridCell} />
                        </View>
                        <View style={styles.mockupGridRow}>
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                          <View style={styles.mockupGridCell} />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Miniature Astro Bar */}
                  <View
                    style={[
                      styles.mockupAstroBar,
                      { backgroundColor: template.palette.headerBg },
                    ]}
                  >
                    <View style={[styles.mockupAstroDot, { backgroundColor: template.palette.primary }]} />
                    <View style={styles.mockupAstroLine} />
                  </View>
                </View>
              </View>

              {/* Template Info */}
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.templateTamilName} numberOfLines={1}>
                    {template.nameTamil}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={template.palette.primary}
                    />
                  )}
                </View>

                <Text style={styles.templateEngName}>{template.nameEnglish}</Text>
                <Text style={styles.templateDesc} numberOfLines={2}>
                  {template.description}
                </Text>

                {/* Color Swatch Indicators */}
                <View style={styles.swatchRow}>
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: template.palette.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: template.palette.accent },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: template.palette.borderOuter },
                    ]}
                  />
                  <Text style={styles.categoryBadge}>
                    {template.category === 'traditional'
                      ? 'பாரம்பரியம்'
                      : template.category === 'heritage'
                      ? 'உயர்தரம்'
                      : template.category === 'floral'
                      ? 'மலர் எழில்'
                      : 'நவீனம்'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    shadowOpacity: 0.2,
  },
  mockupSheet: {
    height: 155,
    padding: 4,
    borderBottomWidth: 1.5,
    overflow: 'hidden',
  },
  mockupInnerBorder: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 3,
    justifyContent: 'space-between',
  },
  mockupTopSacred: {
    alignItems: 'center',
    paddingVertical: 1,
  },
  mockupOmText: {
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  mockupBanner: {
    paddingVertical: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    marginVertical: 2,
  },
  mockupBannerText: {
    fontSize: 6,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  mockupTwoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  mockupDetailsCol: {
    flex: 1,
    gap: 2,
  },
  mockupCandidateName: {
    fontSize: 7.2,
    fontWeight: '800',
    lineHeight: 9,
    marginBottom: 0.5,
  },
  mockupDetailText: {
    fontSize: 5.5,
    fontWeight: '600',
    color: '#4B5563',
    lineHeight: 7.5,
  },
  mockupPhotoFrame: {
    width: 32,
    height: 40,
    borderWidth: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mockupPhotoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mockupChartsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 1,
  },
  mockupChartBox: {
    flex: 1,
    borderWidth: 0.8,
    borderRadius: 2,
    padding: 1.5,
    backgroundColor: '#FAF5EA',
    alignItems: 'center',
  },
  mockupChartLabel: {
    fontSize: 5.5,
    fontWeight: '800',
    marginBottom: 1,
  },
  mockupMiniGrid: {
    width: '100%',
    gap: 0.8,
  },
  mockupGridRow: {
    flexDirection: 'row',
    gap: 0.8,
    justifyContent: 'center',
  },
  mockupGridCell: {
    flex: 1,
    height: 4.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 0.8,
  },
  mockupAstroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  mockupAstroDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  mockupAstroLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  cardContent: {
    padding: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTamilName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  templateEngName: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 14,
    marginBottom: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryBadge: {
    marginLeft: 'auto',
    fontSize: 9,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
});
