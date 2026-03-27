import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedDate?: string;
}

export function AddReminderModal({ visible, onClose, preselectedDate }: AddReminderModalProps) {
  const { currentTheme, t, addReminder } = useAppState();
  const [note, setNote] = useState("");
  const [date, setDate] = useState(preselectedDate || "");
  const [time, setTime] = useState("");

  const handleSave = () => {
    if (note && date && time) {
      addReminder({ date, time, note });
      setNote("");
      setDate("");
      setTime("");
      onClose();
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.neon }]}>Добавить напоминание</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Заметка</Text>
            <TextInput
              style={styles.input}
              placeholder="Что напомнить?"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={note}
              onChangeText={setNote}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Дата</Text>
            <TextInput
              style={styles.input}
              placeholder="DD.MM.YYYY"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Время</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <GlassButton
            title={t.cancel || "Отмена"}
            onPress={onClose}
            variant="secondary"
            accentColor={commonColors.textSecondary}
            style={styles.cancelButton}
          />
          <GlassButton
            title={t.save || "Сохранить"}
            onPress={handleSave}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.saveButton}
          />
        </View>
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    letterSpacing: -0.3,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: commonColors.textPrimary,
    borderWidth: 0,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
