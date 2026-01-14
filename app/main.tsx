import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Calendar,
  Bell,
  Briefcase,
  Home,
  MessageCircle,
  Search,
  ClipboardList,
  ChevronRight,
  MapPin,
} from "lucide-react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { AnimatedSphere } from "@/components/AnimatedSphere";
import { AnimatedParticles } from "@/components/AnimatedParticles";
import { AnimatedWaves } from "@/components/AnimatedWaves";
import { AnimatedCubes } from "@/components/AnimatedCubes";
import { AnimatedRings } from "@/components/AnimatedRings";
import { AnimatedLines } from "@/components/AnimatedLines";
import { AnimatedStars } from "@/components/AnimatedStars";
import { AnimatedGradientFlow } from "@/components/AnimatedGradientFlow";
import { AnimatedSparkles } from "@/components/AnimatedSparkles";
import { AnimatedHexagons } from "@/components/AnimatedHexagons";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { OrderModal } from "@/components/modals/OrderModal";
import { CityChatModal } from "@/components/modals/CityChatModal";
import { AIAssistantModal, AIAction } from "@/components/modals/AIAssistantModal";
import { FindOrdersModal } from "@/components/modals/FindOrdersModal";
import { MessengerModal } from "@/components/modals/MessengerModal";
import { BookingModal } from "@/components/modals/BookingModal";
import { ServiceAdsModal } from "@/components/modals/ServiceAdsModal";
import { WalletModal } from "@/components/modals/WalletModal";
import { MapModal } from "@/components/modals/MapModal";
import { DailyCheckinModal } from "@/components/modals/DailyCheckinModal";
import { useQuery } from "@tanstack/react-query";


const { width, height } = Dimensions.get("window");

type MenuItemType =
  | "order"
  | "booking"
  | "ads"
  | "chat"
  | "messenger"
  | "wallet"
  | "findOrders"
  | "myOrders"
  | "myAds"
  | "news";



