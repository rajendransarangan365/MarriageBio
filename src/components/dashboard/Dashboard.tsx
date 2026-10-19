import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BiodataProfile, Gender } from '../../types/biodata';

interface DashboardProps {
  profiles: BiodataProfile[];
  activeProfile: BiodataProfile;
  onCreateNew: (gender: Gender) => void;
  onSelectProfile: (profile: BiodataProfile) => void;
  onEditProfile: (profile: BiodataProfile) => void;
  onDuplicateProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onDeleteActiveProfile?: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onUpdatePhoto?: (uri: string) => void;
  isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profiles,
  activeProfile,
  onCreateNew,
  onSelectProfile,
  onEditProfile,
  onDuplicateProfile,
  onDeleteProfile,
  onDeleteActiveProfile,
  onOpenTemplates,
  onOpenSettings,
  onUpdatePhoto,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'profiles'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'groom' | 'bride'>('all');
  const [photoUriTracked, setPhotoUriTracked] = useState(activeProfile.photoUri);
  const [draftPhotoError, setDraftPhotoError] = useState(false);
  if (photoUriTracked !== activeProfile.photoUri) {
    setPhotoUriTracked(activeProfile.photoUri);
    setDraftPhotoError(false);
  }

  const handlePickDraftPhoto = async () => {
    const { pickAndCompressPhoto } = await import('../../utils/imageCompressor');
    const uri = await pickAndCompressPhoto();
    if (uri && onUpdatePhoto) {
      onUpdatePhoto(uri);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.fullName || '').toLowerCase().includes(q) ||
      (p.qualification || '').toLowerCase().includes(q) ||
      (p.occupation || '').toLowerCase().includes(q) ||
      (p.caste || '').toLowerCase().includes(q) ||
      (p.placeOfBirth || '').toLowerCase().includes(q) ||
      (p.nativePlace || '').toLowerCase().includes(q) ||
      (p.residentialAddress || '').toLowerCase().includes(q) ||
      (p.nakshatram || '').toLowerCase().includes(q) ||
      (p.rasi || '').toLowerCase().includes(q) ||
      (p.parentsContact || '').toLowerCase().includes(q);
    const matchesGender =
      genderFilter === 'all' ? true : p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const confirmDeleteDraft = () => {
    const draftName = activeProfile.fullName?.trim() || 'வரைவு சுயவிவரம்';
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`'${draftName}' வரைவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
        if (onDeleteActiveProfile) {
          onDeleteActiveProfile();
        } else if (activeProfile.id) {
          onDeleteProfile(activeProfile.id);
        }
      }
    } else {
      Alert.alert(
        'வரைவை நீக்கு',
        `'${draftName}' வரைவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`,
        [
          { text: 'ரத்து செய்', style: 'cancel' },
          {
            text: 'நீக்கு',
            style: 'destructive',
            onPress: () => {
              if (onDeleteActiveProfile) {
                onDeleteActiveProfile();
              } else if (activeProfile.id) {
                onDeleteProfile(activeProfile.id);
              }
            },
          },
        ]
      );
    }
  };

  const confirmDelete = (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`'${name}' வரன் விபரத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`)) {
        onDeleteProfile(id);
      }
    } else {
      Alert.alert(
        'விவரத்தை நீக்கு',
        `'${name}' வரன் விபரத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`,
        [
          { text: 'ரத்து செய்', style: 'cancel' },
          {
            text: 'நீக்கு',
            style: 'destructive',
            onPress: () => onDeleteProfile(id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner / Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.heroAppIcon}
            resizeMode="cover"
          />
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>மணமக்கள் ஜாதகம்</Text>
            <Text style={styles.heroSub}>
              உங்கள் வாழ்க்கைக்கு சரியான துணைக்கான திருமண வரன் விபரம்
            </Text>
          </View>
        </View>

        {/* Quick Hub Navigation */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            onPress={() => onCreateNew('groom')}
            style={[styles.quickNavBtn, styles.quickNavGroom]}
          >
            <MaterialCommunityIcons name="account-tie" size={20} color="#FFFFFF" />
            <Text style={styles.quickNavText}>ஆண் வரன் (+)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onCreateNew('bride')}
            style={[styles.quickNavBtn, styles.quickNavBride]}
          >
            <MaterialCommunityIcons name="face-woman" size={20} color="#FFFFFF" />
            <Text style={styles.quickNavText}>மணமகள் (+)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenTemplates}
            style={[styles.quickNavBtn, styles.quickNavTemplate]}
          >
            <MaterialCommunityIcons name="palette-swatch" size={20} color="#991B1B" />
            <Text style={[styles.quickNavText, { color: '#991B1B' }]}>வார்ப்புரு</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Internal Subtabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          style={[styles.subTab, activeTab === 'home' && styles.subTabActive]}
        >
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={18}
            color={activeTab === 'home' ? '#991B1B' : '#6B7280'}
          />
          <Text
            style={[
              styles.subTabText,
              activeTab === 'home' && styles.subTabTextActive,
            ]}
          >
            முகப்பு (Dashboard)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('profiles')}
          style={[styles.subTab, activeTab === 'profiles' && styles.subTabActive]}
        >
          <MaterialCommunityIcons
            name="account-multiple-outline"
            size={18}
            color={activeTab === 'profiles' ? '#991B1B' : '#6B7280'}
          />
          <Text
            style={[
              styles.subTabText,
              activeTab === 'profiles' && styles.subTabTextActive,
            ]}
          >
            எனது வரன்கள் ({profiles.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: HOME OVERVIEW */}
      {activeTab === 'home' && (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
          {/* Quick Search Bar */}
          <View style={[styles.searchBox, isDarkMode && styles.searchBoxDark, { marginBottom: 14 }]}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={isDarkMode ? '#9CA3AF' : '#991B1B'}
            />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.textWhite]}
              placeholder="வரன் பெயர், படிப்பு, வேலை, ஊர், நட்சத்திரம் தேடுக..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* IF SEARCHING ON HOME: SHOW MATCHING PROFILES */}
          {searchQuery.trim().length > 0 ? (
            <View style={styles.homeSearchResultsSection}>
              <View style={styles.searchResultsHeader}>
                <Text style={[styles.searchResultsTitle, isDarkMode && styles.textWhite]}>
                  🔍 தேடல் முடிவுகள் ({filteredProfiles.length} வரன்கள்)
                </Text>
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearResultsBtn}>
                  <Text style={styles.clearResultsText}>தேடலை அழி</Text>
                </TouchableOpacity>
              </View>

              {filteredProfiles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="file-search-outline" size={44} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    {`"${searchQuery}" என்ற தேடலுக்கு வரன்கள் கிடைக்கவில்லை`}
                  </Text>
                </View>
              ) : (
                filteredProfiles.map((item) => (
                  <View key={item.id} style={[styles.profileCard, isDarkMode && styles.profileCardDark]}>
                    <View style={styles.profileCardTop}>
                      {item.photoUri ? (
                        <Image
                          source={{ uri: item.photoUri }}
                          style={styles.cardAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.avatarCircle,
                            item.gender === 'groom' ? styles.avatarGroom : styles.avatarBride,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={item.gender === 'groom' ? 'account-tie' : 'face-woman'}
                            size={22}
                            color="#FFFFFF"
                          />
                        </View>
                      )}

                      <View style={styles.profileCardInfo}>
                        <View style={styles.cardNameRow}>
                          <Text style={[styles.profileCardName, isDarkMode && styles.textWhite]}>
                            {item.fullName}
                          </Text>
                          <View
                            style={[
                              styles.miniGenderBadge,
                              item.gender === 'groom' ? styles.badgeGroom : styles.badgeBride,
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniGenderText,
                                item.gender === 'groom' ? styles.textGroom : styles.textBride,
                              ]}
                            >
                              {item.gender === 'groom' ? 'ஆண் வரன்' : 'மணமகள்'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.profileCardJob}>
                          {item.qualification || 'கல்வி இல்லை'} | {item.occupation || 'பணி இல்லை'}
                        </Text>
                        {(item.nakshatram || item.placeOfBirth || item.nativePlace) ? (
                          <Text style={styles.profileCardSub}>
                            {item.nakshatram ? `⭐ ${item.nakshatram}` : ''}{' '}
                            {item.placeOfBirth || item.nativePlace
                              ? `• 📍 ${item.placeOfBirth || item.nativePlace}`
                              : ''}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Actions on this profile */}
                    <View style={styles.profileCardActions}>
                      <TouchableOpacity
                        onPress={() => onSelectProfile(item)}
                        style={styles.cardActionBtn}
                      >
                        <MaterialCommunityIcons name="eye-outline" size={16} color="#991B1B" />
                        <Text style={styles.cardActionText}>முன்னோட்டம்</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onEditProfile(item)}
                        style={styles.cardActionBtn}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={16} color="#1E3A8A" />
                        <Text style={[styles.cardActionText, { color: '#1E3A8A' }]}>திருத்து</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onDuplicateProfile(item.id)}
                        style={styles.cardActionBtn}
                      >
                        <MaterialCommunityIcons name="content-copy" size={16} color="#B45309" />
                        <Text style={[styles.cardActionText, { color: '#B45309' }]}>நகல்</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => confirmDelete(item.id, item.fullName)}
                        style={styles.cardActionBtn}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                        <Text style={[styles.cardActionText, { color: '#DC2626' }]}>நீக்கு</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : (
            <>
              {/* Redesigned Active Profile Draft Card */}
              <View style={[styles.draftCard, isDarkMode && styles.draftCardDark]}>
                {/* Header with Draft Status & Badges & Quick Delete */}
                <View style={styles.draftHeader}>
                  <View style={styles.draftHeaderLeft}>
                    <View style={styles.draftBadge}>
                      <MaterialCommunityIcons name="pencil-circle-outline" size={15} color="#D97706" />
                      <Text style={styles.draftBadgeText}>வரைவு நிலை (Active Draft)</Text>
                    </View>
                    <View
                      style={[
                        styles.draftGenderBadge,
                        activeProfile.gender === 'groom' ? styles.badgeGroom : styles.badgeBride,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={activeProfile.gender === 'groom' ? 'account-tie' : 'face-woman'}
                        size={13}
                        color={activeProfile.gender === 'groom' ? '#1E3A8A' : '#BE185D'}
                      />
                      <Text
                        style={[
                          styles.draftGenderText,
                          activeProfile.gender === 'groom' ? styles.textGroom : styles.textBride,
                        ]}
                      >
                        {activeProfile.gender === 'groom' ? 'ஆண் வரன்' : 'மணமகள்'}
                      </Text>
                    </View>
                  </View>

                  {/* Top Delete Draft Shortcut */}
                  <TouchableOpacity
                    onPress={confirmDeleteDraft}
                    style={styles.draftTopDeleteBtn}
                    accessibilityLabel="வரைவை நீக்கு"
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                    <Text style={styles.draftTopDeleteText}>நீக்கு</Text>
                  </TouchableOpacity>
                </View>

                {/* Profile Showcase Body */}
                <View style={styles.draftProfileBody}>
                  {/* Photo Thumbnail - Direct Click to Pick / Change Photo */}
                  <TouchableOpacity
                    onPress={handlePickDraftPhoto}
                    activeOpacity={0.7}
                    style={styles.draftAvatarContainer}
                    accessibilityLabel="புகைப்படம் பதிவேற்றுக"
                  >
                    {activeProfile.photoUri && !draftPhotoError ? (
                      <Image
                        source={{ uri: activeProfile.photoUri }}
                        style={styles.draftAvatarImg}
                        resizeMode="cover"
                        onError={() => setDraftPhotoError(true)}
                      />
                    ) : (
                      <View
                        style={[
                          styles.draftAvatarFallback,
                          activeProfile.gender === 'groom' ? styles.avatarGroomBg : styles.avatarBrideBg,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={activeProfile.gender === 'groom' ? 'account-tie' : 'face-woman'}
                          size={32}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                    <View style={styles.avatarCameraBadge}>
                      <MaterialCommunityIcons name="camera" size={11} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>

                  {/* Details column */}
                  <View style={styles.draftDetails}>
                    <Text style={[styles.draftName, isDarkMode && styles.textWhite]}>
                      {activeProfile.fullName?.trim() ? activeProfile.fullName : 'பெயர் குறிப்பிடப்படவில்லை (Unnamed)'}
                    </Text>

                    <View style={styles.draftInfoRow}>
                      <MaterialCommunityIcons name="school-outline" size={14} color="#6B7280" />
                      <Text style={styles.draftInfoText} numberOfLines={1}>
                        {activeProfile.qualification?.trim() || 'படிப்பு விபரம் இல்லை'}
                      </Text>
                      {activeProfile.occupation?.trim() ? (
                        <>
                          <Text style={styles.draftInfoBullet}>•</Text>
                          <MaterialCommunityIcons name="briefcase-outline" size={14} color="#6B7280" />
                          <Text style={styles.draftInfoText} numberOfLines={1}>
                            {activeProfile.occupation}
                          </Text>
                        </>
                      ) : null}
                    </View>

                    {/* Astrological / Location Tag Row */}
                    <View style={styles.draftTagsRow}>
                      {activeProfile.nakshatram?.trim() ? (
                        <View style={styles.draftTagPill}>
                          <Text style={styles.draftTagText}>
                            ⭐ {activeProfile.nakshatram} {activeProfile.rasi ? `(${activeProfile.rasi})` : ''}
                          </Text>
                        </View>
                      ) : null}
                      {activeProfile.placeOfBirth?.trim() || activeProfile.nativePlace?.trim() || activeProfile.residentialAddress?.trim() ? (
                        <View style={styles.draftTagPill}>
                          <Text style={styles.draftTagText}>
                            📍 {activeProfile.placeOfBirth || activeProfile.nativePlace || activeProfile.residentialAddress}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.draftTime}>
                      🕒 கடைசி மாற்றம்: {new Date(activeProfile.updatedAt).toLocaleTimeString('ta-IN')}
                    </Text>
                  </View>
                </View>

                {/* Draft Actions Row - 2 Rows to Prevent Vertical Crushing/Bleeding */}
                <View style={styles.draftActions}>
                  <TouchableOpacity
                    onPress={() => onEditProfile(activeProfile)}
                    style={styles.draftContinueBtn}
                  >
                    <MaterialCommunityIcons name="file-document-edit" size={16} color="#FFFFFF" />
                    <Text style={styles.draftContinueText}>தொடர்ந்து திருத்துக (Edit)</Text>
                  </TouchableOpacity>

                  <View style={styles.draftActionsRow2}>
                    <TouchableOpacity
                      onPress={() => onSelectProfile(activeProfile)}
                      style={styles.draftPreviewBtn}
                    >
                      <MaterialCommunityIcons name="eye-outline" size={16} color="#991B1B" />
                      <Text style={styles.draftPreviewText}>முன்னோட்டம்</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={confirmDeleteDraft}
                      style={styles.draftDeleteBtn}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                      <Text style={styles.draftDeleteText}>வரைவை நீக்கு</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Quick Action Tiles */}
              <View style={styles.tilesGrid}>
                <TouchableOpacity
                  onPress={() => onCreateNew('groom')}
                  style={[styles.tileCard, isDarkMode && styles.tileCardDark]}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <MaterialCommunityIcons name="account-plus" size={24} color="#1E3A8A" />
                  </View>
                  <Text style={[styles.tileTitle, isDarkMode && styles.textWhite]}>புதிய வரன் (ஆண்)</Text>
                  <Text style={styles.tileSub}>மணமகன் ஜாதகம் & விபரம் உருவாக்க</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onCreateNew('bride')}
                  style={[styles.tileCard, isDarkMode && styles.tileCardDark]}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: '#FDF2F8' }]}>
                    <MaterialCommunityIcons name="account-heart" size={24} color="#BE185D" />
                  </View>
                  <Text style={[styles.tileTitle, isDarkMode && styles.textWhite]}>புதிய வரன் (பெண்)</Text>
                  <Text style={styles.tileSub}>மணமகள் ஜாதகம் & விபரம் உருவாக்க</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onOpenTemplates}
                  style={[styles.tileCard, isDarkMode && styles.tileCardDark]}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={24} color="#B45309" />
                  </View>
                  <Text style={[styles.tileTitle, isDarkMode && styles.textWhite]}>8 வார்ப்புருக்கள்</Text>
                  <Text style={styles.tileSub}>பாரம்பரிய மற்றும் நவீன வடிவங்கள்</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onOpenSettings}
                  style={[styles.tileCard, isDarkMode && styles.tileCardDark]}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: '#F3F4F6' }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color="#4B5563" />
                  </View>
                  <Text style={[styles.tileTitle, isDarkMode && styles.textWhite]}>காப்புநகல் & அமைப்புகள்</Text>
                  <Text style={styles.tileSub}>JSON காப்பு மற்றும் மீட்டமைப்பு</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* TAB 2: MY PROFILES LIST */}
      {activeTab === 'profiles' && (
        <View style={styles.tabContent}>
          {/* Search & Filter Bar */}
          <View style={[styles.searchBox, isDarkMode && styles.searchBoxDark]}>
            <MaterialCommunityIcons name="magnify" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.textWhite]}
              placeholder="பெயர் அல்லது பணி தேட..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Gender Filter Chips */}
          <View style={styles.filterChipsRow}>
            <TouchableOpacity
              onPress={() => setGenderFilter('all')}
              style={[
                styles.smallFilterChip,
                genderFilter === 'all' && styles.smallFilterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.smallFilterChipText,
                  genderFilter === 'all' && styles.smallFilterChipTextActive,
                ]}
              >
                அனைத்தும் ({profiles.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGenderFilter('groom')}
              style={[
                styles.smallFilterChip,
                genderFilter === 'groom' && styles.smallFilterChipActive,
              ]}
            >
              <MaterialCommunityIcons
                name="account-tie"
                size={14}
                color={genderFilter === 'groom' ? '#FFFFFF' : '#1E3A8A'}
              />
              <Text
                style={[
                  styles.smallFilterChipText,
                  genderFilter === 'groom' && styles.smallFilterChipTextActive,
                ]}
              >
                வரன் (ஆண்)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGenderFilter('bride')}
              style={[
                styles.smallFilterChip,
                genderFilter === 'bride' && styles.smallFilterChipActive,
              ]}
            >
              <MaterialCommunityIcons
                name="face-woman"
                size={14}
                color={genderFilter === 'bride' ? '#FFFFFF' : '#BE185D'}
              />
              <Text
                style={[
                  styles.smallFilterChipText,
                  genderFilter === 'bride' && styles.smallFilterChipTextActive,
                ]}
              >
                மணமகள் (பெண்)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profiles Scroll View */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.profilesScroll}>
            {filteredProfiles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="file-search-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyText}>சுயவிவரங்கள் எதுவும் கிடைக்கவில்லை</Text>
              </View>
            ) : (
              filteredProfiles.map((item) => (
                <View key={item.id} style={[styles.profileCard, isDarkMode && styles.profileCardDark]}>
                  <View style={styles.profileCardTop}>
                    {item.photoUri ? (
                      <Image
                        source={{ uri: item.photoUri }}
                        style={styles.cardAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarCircle,
                          item.gender === 'groom' ? styles.avatarGroom : styles.avatarBride,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.gender === 'groom' ? 'account-tie' : 'face-woman'}
                          size={22}
                          color="#FFFFFF"
                        />
                      </View>
                    )}

                    <View style={styles.profileCardInfo}>
                      <Text style={[styles.profileCardName, isDarkMode && styles.textWhite]}>{item.fullName}</Text>
                      <Text style={styles.profileCardSub}>
                        {item.gender === 'groom' ? 'வரன்' : 'மணமகள்'} • பிறந்த தேதி:{' '}
                        {item.dateOfBirth}
                      </Text>
                      <Text style={styles.profileCardJob}>
                        {item.qualification} | {item.occupation}
                      </Text>
                    </View>
                  </View>

                  {/* Actions on this profile */}
                  <View style={styles.profileCardActions}>
                    <TouchableOpacity
                      onPress={() => onSelectProfile(item)}
                      style={styles.cardActionBtn}
                    >
                      <MaterialCommunityIcons name="eye-outline" size={16} color="#991B1B" />
                      <Text style={styles.cardActionText}>முன்னோட்டம்</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onEditProfile(item)}
                      style={styles.cardActionBtn}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#1E3A8A" />
                      <Text style={[styles.cardActionText, { color: '#1E3A8A' }]}>திருத்து</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onDuplicateProfile(item.id)}
                      style={styles.cardActionBtn}
                    >
                      <MaterialCommunityIcons name="content-copy" size={16} color="#B45309" />
                      <Text style={[styles.cardActionText, { color: '#B45309' }]}>நகல்</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => confirmDelete(item.id, item.fullName)}
                      style={styles.cardActionBtn}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                      <Text style={[styles.cardActionText, { color: '#DC2626' }]}>நீக்கு</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  heroAppIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D97706',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  heroSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  quickNavGroom: {
    backgroundColor: '#1E3A8A',
  },
  quickNavBride: {
    backgroundColor: '#831843',
  },
  quickNavTemplate: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  quickNavText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: '#FEF2F2',
  },
  subTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  draftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 16,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  draftCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  draftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  draftBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  draftGenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  draftGenderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeGroom: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeBride: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  textGroom: {
    color: '#1E3A8A',
  },
  textBride: {
    color: '#BE185D',
  },
  draftTopDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  draftTopDeleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  draftProfileBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  draftAvatarContainer: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  draftAvatarImg: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  draftAvatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroomBg: {
    backgroundColor: '#1E3A8A',
  },
  avatarBrideBg: {
    backgroundColor: '#831843',
  },
  photoOnlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  draftDetails: {
    flex: 1,
  },
  draftName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  draftInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  draftInfoText: {
    fontSize: 12,
    color: '#4B5563',
  },
  draftInfoBullet: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 2,
  },
  draftTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  draftTagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftTagText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  draftTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 5,
  },
  draftActions: {
    flexDirection: 'column',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  draftActionsRow2: {
    flexDirection: 'row',
    gap: 8,
  },
  draftContinueBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingVertical: 10,
    borderRadius: 8,
  },
  draftContinueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  draftPreviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  draftPreviewText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  draftDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  draftDeleteText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#991B1B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tileCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tileCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  tileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tileSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchBoxDark: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  clearSearchBtn: {
    padding: 4,
  },
  homeSearchResultsSection: {
    marginBottom: 16,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  searchResultsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearResultsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  clearResultsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  miniGenderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniGenderText: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  smallFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  smallFilterChipActive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  smallFilterChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  smallFilterChipTextActive: {
    color: '#FFFFFF',
  },
  profilesScroll: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  profileCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#D97706',
  },
  avatarGroom: {
    backgroundColor: '#1E3A8A',
  },
  avatarBride: {
    backgroundColor: '#831843',
  },
  profileCardInfo: {
    flex: 1,
  },
  profileCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  profileCardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  profileCardJob: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  profileCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  textWhite: {
    color: '#F9FAFB',
  },
});
