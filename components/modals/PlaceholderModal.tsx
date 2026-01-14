import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface PlaceholderModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

export function PlaceholderModal({ visible, onClose, title }: PlaceholderModalProps) {
  const { currentTheme, t } = useAppState();

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{t.comingSoon}</Text>
        <GlassButton
          title={t.close}
          onPress={onClose}
          variant="primary"
          accentColor={currentTheme.accent}
          style={styles.button}
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
    fontSize: 20,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: commonColors.textSecondary,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
  },
});
