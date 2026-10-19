import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BiodataProfile,
  Gender,
  createDefaultProfile,
  createBlankProfile,
  SiblingItem,
  calculateAgeFromDob,
} from './src/types/biodata';
import { StorageService } from './src/database/storage';
import { Dashboard } from './src/components/dashboard/Dashboard';
import { WorshipGodHeader } from './src/components/WorshipGodHeader';
import { LocationAutocomplete } from './src/components/common/LocationAutocomplete';
import { EditableChart } from './src/components/horoscope/EditableChart';
import { NakshatraRasiPicker } from './src/components/horoscope/NakshatraRasiPicker';
import { PhotoEditor } from './src/components/photo/PhotoEditor';
import { TemplateGallery } from './src/components/templates/TemplateGallery';
import { TemplateRenderer } from './src/components/templates/TemplateRenderer';
import { GeminiBioTuner } from './src/components/GeminiBioTuner';
import { VoiceInputButton } from './src/components/VoiceInputButton';
import { SettingsModal } from './src/components/settings/SettingsModal';
import { generateAndSharePdf } from './src/services/pdfRenderer';
import { saveBiodataAsImage } from './src/services/imageSaveService';
import { pickAndCompressPhoto } from './src/utils/imageCompressor';
import {
  RELIGIONS,
  COMMUNITIES,
  COMPLEXIONS,
  BIRTH_ORDERS,
  INCOME_PERIODS,
  ASSET_TYPES,
} from './src/data/religionsAndCommunities';

