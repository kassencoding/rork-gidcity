import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Calendar } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { AddReminderModal } from "./AddReminderModal";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CalendarModal({ visible, onClose }: CalendarModalProps) {
  const { currentTheme, t, reminders, language } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addReminderOpen, setAddReminderOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState("");

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const firstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
        days.push(null);
      }
    }

    return days;
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const localeMap: Record<string, string> = {
    ru: "ru-RU",
    kk: "kk-KZ",
    en: "en-US",
  };
  const monthName = selectedDate.toLocaleDateString(localeMap[language] || "ru-RU", { month: "long", year: "numeric" });
  const days = getDaysInMonth();
  const today = new Date();

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.neon }]}>{t.calendar}</Text>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {(language === "kk" 
            ? ["Дс", "Сс", "Ср", "Бс", "Жм", "Сн", "Жк"]
            : language === "en"
            ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
            : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
          ).map((day, index) => (
            <Text key={index} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            const isToday =
              day === today.getDate() &&
              selectedDate.getMonth() === today.getMonth() &&
              selectedDate.getFullYear() === today.getFullYear();

            return (
              <TouchableOpacity
                key={index}
                style={styles.dayCell}
                disabled={day === null}
                activeOpacity={0.7}
                onPress={() => {
                  if (day !== null) {
                    const formattedDate = `${String(day).padStart(2, "0")}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}.${selectedDate.getFullYear()}`;
                    setPreselectedDate(formattedDate);
                    setAddReminderOpen(true);
                  }
                }}
              >
                {day !== null ? (
                  <View
                    style={[
                      styles.dayCellInner,
                      isToday && { backgroundColor: currentTheme.accent + "40" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && { color: currentTheme.accent, fontWeight: "700" as const },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.dayCellInner, styles.emptyCell]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {reminders.length > 0 && (
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>{t.notifications}</Text>
            <ScrollView style={styles.remindersScroll} showsVerticalScrollIndicator={false}>
              {reminders.slice(0, 3).map((reminder) => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <Calendar size={14} color={currentTheme.accent} />
                  <Text style={styles.reminderText} numberOfLines={1}>
                    {reminder.note}
                  </Text>
                  <Text style={styles.reminderDate}>
                    {reminder.date}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <GlassButton
          title={t.close}
          onPress={onClose}
          variant="secondary"
          accentColor={commonColors.textSecondary}
          style={styles.closeButton}
        />
      </View>
      <AddReminderModal
        visible={addReminderOpen}
        onClose={() => setAddReminderOpen(false)}
        preselectedDate={preselectedDate}
      />
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    letterSpacing: -0.5,
  },
  calendarHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    borderRadius: 12,
    borderWidth: 0,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  monthText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
    textTransform: "capitalize" as const,
    letterSpacing: -0.3,
  },
  weekDays: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.45)",
    width: "14.28%" as unknown as number,
    textAlign: "center" as const,
    letterSpacing: 0.3,
  },
  daysGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  dayCell: {
    width: "14.28%" as unknown as number,
    aspectRatio: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 2,
  },
  dayCellInner: {
    width: 38,
    height: 38,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 10,
    backgroundColor: "rgba(20, 20, 30, 0.6)",
  },
  emptyCell: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    letterSpacing: -0.2,
  },
  remindersSection: {
    marginTop: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  remindersScroll: {
    maxHeight: 100,
  },
  reminderItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 14,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 0,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
    letterSpacing: -0.2,
  },
  reminderDate: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  closeButton: {
    marginTop: 12,
  },
});
