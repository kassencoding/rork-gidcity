import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Trash2 } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassCard } from "../GlassCard";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { currentTheme, t, reminders, removeReminder } = useAppState();

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.notifications}</Text>

        {reminders.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet</Text>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {reminders.map((reminder) => (
              <GlassCard key={reminder.id} style={styles.reminderCard} neonColor={currentTheme.neon}>
                <View style={styles.reminderContent}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderNote}>{reminder.note}</Text>
                    <Text style={styles.reminderDate}>
                      {reminder.date} at {reminder.time}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeReminder(reminder.id)}>
                    <Trash2 size={20} color={commonColors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        )}
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: commonColors.textSecondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    gap: 12,
  },
  reminderCard: {
    padding: 14,
  },
  reminderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  reminderInfo: {
    flex: 1,
    gap: 4,
  },
  reminderNote: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  reminderDate: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
});