function MainApp() {
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<BiodataProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<BiodataProfile>(createBlankProfile('groom'));
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'create_workflow' | 'preview'>('dashboard');
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | 4>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showImageSaveModal, setShowImageSaveModal] = useState(false);
  const [customFolder, setCustomFolder] = useState('Pictures/TamilMarriageBiodata');

  // Load profiles from local storage on launch and inject bold clean fonts
  useEffect(() => {
    loadAllProfilesOnMount();

    // Dynamically inject Anek Tamil & Catamaran bold clean fonts safely without overriding icons
    if (typeof document !== 'undefined') {
      const fontId = 'tamil-custom-google-fonts';
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@500;600;700;800&family=Catamaran:wght@600;700;800;900&family=Mukta+Malar:wght@600;700;800&display=swap';
        document.head.appendChild(link);
      }

      let style = document.getElementById('tamil-font-override-style') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = 'tamil-font-override-style';
        document.head.appendChild(style);
      }
      style.innerHTML = `
        html, body, #root {
          font-family: 'Anek Tamil', 'Catamaran', 'Mukta Malar', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        /* Ensure Expo icon fonts are never overridden by general font family */
        [style*="MaterialCommunityIcons"],
        [style*="font-family: MaterialCommunityIcons"],
        [style*="fontFamily: MaterialCommunityIcons"],
        [style*="FontAwesome"],
        [style*="MaterialIcons"] {
          font-family: MaterialCommunityIcons, "Material Design Icons", FontAwesome, MaterialIcons !important;
        }
      `;
    }
  }, []);

  // Synchronize browser history so pressing the browser Back button (<--) never dumps to about:blank
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      const state = window.history.state;
      if (!state || state.screen !== currentScreen || state.step !== workflowStep) {
        window.history.pushState({ screen: currentScreen, step: workflowStep }, '');
      }
    }
  }, [currentScreen, workflowStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setCurrentScreen(e.state.screen);
        if (e.state.step) {
          setWorkflowStep(e.state.step);
        }
      } else {
        // Prevent leaving the app to about:blank when pressing browser back
        if (currentScreen === 'preview') {
          setCurrentScreen('dashboard');
        } else if (currentScreen === 'create_workflow') {
          if (workflowStep > 1) {
            setWorkflowStep((prev) => ((prev - 1) as any));
          } else {
            setCurrentScreen('dashboard');
          }
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentScreen, workflowStep]);

  const handleBackNav = () => {
    if (currentScreen === 'preview') {
      setCurrentScreen('dashboard');
    } else if (currentScreen === 'create_workflow') {
      if (workflowStep > 1) {
        setWorkflowStep((prev) => ((prev - 1) as any));
      } else {
        setCurrentScreen('dashboard');
      }
    }
  };

  const refreshProfilesList = async () => {
    const list = await StorageService.getAllProfiles();
    setProfiles(list);
  };

  const loadAllProfilesOnMount = async () => {
    const list = await StorageService.getAllProfiles();
    setProfiles(list);
    const draft = await StorageService.getActiveDraft();
    if (draft) {
      setActiveProfile(draft);
    }
  };

  const updateProfileField = <K extends keyof BiodataProfile>(key: K, value: BiodataProfile[K]) => {
    setActiveProfile((prev) => {
      const updated = { ...prev, [key]: value, updatedAt: Date.now() };
      StorageService.saveDraft(updated);
      return updated;
    });
  };

  const handleSaveActiveProfile = async () => {
    await StorageService.saveProfile(activeProfile);
    await refreshProfilesList();
  };

  const handleCreateNew = (gender: Gender) => {
    const newProfile = createBlankProfile(gender);
    setActiveProfile(newProfile);
    setWorkflowStep(1);
    setCurrentScreen('create_workflow');
  };

  const handleEditProfile = (profile: BiodataProfile) => {
    setActiveProfile(profile);
    setWorkflowStep(1);
    setCurrentScreen('create_workflow');
  };

  const handleDuplicateProfile = async (id: string) => {
    await StorageService.duplicateProfile(id);
    await refreshProfilesList();
    Alert.alert('வெற்றி', 'வரன் விபரம் வெற்றிகரமாக நகல் எடுக்கப்பட்டது!');
  };

  const handleDeleteProfile = async (id: string) => {
    await StorageService.deleteProfile(id);
    await refreshProfilesList();
  };

  const handleDeleteDraft = async () => {
    try {
      if (activeProfile.id) {
        await StorageService.deleteProfile(activeProfile.id);
      }
      const blank = createBlankProfile('groom');
      await StorageService.saveDraft(blank);
      setActiveProfile(blank);
      await refreshProfilesList();
      Alert.alert('வெற்றி', 'வரைவு சுயவிவரம் வெற்றிகரமாக நீக்கப்பட்டது!');
    } catch (e) {
      console.error('Delete draft error:', e);
    }
  };

  // Sibling Helpers
  const addSibling = () => {
    const newSib: SiblingItem = {
      id: `sib_${Date.now()}`,
      relation: 'தம்பி (Younger Brother)',
      maritalStatus: 'திருமணமாகாதவர் (Unmarried)',
      details: '',
    };
    const updatedList = [...activeProfile.siblings, newSib];
    const bCount = updatedList.filter((s) => s.relation.includes('Brother')).length;
    const sCount = updatedList.filter((s) => s.relation.includes('Sister')).length;
    updateProfileField('siblings', updatedList);
    updateProfileField('brothersCount', bCount);
    updateProfileField('sistersCount', sCount);
  };

  const removeSibling = (id: string) => {
    const updatedList = activeProfile.siblings.filter((s) => s.id !== id);
    const bCount = updatedList.filter((s) => s.relation.includes('Brother')).length;
    const sCount = updatedList.filter((s) => s.relation.includes('Sister')).length;
    updateProfileField('siblings', updatedList);
    updateProfileField('brothersCount', bCount);
    updateProfileField('sistersCount', sCount);
  };

  const updateSibling = (id: string, field: keyof SiblingItem, val: any) => {
    const updatedList = activeProfile.siblings.map((s) =>
      s.id === id ? { ...s, [field]: val } : s
    );
    const bCount = updatedList.filter((s) => s.relation.includes('Brother')).length;
    const sCount = updatedList.filter((s) => s.relation.includes('Sister')).length;
    updateProfileField('siblings', updatedList);
    updateProfileField('brothersCount', bCount);
    updateProfileField('sistersCount', sCount);
  };

  // Height conversion helper
  const handleHeightChange = (feet: number, inches: number) => {
    const totalInches = feet * 12 + inches;
    const cm = Math.round(totalInches * 2.54);
    updateProfileField('heightFeet', feet);
    updateProfileField('heightInches', inches);
    updateProfileField('heightCm', cm);
  };

  // PDF Export Trigger
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateAndSharePdf(activeProfile);
    } catch (e: any) {
      Alert.alert('பிழை', 'PDF உருவாக்குவதில் சிக்கல் ஏற்பட்டது.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Image Export Trigger (Single Page Image with Custom Folder)
  const handleExportImage = async () => {
    setIsExportingImage(true);
    try {
      const res = await saveBiodataAsImage(activeProfile, customFolder, 'png');
      if (res.success) {
        Alert.alert('வெற்றி', res.message);
      } else {
        Alert.alert('பிழை', res.message);
      }
    } catch (e: any) {
      Alert.alert('பிழை', `படமாகச் சேமிப்பதில் சிக்கல்: ${e.message}`);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Top Application Bar with Safe Area Clearance */}
      <View style={[styles.topBar, isDarkMode && styles.topBarDark]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {currentScreen !== 'dashboard' && (
            <TouchableOpacity
              onPress={handleBackNav}
              style={[styles.backStepHeaderBtn, isDarkMode && styles.backStepHeaderBtnDark]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={19} color={isDarkMode ? '#F59E0B' : '#991B1B'} />
              <Text style={[styles.backStepHeaderText, isDarkMode && { color: '#F59E0B' }]}>பின்செல்க</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setCurrentScreen('dashboard')}
            style={styles.topBarLeft}
            activeOpacity={0.7}
          >
            <Image source={require('./assets/icon.png')} style={styles.appIconLogo} />
            <View>
              <Text style={[styles.appTitleMain, isDarkMode && { color: '#F59E0B' }]}>மணமக்கள் ஜாதகம்</Text>
              <Text style={[styles.appSubMain, isDarkMode && { color: '#94A3B8' }]}>Marriage Biodata Builder</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.topBarActions}>
          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={[styles.iconActionBtn, isDarkMode && styles.iconBtnDark]}
          >
            <MaterialCommunityIcons
              name={isDarkMode ? 'weather-sunny' : 'weather-night'}
              size={22}
              color={isDarkMode ? '#F59E0B' : '#4B5563'}
            />
          </TouchableOpacity>

          {currentScreen !== 'dashboard' && (
            <TouchableOpacity
              onPress={() => setCurrentScreen('dashboard')}
              style={[styles.iconActionBtn, isDarkMode && styles.iconBtnDark]}
            >
              <MaterialCommunityIcons name="home-outline" size={22} color={isDarkMode ? '#F59E0B' : '#991B1B'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={[styles.iconActionBtn, isDarkMode && styles.iconBtnDark]}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={isDarkMode ? '#F3F4F6' : '#4B5563'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SCREEN 1: DASHBOARD */}
      {currentScreen === 'dashboard' && (
        <View style={styles.bodyWrapper}>
          <Dashboard
            profiles={profiles}
            activeProfile={activeProfile}
            onCreateNew={handleCreateNew}
            onSelectProfile={(p) => {
              setActiveProfile(p);
              setCurrentScreen('preview');
            }}
            onEditProfile={handleEditProfile}
            onDuplicateProfile={handleDuplicateProfile}
            onDeleteProfile={handleDeleteProfile}
            onDeleteActiveProfile={handleDeleteDraft}
            onOpenTemplates={() => {
              setWorkflowStep(3);
              setCurrentScreen('create_workflow');
            }}
            onOpenSettings={() => setShowSettings(true)}
            onUpdatePhoto={(photoUri) => updateProfileField('photoUri', photoUri)}
            isDarkMode={isDarkMode}
          />
        </View>
      )}

      {/* SCREEN 2: 4-STAGE PROFILE CREATION WORKFLOW */}
      {currentScreen === 'create_workflow' && (
        <View style={styles.workflowContainer}>
          {/* 4-Step Stepper Header */}
          <View style={styles.stepperRow}>
            {[
              { num: 1, title: 'சுயவிவரம்' },
              { num: 2, title: 'ஜாதகம்' },
              { num: 3, title: 'வார்ப்புரு' },
              { num: 4, title: 'முன்னோட்டம்' },
            ].map((st) => (
              <TouchableOpacity
                key={st.num}
                onPress={() => setWorkflowStep(st.num as any)}
                style={[
                  styles.stepItem,
                  workflowStep === st.num && styles.stepItemActive,
                  workflowStep > st.num && styles.stepItemCompleted,
                ]}
              >
                <View
                  style={[
                    styles.stepBadge,
                    workflowStep === st.num && styles.stepBadgeActive,
                    workflowStep > st.num && styles.stepBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepBadgeText,
                      (workflowStep === st.num || workflowStep > st.num) && styles.stepBadgeTextActive,
                    ]}
                  >
                    {st.num}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    workflowStep === st.num && styles.stepTitleActive,
                  ]}
                >
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Workflow Body Scroll */}
          <ScrollView
            style={styles.workflowScroll}
            contentContainerStyle={styles.workflowScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: PERSONAL & FAMILY DETAILS */}
            {workflowStep === 1 && (
              <View>
                {/* Worship God Invocation */}
                <WorshipGodHeader
                  godInvocation={activeProfile.godInvocation}
                  customGodInvocation={activeProfile.customGodInvocation}
                  headerSymbol={activeProfile.headerSymbol}
                  onUpdateInvocation={(v) => updateProfileField('godInvocation', v)}
                  onUpdateCustomInvocation={(v) => updateProfileField('customGodInvocation', v)}
                  onUpdateSymbol={(s) => updateProfileField('headerSymbol', s)}
                />

                {/* Candidate Photo Card (Step 1 Quick Upload & Preview) */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>வரன் / மணமகள் புகைப்படம் (Profile Photo):</Text>
                  <View style={styles.photoUploadRow}>
                    <View style={styles.photoPreviewBox}>
                      {activeProfile.photoUri ? (
                        <Image
                          source={{ uri: activeProfile.photoUri }}
                          style={styles.photoPreviewImg}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={activeProfile.gender === 'groom' ? 'account' : 'face-woman'}
                          size={38}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          const uri = await pickAndCompressPhoto();
                          if (uri) {
                            updateProfileField('photoUri', uri);
                          }
                        }}
                        style={styles.photoUploadBtn}
                      >
                        <MaterialCommunityIcons name="camera-plus" size={18} color="#FFFFFF" />
                        <Text style={styles.photoUploadBtnText}>
                          {activeProfile.photoUri ? 'புகைப்படத்தை மாற்றுக' : 'புகைப்படம் சேர்க்க (Upload)'}
                        </Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => setWorkflowStep(3)}
                          style={styles.photoStudioBtn}
                        >
                          <MaterialCommunityIcons name="palette" size={15} color="#4B5563" />
                          <Text style={styles.photoStudioBtnText}>Studio வடிவம்</Text>
                        </TouchableOpacity>

                        {activeProfile.photoUri && (
                          <TouchableOpacity
                            onPress={() => updateProfileField('photoUri', null)}
                            style={styles.photoDeleteBtn}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={15} color="#DC2626" />
                            <Text style={styles.photoDeleteBtnText}>நீக்கு</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Candidate Gender Selection */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>பாலினம் (Gender):</Text>
                  <View style={styles.rowTwoCols}>
                    <TouchableOpacity
                      onPress={() => updateProfileField('gender', 'groom')}
                      style={[
                        styles.genderChoiceBtn,
                        activeProfile.gender === 'groom' && styles.genderChoiceGroomActive,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="account-tie"
                        size={20}
                        color={activeProfile.gender === 'groom' ? '#FFFFFF' : '#1E3A8A'}
                      />
                      <Text
                        style={[
                          styles.genderChoiceText,
                          activeProfile.gender === 'groom' && styles.genderChoiceTextActive,
                        ]}
                      >
                        வரன் (ஆண் / Groom)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateProfileField('gender', 'bride')}
                      style={[
                        styles.genderChoiceBtn,
                        activeProfile.gender === 'bride' && styles.genderChoiceBrideActive,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="face-woman"
                        size={20}
                        color={activeProfile.gender === 'bride' ? '#FFFFFF' : '#831843'}
                      />
                      <Text
                        style={[
                          styles.genderChoiceText,
                          activeProfile.gender === 'bride' && styles.genderChoiceTextActive,
                        ]}
                      >
                        மணமகள் (Bride)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Personal Information */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>தனிப்பட்ட விவரங்கள் (Personal Information):</Text>

                  {/* Name with Voice Input */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>முழுப் பெயர் (Full Name):</Text>
                    <View style={styles.inputWithMic}>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.fullName}
                        onChangeText={(txt) => updateProfileField('fullName', txt)}
                        placeholder="பெயர் உள்ளிடவும்"
                      />
                      <VoiceInputButton
                        onTranscript={(txt) => updateProfileField('fullName', txt)}
                        label=""
                      />
                    </View>
                  </View>

                  {/* Date of Birth, Age (Optional) & Time of Birth */}
                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>பிறந்த தேதி (DOB):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.dateOfBirth}
                        onChangeText={(txt) => {
                          updateProfileField('dateOfBirth', txt);
                          if (!activeProfile.age) {
                            const calculated = calculateAgeFromDob(txt);
                            if (calculated) {
                              updateProfileField('age', calculated);
                            }
                          }
                        }}
                        placeholder="எ.கா: 14-04-1996"
                      />
                    </View>

                    <View style={[styles.formField, { flex: 0.65, minWidth: 90 }]}>
                      <Text style={styles.fieldLabel}>வயது (Age - விருப்பம்):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.age || ''}
                        onChangeText={(txt) => updateProfileField('age', txt)}
                        placeholder="எ.கா: 28"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>பிறந்த நேரம் & AM/PM:</Text>
                      <View style={styles.timeInputRow}>
                        <TextInput
                          style={[styles.fieldInput, styles.timeInputField]}
                          value={activeProfile.timeOfBirth}
                          onChangeText={(txt) => updateProfileField('timeOfBirth', txt)}
                          placeholder="06:45"
                        />
                        <TouchableOpacity
                          onPress={() =>
                            updateProfileField(
                              'timePeriod',
                              activeProfile.timePeriod === 'AM' ? 'PM' : 'AM'
                            )
                          }
                          style={styles.amPmToggleBtn}
                        >
                          <Text style={styles.amPmToggleText}>{activeProfile.timePeriod}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Place of Birth with Search Autocomplete */}
                  <LocationAutocomplete
                    label="பிறந்த இடம் (Place of Birth):"
                    value={activeProfile.placeOfBirth}
                    onChangeValue={(loc) => updateProfileField('placeOfBirth', loc)}
                    placeholder="எ.கா: மதுரை / சென்னை"
                  />

                  {/* Height with feet, inches and cm conversion */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>
                      உயரம்: {activeProfile.heightFeet} அடி {activeProfile.heightInches} அங் ({activeProfile.heightCm} செ.மீ)
                    </Text>
                    <View style={styles.rowTwoCols}>
                      <View style={[styles.rowTwoCols, styles.flex1]}>
                        <TextInput
                          style={[styles.fieldInput, styles.flex1]}
                          value={activeProfile.heightFeet.toString()}
                          keyboardType="numeric"
                          onChangeText={(val) =>
                            handleHeightChange(parseInt(val, 10) || 0, activeProfile.heightInches)
                          }
                          placeholder="அடி (Feet)"
                        />
                        <TextInput
                          style={[styles.fieldInput, styles.flex1]}
                          value={activeProfile.heightInches.toString()}
                          keyboardType="numeric"
                          onChangeText={(val) =>
                            handleHeightChange(activeProfile.heightFeet, parseInt(val, 10) || 0)
                          }
                          placeholder="அங்குலம் (Inches)"
                        />
                      </View>
                      <TextInput
                        style={[styles.fieldInput, styles.flex1]}
                        value={activeProfile.complexion}
                        onChangeText={(txt) => updateProfileField('complexion', txt)}
                        placeholder="நிறம் (Complexion)"
                      />
                    </View>
                  </View>

                  {/* Food Habit (Optional) */}
                  <View style={styles.formField}>
                    <View style={styles.fieldHeaderRow}>
                      <Text style={styles.fieldLabel}>உணவு முறை (Food Habit - விருப்பத்தேர்வு):</Text>
                      {activeProfile.foodHabit ? (
                        <TouchableOpacity onPress={() => updateProfileField('foodHabit', '')}>
                          <Text style={styles.clearFieldText}>நீக்கு (விருப்பத்தேர்வு)</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <View style={styles.foodHabitGrid}>
                      {[
                        { label: 'சைவம் (Veg)', value: 'சைவம் (Veg)' },
                        { label: 'அசைவம் (Non-Veg)', value: 'அசைவம் (Non-Veg)' },
                        { label: 'முட்டை மட்டும் (Eggetarian)', value: 'முட்டை மட்டும் (Eggetarian)' },
                        { label: 'தேவை இல்லை (Skip)', value: '' },
                      ].map((opt) => {
                        const isSelected = (activeProfile.foodHabit || '') === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.label}
                            onPress={() => updateProfileField('foodHabit', opt.value)}
                            style={[
                              styles.foodHabitBtn,
                              isSelected && styles.foodHabitBtnActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.foodHabitBtnText,
                                isSelected && styles.foodHabitBtnTextActive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Religion & Caste */}
                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>மதம் (Religion):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.religion}
                        onChangeText={(txt) => updateProfileField('religion', txt)}
                        placeholder="மதம்"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>சாதி / சமூகம் (Community):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.caste}
                        onChangeText={(txt) => updateProfileField('caste', txt)}
                        placeholder="சாதி பிரிவு (விருப்பம்)"
                      />
                    </View>
                  </View>

                  {/* Gothram & Kuladeivam */}
                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>கோத்திரம் (Gothram):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.gothram}
                        onChangeText={(txt) => updateProfileField('gothram', txt)}
                        placeholder="கோத்திரம்"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>குலதெய்வம் (Kuladeivam):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.kuladeivam}
                        onChangeText={(txt) => updateProfileField('kuladeivam', txt)}
                        placeholder="குலதெய்வம் & ஊர்"
                      />
                    </View>
                  </View>
                </View>

                {/* Education & Career Details */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>கல்வி மற்றும் தொழில் (Education & Career):</Text>

                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>கல்வித் தகுதி (Qualification):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={activeProfile.qualification}
                      onChangeText={(txt) => updateProfileField('qualification', txt)}
                      placeholder="எ.கா: B.Tech / MBA / MBBS"
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>கல்லூரி / பல்கலைக்கழகம் (College - விருப்பத்தேர்வு):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={activeProfile.collegeOrUniversity}
                      onChangeText={(txt) => updateProfileField('collegeOrUniversity', txt)}
                      placeholder="படித்த கல்லூரி (தேவைப்பட்டால் மட்டும் / Optional)"
                    />
                  </View>

                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>பணி / பதவி (Designation):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.occupation}
                        onChangeText={(txt) => updateProfileField('occupation', txt)}
                        placeholder="பணி விவரம்"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>நிறுவனம் (Company):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.companyName}
                        onChangeText={(txt) => updateProfileField('companyName', txt)}
                        placeholder="நிறுவனத்தின் பெயர்"
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>வருமானம் (Income):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.annualIncome}
                        onChangeText={(txt) => updateProfileField('annualIncome', txt)}
                        placeholder="எ.கா: 18,00,000"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>கால அளவு:</Text>
                      <View style={styles.rowTwoCols}>
                        <TouchableOpacity
                          onPress={() => updateProfileField('incomePeriod', 'yearly')}
                          style={[
                            styles.periodBtn,
                            activeProfile.incomePeriod === 'yearly' && styles.periodBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.periodBtnText,
                              activeProfile.incomePeriod === 'yearly' && styles.periodBtnTextActive,
                            ]}
                          >
                            ஆண்டுக்கு
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => updateProfileField('incomePeriod', 'monthly')}
                          style={[
                            styles.periodBtn,
                            activeProfile.incomePeriod === 'monthly' && styles.periodBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.periodBtnText,
                              activeProfile.incomePeriod === 'monthly' && styles.periodBtnTextActive,
                            ]}
                          >
                            மாதம்
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>பணியிடம் (Work Location):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={activeProfile.workLocation}
                      onChangeText={(txt) => updateProfileField('workLocation', txt)}
                      placeholder="எ.கா: சென்னை / வெளிநாடு"
                    />
                  </View>
                </View>

                {/* Family Details & Siblings */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>குடும்ப விவரங்கள் (Family Details):</Text>

                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>தந்தை பெயர்:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.fatherName}
                        onChangeText={(txt) => updateProfileField('fatherName', txt)}
                        placeholder="தந்தையின் பெயர்"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>தந்தை தொழில்:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.fatherOccupation}
                        onChangeText={(txt) => updateProfileField('fatherOccupation', txt)}
                        placeholder="தொழில்"
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>தாய் பெயர்:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.motherName}
                        onChangeText={(txt) => updateProfileField('motherName', txt)}
                        placeholder="தாயின் பெயர்"
                      />
                    </View>

                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>தாய் தொழில்:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.motherOccupation}
                        onChangeText={(txt) => updateProfileField('motherOccupation', txt)}
                        placeholder="இல்லத்தரசி / பணி"
                      />
                    </View>
                  </View>

                  <LocationAutocomplete
                    label="பூர்வீக ஊர் (Ancestral Origin):"
                    value={activeProfile.nativePlace}
                    onChangeValue={(loc) => updateProfileField('nativePlace', loc)}
                    placeholder="சொந்த ஊர் பெயர்"
                  />

                  {/* Birth Order */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>பிறப்பு வரிசை (Birth Order):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={activeProfile.birthOrder}
                      onChangeText={(txt) => updateProfileField('birthOrder', txt)}
                      placeholder="எ.கா: 1, 2, 3 அல்லது மூத்தவர்"
                    />
                  </View>

                  {/* Dynamic Siblings List */}
                  <View style={styles.siblingsSection}>
                    <View style={styles.siblingsHeaderRow}>
                      <Text style={styles.siblingsTitle}>
                        உடன்பிறப்புகள் ({activeProfile.siblings.length}):
                      </Text>
                      <TouchableOpacity onPress={addSibling} style={styles.addSiblingBtn}>
                        <MaterialCommunityIcons name="plus-circle" size={16} color="#991B1B" />
                        <Text style={styles.addSiblingBtnText}>உடன்பிறப்பைச் சேர்க்க</Text>
                      </TouchableOpacity>
                    </View>

                    {activeProfile.siblings.map((sib, sIndex) => (
                      <View key={sib.id} style={styles.siblingRowCard}>
                        <View style={styles.rowTwoCols}>
                          <TextInput
                            style={[styles.fieldInput, styles.flex1]}
                            value={sib.relation}
                            onChangeText={(txt) => updateSibling(sib.id, 'relation', txt)}
                            placeholder="உறவு (அண்ணன்/தம்பி/அக்கா/தங்கை)"
                          />
                          <TextInput
                            style={[styles.fieldInput, styles.flex1]}
                            value={sib.maritalStatus}
                            onChangeText={(txt) => updateSibling(sib.id, 'maritalStatus', txt)}
                            placeholder="திருமண நிலை"
                          />
                          <TouchableOpacity
                            onPress={() => removeSibling(sib.id)}
                            style={styles.removeSiblingBtn}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Optional Assets Toggle */}
                  <View style={styles.assetsToggleRow}>
                    <TouchableOpacity
                      onPress={() => updateProfileField('showAssets', !activeProfile.showAssets)}
                      style={styles.checkboxTouch}
                    >
                      <MaterialCommunityIcons
                        name={activeProfile.showAssets ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={20}
                        color="#991B1B"
                      />
                      <Text style={styles.checkboxLabel}>
                        சொத்து விவரங்களை பயோடேட்டாவில் காட்டவும் (Show Assets)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {activeProfile.showAssets && (
                    <View style={styles.assetsDetailsBox}>
                      <TextInput
                        style={[styles.fieldInput, { height: 50 }]}
                        multiline
                        value={activeProfile.assetsDescription}
                        onChangeText={(txt) => updateProfileField('assetsDescription', txt)}
                        placeholder="சொத்து விவரங்களை உள்ளிடவும் (வீடு, நிலம், வாகனங்கள்...)"
                      />
                    </View>
                  )}

                  {/* Contact Details */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>தொலைபேசி எண்கள் (Phone Numbers):</Text>
                    <View style={styles.rowTwoCols}>
                      <TextInput
                        style={[styles.fieldInput, styles.flex1]}
                        value={activeProfile.parentsContact}
                        onChangeText={(txt) => updateProfileField('parentsContact', txt)}
                        placeholder="முக்கிய எண் (+91...)"
                        keyboardType="phone-pad"
                      />
                      <TextInput
                        style={[styles.fieldInput, styles.flex1]}
                        value={activeProfile.contactNumber2}
                        onChangeText={(txt) => updateProfileField('contactNumber2', txt)}
                        placeholder="கூடுதல் எண்"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>முழு முகவரி (Residential Address):</Text>
                    <TextInput
                      style={[styles.fieldInput, { height: 55 }]}
                      multiline
                      value={activeProfile.residentialAddress}
                      onChangeText={(txt) => updateProfileField('residentialAddress', txt)}
                      placeholder="கதவு எண், தெரு, ஊர், பின்கோடு"
                    />
                  </View>
                </View>

                {/* Continue to Step 2 Button */}
                <TouchableOpacity
                  onPress={() => setWorkflowStep(2)}
                  style={styles.nextStepBtn}
                >
                  <Text style={styles.nextStepBtnText}>அடுத்த படி: ஜாதக விவரங்கள் (Next: Horoscope) →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: HOROSCOPE DETAILS & EDITABLE CHARTS */}
            {workflowStep === 2 && (
              <View>
                {/* Sun Mahadasha Balance */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardHeading}>சூரிய மகா திசை இருப்பு (Sun Mahadasha Balance):</Text>
                  <Text style={styles.formCardSub}>பிறக்கும் போது உள்ள சூரிய திசை இருப்பு கால அளவு</Text>
                  <View style={styles.rowTwoCols}>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>வருடம் (Years):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.sunMahadashaYears}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateProfileField('sunMahadashaYears', txt)}
                        placeholder="3"
                      />
                    </View>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>மாதம் (Months):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.sunMahadashaMonths}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateProfileField('sunMahadashaMonths', txt)}
                        placeholder="4"
                      />
                    </View>
                    <View style={[styles.formField, styles.flex1]}>
                      <Text style={styles.fieldLabel}>நாள் (Days):</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={activeProfile.sunMahadashaDays}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateProfileField('sunMahadashaDays', txt)}
                        placeholder="12"
                      />
                    </View>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>தோஷம் (Dosham):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={activeProfile.dosham}
                      onChangeText={(txt) => updateProfileField('dosham', txt)}
                      placeholder="தோஷம் ஏதுமில்லை (சுத்த ஜாதகம்) / செவ்வாய் தோஷம்"
                    />
                  </View>
                </View>

                {/* Nakshatra, Paatham & Rasi Validator Picker */}
                <NakshatraRasiPicker
                  selectedNakshatra={activeProfile.nakshatram}
                  selectedPaatham={activeProfile.padham}
                  selectedRasi={activeProfile.rasi}
                  selectedLagnam={activeProfile.lagnam}
                  onChangeNakshatra={(n) => updateProfileField('nakshatram', n)}
                  onChangePaatham={(p) => updateProfileField('padham', p)}
                  onChangeRasi={(r) => updateProfileField('rasi', r)}
                  onChangeLagnam={(l) => updateProfileField('lagnam', l)}
                />

                {/* Editable 12-Box Rasi Chart */}
                <View style={styles.formCard}>
                  <EditableChart
                    chartTitle="ராசி கட்டம்"
                    chartData={activeProfile.rasiChart}
                    onChangeHouse={(house, planets) => {
                      updateProfileField('rasiChart', {
                        ...activeProfile.rasiChart,
                        [house]: planets,
                      });
                    }}
                    accentColor="#991B1B"
                  />
                </View>

                {/* Editable 12-Box Navamsa Chart */}
                <View style={styles.formCard}>
                  <EditableChart
                    chartTitle="நவாம்சம் கட்டம்"
                    chartData={activeProfile.navamsamChart}
                    onChangeHouse={(house, planets) => {
                      updateProfileField('navamsamChart', {
                        ...activeProfile.navamsamChart,
                        [house]: planets,
                      });
                    }}
                    accentColor="#1E3A8A"
                  />
                </View>

                {/* Stepper Navigation Buttons */}
                <View style={styles.stepperNavRow}>
                  <TouchableOpacity
                    onPress={() => setWorkflowStep(1)}
                    style={styles.backStepBtn}
                  >
                    <Text style={styles.backStepBtnText}>← முந்தைய படி</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setWorkflowStep(3)}
                    style={styles.forwardStepBtn}
                  >
                    <Text style={styles.forwardStepBtnText}>அடுத்த படி: வார்ப்புரு →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: PHOTO & TEMPLATES & GEMINI TUNER */}
            {workflowStep === 3 && (
              <View>
                {/* Photoshop Studio Photo Management Component */}
                <PhotoEditor
                  biodata={activeProfile}
                  onChangeBiodata={updateProfileField}
                  isDarkMode={isDarkMode}
                />

                {/* Template Gallery with 8 Matrimonial Designs */}
                <TemplateGallery
                  selectedTemplateId={activeProfile.templateId}
                  candidateGender={activeProfile.gender}
                  candidateProfile={activeProfile}
                  onSelectTemplate={(tplId) => updateProfileField('templateId', tplId)}
                  isDarkMode={isDarkMode}
                />

                {/* Gemini AI Bio Fine-Tuner */}
                <GeminiBioTuner
                  biodata={activeProfile}
                  onApplyBio={(field, text) => updateProfileField(field, text)}
                />

                {/* Stepper Navigation Buttons */}
                <View style={styles.stepperNavRow}>
                  <TouchableOpacity
                    onPress={() => setWorkflowStep(2)}
                    style={styles.backStepBtn}
                  >
                    <Text style={styles.backStepBtnText}>← ஜாதகம்</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      await handleSaveActiveProfile();
                      setWorkflowStep(4);
                    }}
                    style={styles.forwardStepBtn}
                  >
                    <Text style={styles.forwardStepBtnText}>முன்னோட்டம் & அச்சிடு →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 4: PREVIEW & GENUINE PDF / IMAGE EXPORT */}
            {workflowStep === 4 && (
              <View>
                {/* Action Toolbar - 2 Rows to Prevent UI Overflow/Bleeding */}
                <View style={styles.previewActionBar}>
                  <View style={styles.previewActionRow1}>
                    <TouchableOpacity
                      onPress={handleExportPdf}
                      disabled={isExportingPdf}
                      style={styles.exportPdfBigBtn}
                    >
                      <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FFFFFF" />
                      <Text style={styles.exportPdfBigBtnText}>
                        {isExportingPdf ? 'PDF உருவாக்கப்படுகிறது...' : 'PDF அச்சிடு (A4)'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowImageSaveModal(true)}
                      disabled={isExportingImage}
                      style={styles.exportImageBtn}
                    >
                      <MaterialCommunityIcons name="image" size={18} color="#FFFFFF" />
                      <Text style={styles.exportImageBtnText}>
                        {isExportingImage ? 'சேமிக்கப்படுகிறது...' : 'படமாகச் சேமிக்க'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={async () => {
                      await handleSaveActiveProfile();
                      Alert.alert('வெற்றி', 'வரன் விபரம் வெற்றிகரமாக சேமிக்கப்பட்டது!');
                      setCurrentScreen('dashboard');
                    }}
                    style={styles.saveDashboardBtn}
                  >
                    <MaterialCommunityIcons name="content-save-check" size={18} color="#15803D" />
                    <Text style={styles.saveDashboardBtnText}>சேமித்து முடிக்க (Dashboard)</Text>
                  </TouchableOpacity>
                </View>

                {/* Rendered Template Preview */}
                <TemplateRenderer biodata={activeProfile} />
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* SCREEN 3: FULL SCREEN PREVIEW FROM DASHBOARD */}
      {currentScreen === 'preview' && (
        <View style={[styles.previewScreenContainer, isDarkMode && styles.containerDark]}>
          <View style={[styles.previewTopBar, isDarkMode && styles.topBarDark]}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('dashboard')}
              style={styles.backNavBtn}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={isDarkMode ? '#F59E0B' : '#111827'} />
              <Text style={[styles.backNavText, isDarkMode && styles.textWhite]}>முகப்பு</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setShowImageSaveModal(true)}
                disabled={isExportingImage}
                style={styles.imageActionHeaderBtn}
              >
                <MaterialCommunityIcons name="image" size={17} color="#FFFFFF" />
                <Text style={styles.printActionHeaderText}>
                  {isExportingImage ? '...' : 'படமாகச் சேமி'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={isExportingPdf}
                style={styles.printActionHeaderBtn}
              >
                <MaterialCommunityIcons name="printer" size={17} color="#FFFFFF" />
                <Text style={styles.printActionHeaderText}>
                  {isExportingPdf ? '...' : 'PDF அச்சிடு'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewScrollContent}>
            <TemplateRenderer biodata={activeProfile} />
          </ScrollView>
        </View>
      )}

      {/* Modal for Saving as Image with Custom Folder Setting */}
      <Modal
        visible={showImageSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageSaveModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.imageSaveModalCard, isDarkMode && styles.modalDark]}>
            <View style={styles.modalHeaderRow}>
              <MaterialCommunityIcons name="folder-image" size={24} color="#D97706" />
              <Text style={[styles.modalTitleText, isDarkMode && styles.textWhite]}>
                பயோடேட்டாவை படமாகச் சேமிக்க
              </Text>
            </View>
            <Text style={[styles.modalSubText, isDarkMode && styles.textMutedDark]}>
              ஆண்ட்ராய்டு கேலரியில் பயோடேட்டா உயர்தர (PNG/JPG) படமாக ஒரே பக்கத்தில் சேமிக்கப்படும்.
            </Text>

            <View style={{ marginVertical: 14 }}>
              <Text style={[styles.fieldLabel, isDarkMode && styles.textWhite]}>
                சேமிக்கும் கோப்புறை (Target Folder):
              </Text>
              <TextInput
                style={[styles.fieldInput, isDarkMode && styles.inputDark]}
                value={customFolder}
                onChangeText={setCustomFolder}
                placeholder="எ.கா: Pictures/TamilMarriageBiodata"
              />
              <Text style={[styles.helperText, isDarkMode && styles.textMutedDark]}>
                விருப்பமான கோப்புறைப் பெயரை மாற்றியமைக்கலாம்
              </Text>
            </View>

            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowImageSaveModal(false)}
                style={[styles.modalCancelBtn, isDarkMode && styles.btnDark]}
              >
                <Text style={[styles.modalCancelBtnText, isDarkMode && styles.textWhite]}>ரத்து செய்</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  setShowImageSaveModal(false);
                  await handleExportImage();
                }}
                disabled={isExportingImage}
                style={styles.modalConfirmSaveBtn}
              >
                <MaterialCommunityIcons name="download" size={18} color="#FFFFFF" />
                <Text style={styles.modalConfirmSaveBtnText}>படமாகப் பதிவிறக்கு</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings & Backup Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onRefreshProfiles={refreshProfilesList}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backStepHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  backStepHeaderBtnDark: {
    backgroundColor: '#78350F',
  },
  backStepHeaderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#991B1B',
  },
  appIconLogo: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  appTitleMain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
  },
  appSubMain: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  bodyWrapper: {
    flex: 1,
    padding: 16,
  },
  workflowContainer: {
    flex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  stepItemActive: {},
  stepItemCompleted: {},
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#991B1B',
  },
  stepBadgeCompleted: {
    backgroundColor: '#15803D',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepTitleActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  workflowScroll: {
    flex: 1,
  },
  workflowScrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formCardHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  formCardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  formField: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  fieldInput: {
    height: 40,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#111827',
  },
  inputWithMic: {
    position: 'relative',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  genderChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  genderChoiceGroomActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  genderChoiceBrideActive: {
    backgroundColor: '#831843',
    borderColor: '#831843',
  },
  genderChoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  genderChoiceTextActive: {
    color: '#FFFFFF',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeInputField: {
    flex: 1,
    minWidth: 0,
  },
  amPmToggleBtn: {
    width: 52,
    height: 40,
    flexShrink: 0,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amPmToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  photoUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  photoPreviewBox: {
    width: 72,
    height: 86,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  photoUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoStudioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    borderRadius: 6,
  },
  photoStudioBtnText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
  },
  photoDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  photoDeleteBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  periodBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
  },
  periodBtnActive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  periodBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clearFieldText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  foodHabitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodHabitBtn: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  foodHabitBtnActive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  foodHabitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  foodHabitBtnTextActive: {
    color: '#FFFFFF',
  },
  siblingsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  siblingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  siblingsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  addSiblingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSiblingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  siblingRowCard: {
    marginBottom: 6,
  },
  removeSiblingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  assetsToggleRow: {
    marginVertical: 8,
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  assetsDetailsBox: {
    marginBottom: 10,
  },
  nextStepBtn: {
    backgroundColor: '#991B1B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  nextStepBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepperNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  backStepBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backStepBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  forwardStepBtn: {
    flex: 1.5,
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  forwardStepBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  previewActionBar: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  previewActionRow1: {
    flexDirection: 'row',
    gap: 8,
  },
  exportPdfBigBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  exportPdfBigBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  saveDashboardBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    paddingVertical: 11,
    borderRadius: 10,
  },
  saveDashboardBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  previewScreenContainer: {
    flex: 1,
  },
  previewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  printActionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  printActionHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  imageActionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportImageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  exportImageBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    padding: 14,
    paddingBottom: 40,
  },

  /* Dark Mode Theming */
  containerDark: {
    backgroundColor: '#0F172A',
  },
  topBarDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  iconBtnDark: {
    backgroundColor: '#334155',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  inputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  btnDark: {
    backgroundColor: '#334155',
  },

  /* Image Save Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageSaveModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalSubText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalConfirmSaveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#D97706',
  },
  modalConfirmSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
