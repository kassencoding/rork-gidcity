import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Clock, DollarSign, Star, ChevronRight, User } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState, Order } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface FindOrdersModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FindOrdersModal({ visible, onClose }: FindOrdersModalProps) {
  const { currentTheme, t, orders, addProposal, profile } = useAppState();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proposalBudget, setProposalBudget] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalSent, setProposalSent] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === "pending" && o.customerId !== "me");

  const handleSendProposal = () => {
    if (!selectedOrder || !proposalBudget) return;

    addProposal({
      orderId: selectedOrder.id,
      providerId: "me",
      providerName: profile.name + " " + profile.surname,
      providerAvatar: profile.avatar,
      providerRating: 4.5,
      budget: proposalBudget,
      message: proposalMessage,
    });

    setProposalSent(true);
    setTimeout(() => {
      setProposalSent(false);
      setSelectedOrder(null);
      setProposalBudget("");
      setProposalMessage("");
    }, 2000);
  };

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => setSelectedOrder(order)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]}
        style={styles.orderGradient}
      >
        <View style={styles.orderHeader}>
          <View style={styles.customerInfo}>
            {order.customerAvatar ? (
              <Image source={{ uri: order.customerAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.accent + "30" }]}>
                <User size={18} color={currentTheme.accent} />
              </View>
            )}
            <View>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.orderType}>{order.type}</Text>
            </View>
          </View>
          <View style={[styles.budgetBadge, { backgroundColor: currentTheme.accent + "25" }]}>
            <Text style={[styles.budgetText, { color: currentTheme.accent }]}>
              {order.budget} ₸
            </Text>
          </View>
        </View>

        <Text style={styles.orderDescription} numberOfLines={2}>
          {order.description}
        </Text>

        <View style={styles.orderFooter}>
          <View style={styles.orderMeta}>
            <Clock size={14} color={commonColors.textSecondary} />
            <Text style={styles.metaText}>{order.deadline}</Text>
          </View>
          <ChevronRight size={18} color={currentTheme.neon} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderOrderDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <View style={styles.customerInfo}>
          {selectedOrder?.customerAvatar ? (
            <Image source={{ uri: selectedOrder.customerAvatar }} style={styles.avatarLarge} />
          ) : (
            <View style={[styles.avatarPlaceholderLarge, { backgroundColor: currentTheme.accent + "30" }]}>
              <User size={24} color={currentTheme.accent} />
            </View>
          )}
          <View>
            <Text style={styles.customerNameLarge}>{selectedOrder?.customerName}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.verifiedBadge}>{t.verified}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionLabel}>{t.service}</Text>
        <Text style={[styles.sectionValue, { color: currentTheme.neon }]}>
          {selectedOrder?.type}
        </Text>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionLabel}>{t.description}</Text>
        <Text style={styles.descriptionText}>{selectedOrder?.description}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Clock size={18} color={currentTheme.accent} />
          <View>
            <Text style={styles.detailLabel}>{t.deadline}</Text>
            <Text style={styles.detailValue}>{selectedOrder?.deadline}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <DollarSign size={18} color={currentTheme.accent} />
          <View>
            <Text style={styles.detailLabel}>{t.budget}</Text>
            <Text style={styles.detailValue}>{selectedOrder?.budget} ₸</Text>
          </View>
        </View>
      </View>

      {proposalSent ? (
        <View style={[styles.successBanner, { backgroundColor: "#10b98130" }]}>
          <Text style={styles.successText}>{t.proposalSent}</Text>
        </View>
      ) : (
        <View style={styles.proposalForm}>
          <Text style={styles.formTitle}>{t.sendProposal}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.yourBudget} (₸)</Text>
            <TextInput
              style={styles.input}
              value={proposalBudget}
              onChangeText={setProposalBudget}
              placeholder={t.enterAmount}
              placeholderTextColor={commonColors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.proposalMessage}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={proposalMessage}
              onChangeText={setProposalMessage}
              placeholder={t.enterComment}
              placeholderTextColor={commonColors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <GlassButton
              title={t.submitProposal}
              onPress={handleSendProposal}
              variant="primary"
              accentColor={currentTheme.accent}
              style={{ flex: 1 }}
            />
            <GlassButton
              title={t.cancel}
              onPress={() => setSelectedOrder(null)}
              variant="secondary"
              accentColor={commonColors.textSecondary}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.neon }]}>
          {selectedOrder ? t.orderDetails : t.availableOrders}
        </Text>

        {selectedOrder ? (
          renderOrderDetails()
        ) : (
          <View style={styles.scrollView}>
            {pendingOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={48} color={commonColors.textSecondary} />
                <Text style={styles.emptyText}>{t.noOrders}</Text>
              </View>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </View>
        )}

        {!selectedOrder && (
          <GlassButton
            title={t.close}
            onPress={onClose}
            variant="secondary"
            accentColor={commonColors.textSecondary}
            style={styles.closeButton}
          />
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
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  scrollView: {
    gap: 12,
  },
  orderCard: {
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  orderGradient: {
    padding: 16,
    gap: 12,
  },
  orderHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  customerInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholderLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  customerNameLarge: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  orderType: {
    fontSize: 12,
    color: commonColors.textSecondary,
    marginTop: 2,
  },
  budgetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  orderDescription: {
    fontSize: 13,
    color: commonColors.textPrimary,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  orderMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  detailsContainer: {
    gap: 16,
  },
  detailsHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  ratingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  verifiedBadge: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "500" as const,
    marginLeft: 4,
  },
  detailsSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  descriptionText: {
    fontSize: 14,
    color: commonColors.textPrimary,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: "row" as const,
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: commonColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  proposalForm: {
    gap: 14,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    color: commonColors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  formActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  successBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  successText: {
    fontSize: 14,
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
