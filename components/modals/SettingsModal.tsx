import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Palette, Languages, X, Check, Sparkles, Eye, MessageCircle } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { GlassCard } from "../GlassCard";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors, ThemeKey, themes } from "@/constants/colors";
import { cities } from "@/constants/cities";
import { Language } from "@/constants/translations";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type SettingsTab = "profile" | "city" | "theme" | "language";

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { currentTheme, t, profile, setProfile, city, setCity, theme, setTheme, language, setLanguage, customBackground, setCustomBackground, backgroundOverlay, setBackgroundOverlay, animationType, setAnimationType, glassOpacity, setGlassOpacity, aiCheckinEnabled, setAICheckinEnabled } = useAppState();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [localProfile, setLocalProfile] = useState(profile);
  const [localCity, setLocalCity] = useState(city);
  const [localTheme, setLocalTheme] = useState<ThemeKey>(theme);
  const [localLanguage, setLocalLanguage] = useState<Language>(language);
  const [localBackground, setLocalBackground] = useState(customBackground);
  const [localBackgroundOverlay, setLocalBackgroundOverlay] = useState(backgroundOverlay);
  const [localAnimationType, setLocalAnimationType] = useState(animationType);
  const [localGlassOpacity, setLocalGlassOpacity] = useState(glassOpacity);
  const [localAICheckinEnabled, setLocalAICheckinEnabled] = useState(aiCheckinEnabled);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: t.profile, icon: User },
    { id: "city", label: t.city, icon: MapPin },
    { id: "theme", label: t.theme, icon: Palette },
    { id: "language", label: t.language, icon: Languages },
  ];

  const handleSave = () => {
    setProfile(localProfile);
    setCity(localCity);
    setTheme(localTheme);
    setLanguage(localLanguage);
    setCustomBackground(localBackground);
    setBackgroundOverlay(localBackgroundOverlay);
    setAnimationType(localAnimationType);
    setGlassOpacity(localGlassOpacity);
    setAICheckinEnabled(localAICheckinEnabled);
    onClose();
  };

  const handleTabPress = (tab: SettingsTab) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <>
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.settings}</Text>

        <View style={styles.tabSwitcher}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const textColor = isActive 
              ? getContrastColor(currentTheme.accent)
              : commonColors.textSecondary;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  isActive && {
                    backgroundColor: currentTheme.accent,
                  },
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tabIconContainer}>
                  <Icon
                    size={18}
                    color={textColor}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: textColor },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.ScrollView
          style={[styles.content, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "profile" && (
            <View style={styles.section}>
              <View style={styles.avatarContainer}>
                {localProfile.avatar ? (
                  <Image
                    source={{ uri: localProfile.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <User size={40} color={commonColors.textSecondary} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      
                      if (permissionResult.status !== "granted") {
                        Alert.alert(t.uploadAvatar, "Permission to access camera roll is required!");
                        return;
                      }

                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.7,
                      });

                      if (!result.canceled && result.assets[0]) {
                        setLocalProfile({ ...localProfile, avatar: result.assets[0].uri });
                      }
                    } catch (error) {
                      console.error("Error picking image:", error);
                      Alert.alert("Error", "Failed to select image");
                    }
                  }}
                  style={[styles.uploadButton, { borderColor: currentTheme.neon }]}
                >
                  <Text style={[styles.uploadButtonText, { color: currentTheme.neon }]}>
                    {t.selectFromGallery}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.name}</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.name}
                  onChangeText={(text) =>
                    setLocalProfile({ ...localProfile, name: text })
                  }
                  placeholder={t.enterYourName}
                  placeholderTextColor={commonColors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.surname}</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.surname}
                  onChangeText={(text) =>
                    setLocalProfile({ ...localProfile, surname: text })
                  }
                  placeholder={t.enterYourSurname}
                  placeholderTextColor={commonColors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.phone}</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.phone}
                  onChangeText={(text) =>
                    setLocalProfile({ ...localProfile, phone: text })
                  }
                  placeholder={t.phonePlaceholder}
                  placeholderTextColor={commonColors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.aiCheckinSection}>
                <View style={styles.aiCheckinRow}>
                  <View style={styles.aiCheckinInfo}>
                    <MessageCircle size={18} color={currentTheme.accent} />
                    <View style={styles.aiCheckinTextContainer}>
                      <Text style={styles.aiCheckinTitle}>
                        {language === "ru" ? "Ежедневный чек-ин от Aria" : language === "kk" ? "Aria-дан күнделікті чек-ин" : "Daily check-in from Aria"}
                      </Text>
                      <Text style={styles.aiCheckinDesc}>
                        {language === "ru" ? "Aria будет писать вам каждый день" : language === "kk" ? "Aria күнде жазады" : "Aria will message you daily"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setLocalAICheckinEnabled(!localAICheckinEnabled)}
                    style={[
                      styles.aiCheckinToggle,
                      localAICheckinEnabled && { backgroundColor: currentTheme.accent },
                    ]}
                  >
                    {localAICheckinEnabled && <Check size={14} color="#ffffff" />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === "city" && (
            <View style={styles.section}>
              {cities.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => setLocalCity(c)}
                >
                  <GlassCard
                    style={[
                      styles.cityCard,
                      localCity.name === c.name && {
                        backgroundColor: currentTheme.accent + "20",
                      },
                    ]}
                    neonColor={localCity.name === c.name ? currentTheme.neon : undefined}
                  >
                    <Text
                      style={[
                        styles.cityName,
                        localCity.name === c.name && { color: currentTheme.neon },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "theme" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} numberOfLines={1}>{t.theme}</Text>
              <View style={styles.compactButtonsRow}>
                {Object.entries(themes).map(([key, themeData]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setLocalTheme(key as ThemeKey)}
                  >
                    <GlassCard
                      style={[
                        styles.themeCard,
                        localTheme === key && {
                          backgroundColor: currentTheme.accent + "20",
                        },
                      ]}
                      neonColor={localTheme === key ? currentTheme.neon : undefined}
                    >
                      <View style={styles.themePreview}>
                        {themeData.gradient.map((color, index) => (
                          <View
                            key={index}
                            style={[
                              styles.themeColor,
                              { backgroundColor: color },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.themeLabel,
                          localTheme === key && { color: themeData.neon },
                        ]}
                        numberOfLines={1}
                      >
                        {themeData.name}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.sectionTitle, { marginTop: 16 }]} numberOfLines={1}>{t.customBackground}</Text>
              {localBackground && (
                <View style={styles.backgroundPreview}>
                  <Image
                    source={{ uri: localBackground }}
                    style={styles.backgroundImage}
                  />
                  <TouchableOpacity
                    onPress={() => setLocalBackground(undefined)}
                    style={[styles.backgroundButton, { borderColor: currentTheme.neon }]}
                  >
                    <Text style={[styles.backgroundButtonText, { color: currentTheme.neon }]}>
                      {t.removeBackground}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.backgroundButtonsRow}>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      
                      if (permissionResult.status !== "granted") {
                        Alert.alert(t.customBackground, "Permission to access media library is required!");
                        return;
                      }

                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
                        allowsEditing: false,
                        quality: 0.8,
                      });

                      if (!result.canceled && result.assets[0]) {
                        setLocalBackground(result.assets[0].uri);
                      }
                    } catch (error) {
                      console.error("Error picking background:", error);
                      Alert.alert("Error", "Failed to select image");
                    }
                  }}
                  style={[styles.backgroundRowButton, { borderColor: currentTheme.neon }]}
                >
                  <Text style={[styles.backgroundRowButtonText, { color: currentTheme.neon }]} numberOfLines={1}>
                    {t.selectFromGallery}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowBackgroundModal(true)}
                  style={[styles.backgroundRowButton, { borderColor: currentTheme.neon }]}
                >
                  <Text style={[styles.backgroundRowButtonText, { color: currentTheme.neon }]} numberOfLines={1}>
                    {t.selectBackground}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.overlaySection}>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]} numberOfLines={1}>{t.backgroundOverlay}</Text>
                <View style={styles.overlayRow}>
                  <TouchableOpacity
                    style={[styles.overlayChip, localBackgroundOverlay === "none" && { backgroundColor: currentTheme.accent + "30", borderColor: currentTheme.accent }]}
                    onPress={() => setLocalBackgroundOverlay("none")}
                  >
                    {localBackgroundOverlay === "none" && <Check size={14} color={currentTheme.accent} />}
                    <Text style={[styles.overlayChipText, localBackgroundOverlay === "none" && { color: currentTheme.accent }]}>{t.none}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.overlayChip, localBackgroundOverlay === "dark" && { backgroundColor: currentTheme.accent + "30", borderColor: currentTheme.accent }]}
                    onPress={() => setLocalBackgroundOverlay("dark")}
                  >
                    {localBackgroundOverlay === "dark" && <Check size={14} color={currentTheme.accent} />}
                    <Text style={[styles.overlayChipText, localBackgroundOverlay === "dark" && { color: currentTheme.accent }]}>{t.darker}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.overlayChip, localBackgroundOverlay === "light" && { backgroundColor: currentTheme.accent + "30", borderColor: currentTheme.accent }]}
                    onPress={() => setLocalBackgroundOverlay("light")}
                  >
                    {localBackgroundOverlay === "light" && <Check size={14} color={currentTheme.accent} />}
                    <Text style={[styles.overlayChipText, localBackgroundOverlay === "light" && { color: currentTheme.accent }]}>{t.lighter}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.overlayChip, localBackgroundOverlay === "blur" && { backgroundColor: currentTheme.accent + "30", borderColor: currentTheme.accent }]}
                    onPress={() => setLocalBackgroundOverlay("blur")}
                  >
                    {localBackgroundOverlay === "blur" && <Check size={14} color={currentTheme.accent} />}
                    <Text style={[styles.overlayChipText, localBackgroundOverlay === "blur" && { color: currentTheme.accent }]}>{t.blurred}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={[styles.sectionTitle, { marginTop: 16 }]} numberOfLines={1}>{t.glassOpacity}</Text>
              <View style={styles.sliderSection}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>{t.transparent}</Text>
                  <Text style={styles.sliderValue}>{Math.round(localGlassOpacity * 100)}%</Text>
                  <Text style={styles.sliderLabel}>{t.opaque}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <View style={[styles.sliderTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <View 
                      style={[
                        styles.sliderFill, 
                        { 
                          width: `${(localGlassOpacity / 0.5) * 100}%`,
                          backgroundColor: currentTheme.accent + '80'
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.sliderButtonsRow}>
                    {[0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.35, 0.5].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.sliderDot,
                          localGlassOpacity === val && { backgroundColor: currentTheme.accent, borderColor: currentTheme.accent }
                        ]}
                        onPress={() => setLocalGlassOpacity(val)}
                      />
                    ))}
                  </View>
                </View>
                <View style={[styles.opacityPreview, { backgroundColor: `rgba(45, 45, 50, ${Math.min(localGlassOpacity * 3 + 0.3, 0.95)})` }]}>
                  <Eye size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.opacityPreviewText}>Preview</Text>
                </View>
              </View>
              
              <Text style={[styles.sectionTitle, { marginTop: 16 }]} numberOfLines={1}>{t.animation}</Text>
              <View style={styles.compactButtonsRow}>
                {[
                  { type: "none" as const, label: t.animationNone },
                  { type: "sphere" as const, label: t.animationSphere },
                  { type: "particles" as const, label: t.animationParticles },
                  { type: "waves" as const, label: t.animationWaves },
                  { type: "cubes" as const, label: t.animationCubes },
                  { type: "rings" as const, label: t.animationRings },
                  { type: "lines" as const, label: t.animationLines },
                  { type: "stars" as const, label: t.animationStars },
                  { type: "gradientFlow" as const, label: t.animationGradientFlow },
                  { type: "sparkles" as const, label: t.animationSparkles },
                  { type: "hexagons" as const, label: t.animationHexagons },
                ].map((anim) => (
                  <TouchableOpacity
                    key={anim.type}
                    onPress={() => setLocalAnimationType(anim.type)}
                  >
                    <GlassCard
                      style={[
                        styles.animationCard,
                        localAnimationType === anim.type && {
                          backgroundColor: currentTheme.accent + "20",
                        },
                      ]}
                      neonColor={localAnimationType === anim.type ? currentTheme.neon : undefined}
                    >
                      <Sparkles
                        size={14}
                        color={localAnimationType === anim.type ? currentTheme.neon : commonColors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.animationLabel,
                          localAnimationType === anim.type && { color: currentTheme.neon },
                        ]}
                        numberOfLines={1}
                      >
                        {anim.label}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeTab === "language" && (
            <View style={styles.section}>
              {[
                { code: "kk" as Language, name: "Қазақ тілі" },
                { code: "ru" as Language, name: "Русский" },
                { code: "en" as Language, name: "English" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setLocalLanguage(lang.code)}
                  style={styles.languageButtonWrapper}
                >
                  <GlassCard
                    style={[
                      styles.languageCard,
                      localLanguage === lang.code && {
                        backgroundColor: currentTheme.accent + "20",
                      },
                    ]}
                    neonColor={localLanguage === lang.code ? currentTheme.neon : undefined}
                  >
                    <Text
                      style={[
                        styles.languageName,
                        localLanguage === lang.code && { color: currentTheme.neon },
                      ]}
                      numberOfLines={1}
                    >
                      {lang.name}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.ScrollView>

        <View style={styles.actions}>
          <GlassButton
            title={t.cancel}
            onPress={onClose}
            variant="secondary"
            accentColor={commonColors.textSecondary}
            style={styles.actionButton}
          />
          <GlassButton
            title={t.save}
            onPress={handleSave}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.actionButton}
          />
        </View>
      </View>
    </GlassModal>

      {visible && <Modal
        visible={showBackgroundModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowBackgroundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.backgroundModalContent, { backgroundColor: currentTheme.gradient[1] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectBackground}</Text>
              <TouchableOpacity onPress={() => setShowBackgroundModal(false)}>
                <X size={24} color={commonColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={READY_MADE_BACKGROUNDS}
              numColumns={2}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.backgroundGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.backgroundItem}
                  onPress={() => {
                    setLocalBackground(item.url);
                    setShowBackgroundModal(false);
                  }}
                >
                  <Image source={{ uri: item.url }} style={styles.backgroundThumbnail} />
                  <Text style={styles.backgroundLabel} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>}
    </>
  );
}

const READY_MADE_BACKGROUNDS = [
  { id: "1", label: "Abstract Purple", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800" },
  { id: "2", label: "Blue Gradient", url: "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800" },
  { id: "3", label: "Cosmic", url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800" },
  { id: "4", label: "Dark Waves", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800" },
  { id: "5", label: "Neon City", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800" },
  { id: "6", label: "Pink Gradient", url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800" },
  { id: "7", label: "Mountain Dark", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
  { id: "8", label: "Abstract Green", url: "https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=800" },
];

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
  },
  tabSwitcher: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    minHeight: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    height: 16,
    width: 16,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "600" as const,
    color: commonColors.textSecondary,
    textAlign: "center" as const,
  },
  content: {
    height: 380,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    marginBottom: 4,
  },
  backgroundPreview: {
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  backgroundImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  backgroundButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  backgroundButtonText: {
    fontSize: 10,
    fontWeight: "500" as const,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  uploadButtonText: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    padding: 10,
    color: commonColors.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  cityCard: {
    padding: 10,
  },
  cityName: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  compactButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeCard: {
    padding: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  themePreview: {
    flexDirection: "row",
    gap: 2,
    flexShrink: 0,
  },
  themeColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  themeLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  backgroundButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  backgroundRowButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  backgroundRowButtonText: {
    fontSize: 10,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  languageButtonWrapper: {
    width: "100%",
    marginBottom: 2,
  },
  languageCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  languageName: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
    width: "100%",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    justifyContent: "flex-end",
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backgroundModalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  backgroundGrid: {
    gap: 12,
  },
  backgroundItem: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    overflow: "hidden" as const,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  backgroundThumbnail: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  backgroundLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  overlaySection: {
    marginTop: 10,
  },
  overlayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  overlayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  overlayChipText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  animationCard: {
    padding: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  animationLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  sliderSection: {
    gap: 8,
  },
  sliderLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  sliderLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  sliderValue: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  sliderContainer: {
    position: "relative" as const,
    height: 32,
    justifyContent: "center" as const,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    position: "absolute" as const,
    left: 0,
    right: 0,
  },
  sliderFill: {
    height: "100%" as const,
    borderRadius: 2,
  },
  sliderButtonsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    position: "absolute" as const,
    left: 0,
    right: 0,
  },
  sliderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  opacityPreview: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  opacityPreviewText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.8)",
  },
  aiCheckinSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  aiCheckinRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  aiCheckinInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  aiCheckinTextContainer: {
    flex: 1,
  },
  aiCheckinTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  aiCheckinDesc: {
    fontSize: 9,
    fontWeight: "400" as const,
    color: commonColors.textSecondary,
    marginTop: 2,
  },
  aiCheckinToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
