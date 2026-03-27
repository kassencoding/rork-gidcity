import React, { ReactNode, useEffect, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { X } from "lucide-react-native";
import { commonColors } from "@/constants/colors";
import { useAppState } from "@/contexts/AppStateContext";

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
}

export function GlassModal({ visible, onClose, children, backgroundColor, scrollable = true }: GlassModalProps) {
  const { glassOpacity } = useAppState();
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          >
            <Animated.View style={[styles.modalWrapper, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                <View style={[styles.glassContainer, { backgroundColor: backgroundColor || `rgba(255, 255, 255, ${glassOpacity})` }]}>
                  <View style={styles.glassOverlay} />
                  <View style={styles.highlightTop} />
                  <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <X size={20} color={commonColors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  {scrollable ? (
                    <ScrollView
                      style={styles.scrollView}
                      contentContainerStyle={styles.scrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {children}
                    </ScrollView>
                  ) : (
                    <View style={styles.scrollContent}>
                      {children}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: commonColors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  modalContent: {
    width: "100%",
  },
  glassContainer: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative" as const,
  },
  glassOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 32,
  },
  highlightTop: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  scrollView: {
    maxHeight: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
});
