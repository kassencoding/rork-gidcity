import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Home, Car, Package, Wrench, Sparkles } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  prefilledData?: {
    type?: string;
    description?: string;
    deadline?: string;
    budget?: string;
  } | null;
}



export function OrderModal({ visible, onClose, prefilledData }: OrderModalProps) {
  const { currentTheme, addOrder, t } = useAppState();

  const serviceTypes = [
    { name: t.gidRequest, icon: "star", color: currentTheme.accent, bgColor: "rgba(147, 51, 234, 0.2)" },
    { name: t.apartmentHouse, icon: Home, color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.2)" },
    { name: t.taxi, icon: Car, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.2)" },
    { name: t.courier, icon: Package, color: "#34d399", bgColor: "rgba(52, 211, 153, 0.2)" },
    { name: t.masterSpecialist, icon: Wrench, color: "#f472b6", bgColor: "rgba(244, 114, 182, 0.2)" },
  ];
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [showAIPreview, setShowAIPreview] = useState(false);

  useEffect(() => {
    if (prefilledData) {
      if (prefilledData.type) {
        setSelectedService(prefilledData.type);
      }
      if (prefilledData.description) {
        setDescription(prefilledData.description);
      }
      if (prefilledData.deadline) {
        setDeadline(prefilledData.deadline);
      }
      if (prefilledData.budget) {
        setBudget(prefilledData.budget);
      }
      setShowAIPreview(true);
    }
  }, [prefilledData]);

  const handleOrder = () => {
    if (selectedService && description && deadline && budget) {
      addOrder({
        type: selectedService,
        description,
        deadline,
        budget,
      });
      setSelectedService(null);
      setDescription("");
      setDeadline("");
      setBudget("");
      onClose();
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {!selectedService ? (
          <View style={styles.servicesContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>{t.createRequest}</Text>
              <Text style={styles.subtitle}>{t.selectService}</Text>
            </View>

            <View style={styles.gridContainer}>
              {serviceTypes.map((service) => {
                const IconComponent = service.icon === "star" ? Sparkles : service.icon;
                return (
                  <TouchableOpacity
                    key={service.name}
                    style={styles.serviceCardWrapper}
                    onPress={() => setSelectedService(service.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.serviceCardNew, { borderColor: service.color + "30" }]}>
                      <View style={[styles.iconContainer, { backgroundColor: service.bgColor }]}>
                        <IconComponent size={20} color={service.color} strokeWidth={2.5} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceTextNew} numberOfLines={2}>{service.name}</Text>
                      </View>
                      <View style={[styles.serviceBadge, { backgroundColor: service.bgColor }]}>
                        <View style={[styles.badgeDot, { backgroundColor: service.color }]} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {showAIPreview && (
              <View style={[styles.aiPreviewBanner, { backgroundColor: currentTheme.accent + "20", borderColor: currentTheme.accent }]}>
                <Sparkles size={16} color={currentTheme.accent} strokeWidth={2.5} />
                <Text style={[styles.aiPreviewText, { color: currentTheme.accent }]}>Заполнено GiD Ассистентом</Text>
              </View>
            )}
            
            <View style={[styles.selectedServiceCard, { borderColor: currentTheme.accent + "40" }]}>
              <View style={[styles.selectedServiceIcon, { backgroundColor: currentTheme.accent + "20" }]}>
                <Sparkles size={20} color={currentTheme.accent} strokeWidth={2.5} />
              </View>
              <View style={styles.selectedServiceInfo}>
                <Text style={styles.selectedServiceLabel}>{t.service}</Text>
                <Text style={[styles.selectedServiceText, { color: currentTheme.accent }]}>
                  {selectedService}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.changeButton}>
                <Text style={[styles.changeText, { color: currentTheme.neon }]}>{t.edit}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.description}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { borderColor: description ? currentTheme.accent + "40" : "rgba(255, 255, 255, 0.08)" }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t.enterDescription}
                  placeholderTextColor={commonColors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.deadline}</Text>
                  <TextInput
                    style={[styles.input, { borderColor: deadline ? currentTheme.accent + "40" : "rgba(255, 255, 255, 0.08)" }]}
                    value={deadline}
                    onChangeText={setDeadline}
                    placeholder={t.selectDeadline}
                    placeholderTextColor={commonColors.textSecondary}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.budget} (KZT)</Text>
                  <TextInput
                    style={[styles.input, { borderColor: budget ? currentTheme.accent + "40" : "rgba(255, 255, 255, 0.08)" }]}
                    value={budget}
                    onChangeText={setBudget}
                    placeholder={t.enterBudget}
                    placeholderTextColor={commonColors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <GlassButton
                title={showAIPreview ? t.submit : t.order}
                onPress={handleOrder}
                variant="primary"
                accentColor={currentTheme.accent}
                style={{ flex: 1 }}
              />
              <GlassButton
                title={t.cancel}
                onPress={onClose}
                variant="secondary"
                accentColor={commonColors.textSecondary}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  servicesContainer: {
    gap: 10,
  },
  headerSection: {
    alignItems: "center" as const,
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: commonColors.textSecondary,
    textAlign: "center" as const,
  },
  gridContainer: {
    flexDirection: "column" as const,
    gap: 10,
  },
  serviceCardWrapper: {
    width: "100%",
  },
  serviceCardNew: {
    backgroundColor: "rgba(20, 20, 30, 0.98)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTextNew: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    lineHeight: 18,
  },
  serviceBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    marginBottom: 6,
  },
  serviceCard: {
    padding: 16,
  },
  serviceText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
  },
  button: {
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  selectedServiceCard: {
    backgroundColor: "rgba(20, 20, 30, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  selectedServiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  selectedServiceInfo: {
    flex: 1,
    gap: 4,
  },
  selectedServiceLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  selectedServiceText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  formSection: {
    gap: 16,
  },
  inputRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  input: {
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 14,
    color: commonColors.textPrimary,
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  aiPreviewBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  aiPreviewText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center" as const,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: commonColors.textSecondary,
  },
});
