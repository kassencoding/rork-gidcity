import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Check,
  X,
} from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState, Booking } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
}

const MOCK_VENUES = [
  {
    id: "v1",
    name: "Del Papa",
    address: "ул. Гоголя, 39",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    rating: 4.8,
  },
  {
    id: "v2",
    name: "Наша Italia",
    address: "пр. Достык, 89",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    rating: 4.6,
  },
  {
    id: "v3",
    name: "Kaganat",
    address: "ул. Абая, 125",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    rating: 4.9,
  },
  {
    id: "v4",
    name: "Coffeedelia",
    address: "ул. Сатпаева, 22",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    rating: 4.7,
  },
];

const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

export function BookingModal({ visible, onClose }: BookingModalProps) {
  const { currentTheme, t, bookings, addBooking, cancelBooking } = useAppState();
  const [activeTab, setActiveTab] = useState<"create" | "upcoming" | "past">("upcoming");
  const [selectedVenue, setSelectedVenue] = useState<typeof MOCK_VENUES[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [showSuccess, setShowSuccess] = useState(false);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled" && new Date(b.date) >= new Date()),
    [bookings]
  );

  const pastBookings = useMemo(
    () => bookings.filter((b) => new Date(b.date) < new Date() || b.status === "cancelled"),
    [bookings]
  );

  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" }),
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  const handleCreateBooking = () => {
    if (!selectedVenue || !selectedDate || !selectedTime) return;

    addBooking({
      venueName: selectedVenue.name,
      venueAddress: selectedVenue.address,
      venueImage: selectedVenue.image,
      date: selectedDate,
      time: selectedTime,
      guests: parseInt(guests) || 2,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedVenue(null);
      setSelectedDate("");
      setSelectedTime("");
      setGuests("2");
      setActiveTab("upcoming");
    }, 2000);
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
  };

  const renderBookingCard = (booking: Booking) => {
    const isCancelled = booking.status === "cancelled";
    const isPast = new Date(booking.date) < new Date();

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <LinearGradient
          colors={
            isCancelled
              ? ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.03)"]
              : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.04)"]
          }
          style={styles.bookingGradient}
        >
          {booking.venueImage && (
            <Image source={{ uri: booking.venueImage }} style={styles.venueImage} />
          )}
          <View style={styles.bookingInfo}>
            <View style={styles.bookingHeader}>
              <Text style={styles.venueName}>{booking.venueName}</Text>
              {booking.status === "confirmed" && !isPast && (
                <View style={[styles.statusBadge, { backgroundColor: "#10b98130" }]}>
                  <Check size={12} color="#10b981" />
                  <Text style={[styles.statusText, { color: "#10b981" }]}>
                    {t.completed}
                  </Text>
                </View>
              )}
              {isCancelled && (
                <View style={[styles.statusBadge, { backgroundColor: "#ef444430" }]}>
                  <X size={12} color="#ef4444" />
                  <Text style={[styles.statusText, { color: "#ef4444" }]}>
                    {t.cancelBooking}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.bookingMeta}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={commonColors.textSecondary} />
                <Text style={styles.metaText}>{booking.venueAddress}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={14} color={commonColors.textSecondary} />
                <Text style={styles.metaText}>
                  {new Date(booking.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={commonColors.textSecondary} />
                <Text style={styles.metaText}>{booking.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={14} color={commonColors.textSecondary} />
                <Text style={styles.metaText}>{booking.guests}</Text>
              </View>
            </View>

            {!isPast && !isCancelled && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(booking.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{t.cancelBooking}</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderCreateForm = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {showSuccess ? (
        <View style={[styles.successBanner, { backgroundColor: "#10b98130" }]}>
          <Check size={32} color="#10b981" />
          <Text style={styles.successText}>{t.bookingConfirmed}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>{t.selectVenue}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.venueScroll}
          >
            {MOCK_VENUES.map((venue) => (
              <TouchableOpacity
                key={venue.id}
                style={[
                  styles.venueCard,
                  selectedVenue?.id === venue.id && {
                    borderColor: currentTheme.accent,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedVenue(venue)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: venue.image }} style={styles.venueCardImage} />
                <View style={styles.venueCardInfo}>
                  <Text style={styles.venueCardName}>{venue.name}</Text>
                  <Text style={styles.venueCardAddress} numberOfLines={1}>
                    {venue.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>{t.selectDate}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {dateOptions.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateChip,
                  selectedDate === date.value && {
                    backgroundColor: currentTheme.accent,
                  },
                ]}
                onPress={() => setSelectedDate(date.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    selectedDate === date.value && { color: "#ffffff" },
                  ]}
                >
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>{t.selectTime}</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeChip,
                  selectedTime === time && {
                    backgroundColor: currentTheme.accent,
                  },
                ]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    selectedTime === time && { color: "#ffffff" },
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.guestsSection}>
            <Text style={styles.sectionTitle}>{t.numberOfGuests}</Text>
            <View style={styles.guestsInput}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, parseInt(guests) - 1).toString())}
              >
                <Text style={styles.guestButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.guestsTextInput}
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests((parseInt(guests) + 1).toString())}
              >
                <Text style={styles.guestButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <GlassButton
            title={t.createBooking}
            onPress={handleCreateBooking}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.createButton}
          />
        </>
      )}
    </ScrollView>
  );

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.neon }]}>{t.booking}</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "upcoming" && {
                backgroundColor: currentTheme.accent + "25",
              },
            ]}
            onPress={() => setActiveTab("upcoming")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && { color: currentTheme.accent },
              ]}
            >
              {t.upcoming}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "past" && {
                backgroundColor: currentTheme.accent + "25",
              },
            ]}
            onPress={() => setActiveTab("past")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && { color: currentTheme.accent },
              ]}
            >
              {t.past}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "create" && {
                backgroundColor: currentTheme.accent + "25",
              },
            ]}
            onPress={() => setActiveTab("create")}
            activeOpacity={0.8}
          >
            <Plus
              size={16}
              color={activeTab === "create" ? currentTheme.accent : commonColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "create" && { color: currentTheme.accent },
              ]}
            >
              {t.createBooking}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "create" ? (
          renderCreateForm()
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(activeTab === "upcoming" ? upcomingBookings : pastBookings).length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={commonColors.textSecondary} />
                <Text style={styles.emptyText}>{t.noBookings}</Text>
              </View>
            ) : (
              (activeTab === "upcoming" ? upcomingBookings : pastBookings).map(renderBookingCard)
            )}
          </ScrollView>
        )}

        <GlassButton
          title={t.close}
          onPress={onClose}
          variant="secondary"
          accentColor={commonColors.textSecondary}
          style={styles.closeButton}
        />
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  tabs: {
    flexDirection: "row" as const,
    gap: 8,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  scrollView: {
    maxHeight: 380,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  bookingCard: {
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  bookingGradient: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 12,
  },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bookingInfo: {
    flex: 1,
    gap: 8,
  },
  bookingHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  venueName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  bookingMeta: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  metaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  cancelButton: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 8,
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#ef4444",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    marginBottom: 8,
  },
  venueScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  venueCard: {
    width: 140,
    borderRadius: 18,
    overflow: "hidden" as const,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  venueCardImage: {
    width: "100%",
    height: 90,
  },
  venueCardInfo: {
    padding: 10,
    gap: 2,
  },
  venueCardName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  venueCardAddress: {
    fontSize: 11,
    color: commonColors.textSecondary,
  },
  dateScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  timeGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  guestsSection: {
    marginTop: 8,
  },
  guestsInput: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
  },
  guestButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  guestButtonText: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  guestsTextInput: {
    width: 60,
    fontSize: 20,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  createButton: {
    marginTop: 16,
  },
  successBanner: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    gap: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10b981",
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: commonColors.textSecondary,
    textAlign: "center" as const,
  },
  closeButton: {
    marginTop: 8,
  },
});
