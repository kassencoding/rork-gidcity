import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Calendar,
  Bell,
  Briefcase,
  Home,
  Megaphone,
  Send,
  Wallet,
} from "lucide-react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { GlassSphere } from "@/components/GlassSphere";
import { ChromaticGlassCard } from "@/components/ChromaticGlassCard";
import { GlassTabButton } from "@/components/GlassTabButton";
import { GlassMapPanel } from "@/components/GlassMapPanel";
import { useAppState } from "@/contexts/AppStateContext";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const { reminders, city, lastAICheckin, aiCheckinEnabled, isLoaded } = useAppState();
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

  const defaultPos = { x: width - 76, y: height * 0.55 };
  const floatingPos = useRef(new Animated.ValueXY(defaultPos)).current;
  const floatingScale = useRef(new Animated.Value(1)).current;
  const isDragging = useRef(false);
  const lastPos = useRef({ ...defaultPos });
  const posLoaded = useRef(false);

  useEffect(() => {
    void AsyncStorage.getItem('ai_button_pos').then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { x: number; y: number };
          const safeX = Math.max(8, Math.min(width - 68, parsed.x));
          const safeY = Math.max(insets.top + 8, Math.min(height - 68 - insets.bottom, parsed.y));
          lastPos.current = { x: safeX, y: safeY };
          floatingPos.setValue({ x: safeX, y: safeY });
        } catch (e) {
          console.log('Failed to parse AI button position', e);
        }
      }
      posLoaded.current = true;
    });
  }, [insets.top, insets.bottom]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        isDragging.current = false;
        Animated.spring(floatingScale, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3) {
          isDragging.current = true;
        }
        const newX = Math.max(8, Math.min(width - 68, lastPos.current.x + gestureState.dx));
        const newY = Math.max(insets.top + 8, Math.min(height - 68 - insets.bottom, lastPos.current.y + gestureState.dy));
        floatingPos.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(floatingScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        const currentX = lastPos.current.x + gestureState.dx;
        const currentY = lastPos.current.y + gestureState.dy;
        const clampedY = Math.max(insets.top + 8, Math.min(height - 68 - insets.bottom, currentY));
        const snapX = currentX < width / 2 ? 8 : width - 68;
        lastPos.current = { x: snapX, y: clampedY };
        Animated.spring(floatingPos, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: true,
          friction: 7,
        }).start();
        AsyncStorage.setItem('ai_button_pos', JSON.stringify({ x: snapX, y: clampedY })).catch(() => {});
        if (!isDragging.current) {
          setAiAssistantOpen(true);
        }
      },
    })
  ).current;

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
        return { temp: 10 };
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

    void getLocation();
  }, []);

  const handleMenuPress = (id: MenuItemType) => {
    setActiveModal(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a0a2e", "#16213e", "#0f3460", "#1a5f7a"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LinearGradient
          colors={["rgba(138, 43, 226, 0.3)", "rgba(64, 224, 208, 0.2)", "transparent"]}
          style={styles.gradientOverlay}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
        
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]} edges={['top', 'left', 'right']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 50 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title} testID="title-gidcity">
                  GidCity
                </Text>
                <Text style={styles.cityText} testID="city-label">
                  Алматы • {weather?.temp || 10}°С
                </Text>
              </View>

              <View style={styles.headerActions}>
                <GlassSphere
                  size={42}
                  textContent={dateLabel}
                  textStyle={{ fontSize: 9, letterSpacing: 0 }}
                  onPress={() => setCalendarOpen(true)}
                />
                <GlassSphere
                  size={42}
                  icon={Bell}
                  badge={reminders.length > 0 ? reminders.length : undefined}
                  onPress={() => setNotificationsOpen(true)}
                />
                <GlassSphere
                  size={42}
                  icon={Settings}
                  onPress={() => setSettingsOpen(true)}
                />
              </View>
            </View>

            <View style={styles.modeSwitcher}>
              <GlassTabButton
                title="УСЛУГИ"
                icon={Home}
                isActive={activeMode === "services"}
                onPress={() => setActiveMode("services")}
              />
              <GlassTabButton
                title="РАБОТА"
                icon={Briefcase}
                isActive={activeMode === "work"}
                onPress={() => setActiveMode("work")}
              />
            </View>

            <View style={styles.mainButtonsContainer}>
              {activeMode === "services" ? (
                <>
                  <ChromaticGlassCard
                    title="ГОРОДСКОЙ ЧАТ"
                    description="Общайтесь с жителями города в реальном времени"
                    crystallineType="city"
                    onPress={() => handleMenuPress("chat")}
                  />

                  <ChromaticGlassCard
                    title="ЗАКАЗ"
                    description="Такси, доставка, курьер и услуги мастеров"
                    crystallineType="order"
                    onPress={() => handleMenuPress("order")}
                  />

                  <ChromaticGlassCard
                    title="ЗАБРОНИРОВАТЬ"
                    description="Столики, отели, tickets и appointments"
                    crystallineType="booking"
                    onPress={() => handleMenuPress("booking")}
                  />

                  <View style={styles.bottomButtonsRow}>
                    <GlassSphere
                      size={56}
                      icon={Megaphone}
                      label="Объявления услуг"
                      onPress={() => handleMenuPress("ads")}
                    />
                    <GlassSphere
                      size={56}
                      icon={Send}
                      label="Мессенджер"
                      onPress={() => handleMenuPress("messenger")}
                    />
                    <GlassSphere
                      size={56}
                      icon={Wallet}
                      label="Кошелек"
                      onPress={() => handleMenuPress("wallet")}
                    />
                    <GlassSphere
                      size={56}
                      textContent="AI"
                      label="Ассистент"
                      onPress={() => setAiAssistantOpen(true)}
                    />
                  </View>

                  <GlassMapPanel onPress={() => setMapOpen(true)} />
                </>
              ) : (
                <>
                  <ChromaticGlassCard
                    title="НАЙТИ ЗАКАЗЫ"
                    description="Просмотр доступных заказов поблизости"
                    crystallineType="order"
                    onPress={() => handleMenuPress("findOrders")}
                  />

                  <ChromaticGlassCard
                    title="МОИ ЗАКАЗЫ"
                    description="Управление вашими текущими заказами"
                    crystallineType="booking"
                    onPress={() => handleMenuPress("myOrders")}
                  />

                  <View style={styles.bottomButtonsRow}>
                    <GlassSphere
                      size={56}
                      icon={Megaphone}
                      label="Объявления услуг"
                      onPress={() => handleMenuPress("ads")}
                    />
                    <GlassSphere
                      size={56}
                      icon={Send}
                      label="Мессенджер"
                      onPress={() => handleMenuPress("messenger")}
                    />
                    <GlassSphere
                      size={56}
                      icon={Wallet}
                      label="Кошелек"
                      onPress={() => handleMenuPress("wallet")}
                    />
                    <GlassSphere
                      size={56}
                      textContent="AI"
                      label="Ассистент"
                      onPress={() => setAiAssistantOpen(true)}
                    />
                  </View>

                  <GlassMapPanel onPress={() => setMapOpen(true)} />
                </>
              )}
            </View>

            <Text style={styles.footer}>KASSEN Technology Inc.</Text>
          </ScrollView>
        </SafeAreaView>

        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [
                { translateX: floatingPos.x },
                { translateY: floatingPos.y },
                { scale: floatingScale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
          testID="ai-floating-button"
        >
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/s00togqz2vrsgw7gzi3og' }}
            style={styles.floatingButtonImage}
          />
          <View style={styles.floatingButtonOverlay}>
            <Text style={styles.floatingButtonText}>AI</Text>
          </View>
        </Animated.View>

        <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <CalendarModal visible={calendarOpen} onClose={() => setCalendarOpen(false)} />
        <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

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

        <AIAssistantModal
          visible={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          onAction={(action: AIAction) => {
            if (action.type === "order" && action.data) {
              setAiOrderData(action.data);
              setActiveModal("order");
            } else if (
              action.type === "navigate" &&
              (action.data?.screen === "services" || action.data?.screen === "work")
            ) {
              setActiveMode(action.data.screen);
              setAiAssistantOpen(false);
            }
          }}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a2e",
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
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#40e0d0",
    letterSpacing: -0.5,
    textShadowColor: "rgba(64, 224, 208, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  cityText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  floatingButton: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
  },
  floatingButtonImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  floatingButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  floatingButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  modeSwitcher: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 18,
    padding: 4,
  },
  mainButtonsContainer: {
    gap: 12,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    marginTop: 20,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
});