export default function MainScreen() {
  const { currentTheme, t, city, reminders, customBackground, backgroundOverlay, animationType, lastAICheckin, aiCheckinEnabled, isLoaded } = useAppState();
  const insets = useSafeAreaInsets();
  const [activeMode, setActiveMode] = useState<"services" | "work">("services");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<MenuItemType | null>(null);
  const [aiOrderData, setAiOrderData] = useState<any>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [dailyCheckinOpen, setDailyCheckinOpen] = useState(false);
  const [checkinTriggered, setCheckinTriggered] = useState(false);


  const { data: weather } = useQuery({
    queryKey: ["weather", city.name],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
        );
        const data = await response.json();
        return {
          temp: Math.round(data.current_weather.temperature),
        };
      } catch (error) {
        console.log("Weather fetch error:", error);
        return { temp: 0 };
      }
    },
    refetchInterval: 600000,
  });

  const dateLabel = useMemo(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }, []);

  useEffect(() => {
    if (!isLoaded || !aiCheckinEnabled || checkinTriggered) return;
    
    const shouldShowCheckin = () => {
      if (!lastAICheckin) return true;
      
      const lastCheckin = new Date(lastAICheckin);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60);
      
      return hoursDiff >= 12;
    };
    
    if (shouldShowCheckin()) {
      const timer = setTimeout(() => {
        setDailyCheckinOpen(true);
        setCheckinTriggered(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, aiCheckinEnabled, lastAICheckin, checkinTriggered]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === "web") {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setUserLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.log("Geolocation error:", error);
              }
            );
          }
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      } catch (error) {
        console.log("Location error:", error);
      }
    };

    getLocation();
  }, []);



  const handleMenuPress = (id: MenuItemType) => {
    setActiveModal(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {customBackground ? (
        <ImageBackground
          source={{ uri: customBackground }}
          style={styles.gradient}
          imageStyle={{ opacity: 1 }}
          resizeMode="cover"
        >
          {backgroundOverlay !== "none" && (
            <View style={[
              styles.overlayLayer,
              backgroundOverlay === "dark" && styles.overlayDark,
              backgroundOverlay === "light" && styles.overlayLight,
              backgroundOverlay === "blur" && styles.overlayBlur,
            ]} />
          )}
          {renderContent()}
        </ImageBackground>
      ) : (
        <View style={styles.gradient}>
          <LinearGradient
            colors={currentTheme.gradient as any}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {renderContent()}
        </View>
      )}
    </View>
  );

  function renderContent() {
    return (
      <>
        {animationType !== "none" && (
          <View style={styles.animationLayer} pointerEvents="none">
            {animationType === "sphere" && (
              <View style={styles.sphereAnimation}>
                <AnimatedSphere size={300} colors={[currentTheme.accent, currentTheme.neon] as any} />
              </View>
            )}
            {animationType === "particles" && <AnimatedParticles color={currentTheme.neon} />}
            {animationType === "waves" && <AnimatedWaves color={currentTheme.accent} />}
            {animationType === "cubes" && <AnimatedCubes color={currentTheme.neon} />}
            {animationType === "rings" && <AnimatedRings color={currentTheme.accent} />}
            {animationType === "lines" && <AnimatedLines color={currentTheme.neon} />}
            {animationType === "stars" && <AnimatedStars color={currentTheme.accent} />}
            {animationType === "gradientFlow" && <AnimatedGradientFlow color={currentTheme.neon} />}
            {animationType === "sparkles" && <AnimatedSparkles color={currentTheme.accent} />}
            {animationType === "hexagons" && <AnimatedHexagons color={currentTheme.neon} />}
          </View>
        )}

        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}
          edges={['top', 'left', 'right']}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 50 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: currentTheme.neon }]} testID="title-gidcity">
                  {t.gidCity}
                </Text>
                <Text style={styles.cityText} testID="city-label">
                  {city.name}
                  {weather ? ` • ${weather.temp}°C` : ""}
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.calendarChip}
                  onPress={() => setCalendarOpen(true)}
                  activeOpacity={0.8}
                  testID="calendar-button"
                >
                  <Calendar size={14} color={currentTheme.neon} />
                  <Text style={[styles.calendarText, { color: currentTheme.neon }]}>{dateLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={() => setNotificationsOpen(true)}
                  activeOpacity={0.8}
                  testID="notifications-button"
                >
                  <Bell size={16} color={currentTheme.accent} />
                  {reminders.length > 0 && (
                    <View style={[styles.badge, { backgroundColor: currentTheme.accent }]}>
                      <Text style={styles.badgeText}>{reminders.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={() => setSettingsOpen(true)}
                  activeOpacity={0.8}
                  testID="settings-button"
                >
                  <Settings size={16} color={currentTheme.neon} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.aiMainButton}
              activeOpacity={0.85}
              onPress={() => setAiAssistantOpen(true)}
              testID="ai-assistant-main"
            >
              <ImageBackground
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/s00togqz2vrsgw7gzi3og' }}
                style={styles.aiButtonBg}
                imageStyle={styles.aiButtonImage}
                resizeMode="cover"
              >
                <View style={styles.aiButtonOverlay}>
                  <View style={styles.aiButtonTextContainer}>
                    <Text style={styles.aiButtonTitle} numberOfLines={1}>
                      {t.aiAssistant.toUpperCase()} ARIA
                    </Text>
                    <Text style={styles.aiButtonSubtitle} numberOfLines={1}>
                      {t.askGidAssistant}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <View style={styles.modeSwitcher}>
              <TouchableOpacity
                style={[styles.modeButton, activeMode === "services" && [styles.modeButtonActive, {
                  backgroundColor: currentTheme.accent + "30",
                }]]}
                onPress={() => setActiveMode("services")}
                activeOpacity={0.8}
                testID="mode-services"
              >
                <Home size={18} color={activeMode === "services" ? currentTheme.accent : "rgba(255,255,255,0.5)"} />
                <Text style={[
                  styles.modeText,
                  activeMode === "services" && [styles.modeTextActive, { color: currentTheme.accent }],
                  activeMode !== "services" && styles.modeTextInactive,
                ]} numberOfLines={1}>
                  {t.services}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, activeMode === "work" && [styles.modeButtonActive, {
                  backgroundColor: currentTheme.accent + "30",
                }]]}
                onPress={() => setActiveMode("work")}
                activeOpacity={0.8}
                testID="mode-work"
              >
                <Briefcase size={18} color={activeMode === "work" ? currentTheme.accent : "rgba(255,255,255,0.5)"} />
                <Text style={[
                  styles.modeText,
                  activeMode === "work" && [styles.modeTextActive, { color: currentTheme.accent }],
                  activeMode !== "work" && styles.modeTextInactive,
                ]} numberOfLines={1}>
                  {t.work}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainButtonsContainer}>
              {activeMode === "services" ? (
                <>
                  <TouchableOpacity
                    style={styles.tallButton}
                    activeOpacity={0.8}
                    onPress={() => handleMenuPress("chat")}
                    testID="chat-button"
                  >
                    <ImageBackground
                      source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/u8smzfoyhq46ob7y2j6wr' }}
                      style={styles.bookingButtonBg}
                      imageStyle={styles.bookingButtonImage}
                      resizeMode="cover"
                    >
                      <View style={styles.bookingOverlay}>
                        <View style={styles.bookingTextContainer}>
                          <Text style={styles.tallButtonTitle} numberOfLines={1}>
                            ГОРОДСКОЙ ЧАТ
                          </Text>
                          <Text style={styles.buttonDescription} numberOfLines={1}>
                            {t.cityChatDesc}
                          </Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tallButton}
                    activeOpacity={0.8}
                    onPress={() => handleMenuPress("order")}
                    testID="order-button"
                  >
                    <ImageBackground
                      source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/l07d1tvcealiqgf2shad2' }}
                      style={styles.bookingButtonBg}
                      imageStyle={styles.bookingButtonImage}
                      resizeMode="cover"
                    >
                      <View style={styles.bookingOverlay}>
                        <View style={styles.bookingTextContainer}>
                          <Text style={styles.tallButtonTitle} numberOfLines={1}>
                            ЗАКАЗАТЬ
                          </Text>
                          <Text style={styles.buttonDescription} numberOfLines={1}>
                            {t.orderDesc}
                          </Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tallButton}
                    activeOpacity={0.8}
                    onPress={() => handleMenuPress("booking")}
                    testID="booking-button"
                  >
                    <ImageBackground
                      source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/6hyar3k1zdowxcp3ydhe4' }}
                      style={styles.bookingButtonBg}
                      imageStyle={styles.bookingButtonImage}
                      resizeMode="cover"
                    >
                      <View style={styles.bookingOverlay}>
                        <View style={styles.bookingTextContainer}>
                          <Text style={styles.tallButtonTitle} numberOfLines={1}>
                            ЗАБРОНИРОВАТЬ
                          </Text>
                          <Text style={styles.buttonDescription} numberOfLines={1}>
                            Забронируйте столик или услугу
                          </Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>

                  <View style={styles.bottomButtonsRow}>
                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("ads")}
                      testID="ads-button"
                    >
                      <ImageBackground
                        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w99vlp3w73cnr9w2c6dr2' }}
                        style={styles.walletButtonBg}
                        imageStyle={styles.walletButtonImageTransparent}
                        resizeMode="cover"
                      >
                        <View style={styles.walletTransparentOverlay}>
                          <View style={styles.walletTextOverlayTransparent}>
                            <Text style={styles.walletTitle} numberOfLines={1}>
                              {t.serviceAds}
                            </Text>
                            <Text style={styles.walletDesc} numberOfLines={1}>
                              {t.serviceAdsDesc}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("messenger")}
                      testID="messenger-button"
                    >
                      <ImageBackground
                        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qtdh3bloqsf4rlnegm5ng' }}
                        style={styles.walletButtonBg}
                        imageStyle={styles.walletButtonImageTransparent}
                        resizeMode="cover"
                      >
                        <View style={styles.walletTransparentOverlay}>
                          <View style={styles.walletTextOverlayTransparent}>
                            <Text style={styles.walletTitle} numberOfLines={1}>
                              {t.messenger}
                            </Text>
                            <Text style={styles.walletDesc} numberOfLines={1}>
                              {t.messengerDesc}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("wallet")}
                      testID="wallet-button"
                    >
                      <ImageBackground
                        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/y1t9nmlp9bssi1pvuecw0' }}
                        style={styles.walletButtonBg}
                        imageStyle={styles.walletButtonImageTransparent}
                        resizeMode="contain"
                      >
                        <View style={styles.walletTransparentOverlay}>
                          <View style={styles.walletTextOverlayTransparent}>
                            <Text style={styles.walletTitle} numberOfLines={1}>
                              {t.wallet}
                            </Text>
                            <Text style={styles.walletDesc} numberOfLines={1}>
                              {t.walletDesc}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.mapPreview}
                    activeOpacity={0.8}
                    onPress={() => setMapOpen(true)}
                    testID="map-preview"
                  >
                    <View style={styles.mapPreviewInner}>
                      {userLocation && Platform.OS !== "web" ? (
                        <MapView
                          style={styles.mapPreviewMap}
                          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          rotateEnabled={false}
                          pitchEnabled={false}
                          region={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                        >
                          <Marker coordinate={userLocation} />
                        </MapView>
                      ) : (
                        <View style={styles.mapPlaceholder}>
                          <View style={[styles.mapIconContainer, { backgroundColor: currentTheme.accent + "30" }]}>
                            <MapPin size={24} color={currentTheme.accent} strokeWidth={2} />
                          </View>
                        </View>
                      )}
                      <View style={styles.mapOverlay}>
                        <Text style={styles.mapPreviewText}>{t.viewMap || "View Map"}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.tallButton}
                    activeOpacity={0.8}
                    onPress={() => handleMenuPress("findOrders")}
                    testID="find-orders-button"
                  >
                    <View style={styles.frostedButtonInner}>
                      <View style={styles.buttonContentRow}>
                        <View style={[styles.serviceIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.3)" }]}>
                          <Search size={22} color="#10b981" strokeWidth={2} />
                        </View>
                        <View style={styles.buttonTextContainer}>
                          <Text style={styles.tallButtonTitle} numberOfLines={1}>
                            {t.findOrders}
                          </Text>
                          <Text style={styles.buttonDescription} numberOfLines={1}>
                            {t.findOrdersDesc}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tallButton}
                    activeOpacity={0.8}
                    onPress={() => handleMenuPress("myOrders")}
                    testID="my-orders-button"
                  >
                    <View style={styles.frostedButtonInner}>
                      <View style={styles.buttonContentRow}>
                        <View style={[styles.serviceIconContainer, { backgroundColor: "rgba(168, 85, 247, 0.25)" }]}>
                          <ClipboardList size={22} color="#a855f7" strokeWidth={2} />
                        </View>
                        <View style={styles.buttonTextContainer}>
                          <Text style={styles.tallButtonTitle} numberOfLines={1}>
                            {t.myOrders}
                          </Text>
                          <Text style={styles.buttonDescription} numberOfLines={1}>
                            {t.myOrdersDesc}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.bottomButtonsRow}>
                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("chat")}
                      testID="chat-button-work"
                    >
                      <View style={styles.frostedRectInner}>
                        <View style={[styles.smallIconContainer, { backgroundColor: "rgba(96, 165, 250, 0.2)" }]}>
                          <MessageCircle size={18} color="#60a5fa" strokeWidth={2} />
                        </View>
                        <Text style={styles.rectTitle} numberOfLines={1}>
                          {t.cityChat}
                        </Text>
                        <Text style={styles.rectDesc} numberOfLines={1}>
                          {t.cityChatDesc}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("messenger")}
                      testID="messenger-button-work"
                    >
                      <ImageBackground
                        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qtdh3bloqsf4rlnegm5ng' }}
                        style={styles.walletButtonBg}
                        imageStyle={styles.walletButtonImageTransparent}
                        resizeMode="cover"
                      >
                        <View style={styles.walletTransparentOverlay}>
                          <View style={styles.walletTextOverlayTransparent}>
                            <Text style={styles.walletTitle} numberOfLines={1}>
                              {t.messenger}
                            </Text>
                            <Text style={styles.walletDesc} numberOfLines={1}>
                              {t.messengerDesc}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rectButton}
                      activeOpacity={0.8}
                      onPress={() => handleMenuPress("wallet")}
                      testID="wallet-button-work"
                    >
                      <ImageBackground
                        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/y1t9nmlp9bssi1pvuecw0' }}
                        style={styles.walletButtonBg}
                        imageStyle={styles.walletButtonImageTransparent}
                        resizeMode="contain"
                      >
                        <View style={styles.walletTransparentOverlay}>
                          <View style={styles.walletTextOverlayTransparent}>
                            <Text style={styles.walletTitle} numberOfLines={1}>
                              {t.wallet}
                            </Text>
                            <Text style={styles.walletDesc} numberOfLines={1}>
                              {t.walletDesc}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.mapPreview}
                    activeOpacity={0.8}
                    onPress={() => setMapOpen(true)}
                    testID="map-preview-work"
                  >
                    <View style={styles.mapPreviewInner}>
                      {userLocation && Platform.OS !== "web" ? (
                        <MapView
                          style={styles.mapPreviewMap}
                          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          rotateEnabled={false}
                          pitchEnabled={false}
                          region={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                        >
                          <Marker coordinate={userLocation} />
                        </MapView>
                      ) : (
                        <View style={styles.mapPlaceholder}>
                          <View style={[styles.mapIconContainer, { backgroundColor: currentTheme.accent + "30" }]}>
                            <MapPin size={24} color={currentTheme.accent} strokeWidth={2} />
                          </View>
                        </View>
                      )}
                      <View style={styles.mapOverlay}>
                        <Text style={styles.mapPreviewText}>{t.viewMap || "View Map"}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                </>
              )}
            </View>

            <Text style={styles.footer}>{t.footer}</Text>
          </ScrollView>
        </SafeAreaView>

        <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <CalendarModal visible={calendarOpen} onClose={() => setCalendarOpen(false)} />
        <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        <AIAssistantModal
          visible={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          onAction={(action: AIAction) => {
            if (action.type === "order" && action.data) {
              setAiOrderData(action.data);
              setActiveModal("order");
              setAiAssistantOpen(false);
            } else if (
              action.type === "navigate" &&
              (action.data?.screen === "services" || action.data?.screen === "work")
            ) {
              setActiveMode(action.data.screen);
              setAiAssistantOpen(false);
            }
          }}
        />

        {activeModal === "order" && (
          <OrderModal
            visible
            onClose={() => {
              setActiveModal(null);
              setAiOrderData(null);
            }}
            prefilledData={aiOrderData}
          />
        )}
        {activeModal === "chat" && (
          <CityChatModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "findOrders" && (
          <FindOrdersModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "messenger" && (
          <MessengerModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "booking" && (
          <BookingModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "ads" && (
          <ServiceAdsModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "wallet" && (
          <WalletModal visible onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "myOrders" && (
          <OrderModal
            visible
            onClose={() => setActiveModal(null)}
            prefilledData={null}
          />
        )}
        <MapModal visible={mapOpen} onClose={() => setMapOpen(false)} />
        <DailyCheckinModal 
          visible={dailyCheckinOpen} 
          onClose={() => setDailyCheckinOpen(false)} 
        />

      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  gradientOverlay: {
    position: "absolute",
    width,
    height,
  },

  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  cityText: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  calendarText: {
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  badge: {
    position: "absolute" as const,
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: commonColors.white,
    fontSize: 10,
    fontWeight: "900" as const,
  },
  aiMainButton: {
    height: 90,
    borderRadius: 20,
    overflow: "hidden" as const,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 16,
  },
  aiButtonBg: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden" as const,
    justifyContent: "center" as const,
  },
  aiButtonImage: {
    borderRadius: 20,
    opacity: 0.95,
  },
  aiButtonOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  aiButtonTextContainer: {
    gap: 2,
    alignItems: "flex-end" as const,
  },
  aiButtonTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  aiButtonSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: -0.1,
  },
  modeSwitcher: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 3,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: "center",
    borderRadius: 10,
  },
  modeButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  modeTextActive: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modeTextInactive: {
    color: "rgba(255,255,255,0.5)",
  },
  mainButtonsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  tallButton: {
    height: 68,
    borderRadius: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  frostedButtonInner: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  buttonContentRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonTextContainer: {
    flex: 1,
    gap: 2,
  },
  tallButtonTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  buttonDescription: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: -0.1,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rectButton: {
    flex: 1,
    height: 82,
    borderRadius: 14,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  frostedRectInner: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  smallIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  walletCustomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  walletButtonBg: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden" as const,
    justifyContent: "flex-end" as const,
  },
  walletButtonImage: {
    borderRadius: 14,
  },
  walletButtonImageTransparent: {
    borderRadius: 14,
    opacity: 0.9,
  },
  walletTransparentOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    justifyContent: "flex-end" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  walletTextOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center" as const,
  },
  walletTextOverlayTransparent: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center" as const,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  walletTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
    textAlign: "center" as const,
  },
  walletDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontWeight: "500" as const,
    textAlign: "center" as const,
    letterSpacing: -0.1,
  },
  rectTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
    textAlign: "center" as const,
  },
  rectDesc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9,
    fontWeight: "500" as const,
    textAlign: "center" as const,
    letterSpacing: -0.1,
  },
  footer: {
    textAlign: "center" as const,
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    marginTop: 14,
    fontWeight: "400" as const,
    letterSpacing: 0.2,
  },
  mapPreview: {
    height: 140,
    borderRadius: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  mapPreviewInner: {
    flex: 1,
    position: "relative" as const,
  },
  mapPreviewMap: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  mapIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  mapOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mapPreviewText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    letterSpacing: -0.2,
  },
  overlayLayer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayDark: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayLight: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  overlayBlur: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  animationLayer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sphereAnimation: {
    position: "absolute" as const,
    top: -100,
    right: -100,
    opacity: 0.5,
  },
  bookingButtonBg: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden" as const,
    justifyContent: "center" as const,
  },
  bookingButtonImage: {
    borderRadius: 16,
    opacity: 0.95,
  },
  bookingOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  bookingTextContainer: {
    gap: 2,
    alignItems: "flex-end" as const,
  },
});
