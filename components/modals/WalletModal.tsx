import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState, Transaction } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WalletModal({ visible, onClose }: WalletModalProps) {
  const { currentTheme, t, walletBalance, transactions, addTransaction } = useAppState();
  const [activeTab, setActiveTab] = useState<"history" | "transfer" | "topup">("history");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ru-RU");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (!amount || !transferRecipient || amount > walletBalance) return;

    addTransaction({
      type: "expense",
      amount,
      description: t.transfer,
      recipient: transferRecipient,
      status: "completed",
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setTransferAmount("");
      setTransferRecipient("");
      setActiveTab("history");
    }, 2000);
  };

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!amount) return;

    addTransaction({
      type: "income",
      amount,
      description: t.topUp,
      status: "completed",
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setTopUpAmount("");
      setActiveTab("history");
    }, 2000);
  };

  const renderTransactionCard = (transaction: Transaction) => {
    const isIncome = transaction.type === "income";

    return (
      <View key={transaction.id} style={styles.transactionCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
          style={styles.transactionGradient}
        >
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor: isIncome
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              },
            ]}
          >
            {isIncome ? (
              <ArrowDownLeft size={20} color="#10b981" />
            ) : (
              <ArrowUpRight size={20} color="#ef4444" />
            )}
          </View>

          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            {transaction.recipient && (
              <Text style={styles.transactionParty}>
                → {transaction.recipient}
              </Text>
            )}
            {transaction.sender && (
              <Text style={styles.transactionParty}>
                ← {transaction.sender}
              </Text>
            )}
            <Text style={styles.transactionDate}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>

          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                { color: isIncome ? "#10b981" : "#ef4444" },
              ]}
            >
              {isIncome ? "+" : "-"}{formatAmount(transaction.amount)} ₸
            </Text>
            <View style={styles.statusBadge}>
              {transaction.status === "completed" ? (
                <CheckCircle size={14} color="#10b981" />
              ) : transaction.status === "pending" ? (
                <Clock size={14} color="#fbbf24" />
              ) : (
                <XCircle size={14} color="#ef4444" />
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderTransferForm = () => (
    <View style={styles.formContainer}>
      {showSuccess ? (
        <View style={[styles.successBanner, { backgroundColor: "#10b98130" }]}>
          <CheckCircle size={32} color="#10b981" />
          <Text style={styles.successText}>{t.completed}</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.recipient}</Text>
            <TextInput
              style={styles.input}
              value={transferRecipient}
              onChangeText={setTransferRecipient}
              placeholder={t.enterRecipient}
              placeholderTextColor={commonColors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.amount} (₸)</Text>
            <TextInput
              style={styles.input}
              value={transferAmount}
              onChangeText={setTransferAmount}
              placeholder={t.enterAmount}
              placeholderTextColor={commonColors.textSecondary}
              keyboardType="numeric"
            />
            {parseFloat(transferAmount) > walletBalance && (
              <Text style={styles.errorText}>Недостаточно средств</Text>
            )}
          </View>

          <GlassButton
            title={t.confirmTransfer}
            onPress={handleTransfer}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.formButton}
          />
        </>
      )}
    </View>
  );

  const renderTopUpForm = () => (
    <View style={styles.formContainer}>
      {showSuccess ? (
        <View style={[styles.successBanner, { backgroundColor: "#10b98130" }]}>
          <CheckCircle size={32} color="#10b981" />
          <Text style={styles.successText}>{t.completed}</Text>
        </View>
      ) : (
        <>
          <View style={styles.quickAmounts}>
            {[1000, 5000, 10000, 50000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountChip,
                  topUpAmount === amount.toString() && {
                    backgroundColor: currentTheme.accent,
                  },
                ]}
                onPress={() => setTopUpAmount(amount.toString())}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    topUpAmount === amount.toString() && { color: "#ffffff" },
                  ]}
                >
                  {formatAmount(amount)} ₸
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.amount} (₸)</Text>
            <TextInput
              style={styles.input}
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder={t.enterAmount}
              placeholderTextColor={commonColors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <GlassButton
            title={t.topUp}
            onPress={handleTopUp}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.formButton}
          />
        </>
      )}
    </View>
  );

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[currentTheme.accent + "40", currentTheme.accent + "15"]}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.walletIcon}>
                <Wallet size={24} color={currentTheme.accent} />
              </View>
              <Text style={styles.balanceLabel}>{t.currentBalance}</Text>
            </View>
            <Text style={[styles.balanceAmount, { color: currentTheme.neon }]}>
              {formatAmount(walletBalance)} ₸
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              activeTab === "transfer" && { backgroundColor: currentTheme.accent + "30" },
            ]}
            onPress={() => setActiveTab("transfer")}
            activeOpacity={0.8}
          >
            <Send size={20} color={activeTab === "transfer" ? currentTheme.accent : commonColors.textPrimary} />
            <Text
              style={[
                styles.actionButtonText,
                activeTab === "transfer" && { color: currentTheme.accent },
              ]}
            >
              {t.transfer}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              activeTab === "topup" && { backgroundColor: currentTheme.accent + "30" },
            ]}
            onPress={() => setActiveTab("topup")}
            activeOpacity={0.8}
          >
            <Plus size={20} color={activeTab === "topup" ? currentTheme.accent : commonColors.textPrimary} />
            <Text
              style={[
                styles.actionButtonText,
                activeTab === "topup" && { color: currentTheme.accent },
              ]}
            >
              {t.topUp}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              activeTab === "history" && { backgroundColor: currentTheme.accent + "30" },
            ]}
            onPress={() => setActiveTab("history")}
            activeOpacity={0.8}
          >
            <Clock size={20} color={activeTab === "history" ? currentTheme.accent : commonColors.textPrimary} />
            <Text
              style={[
                styles.actionButtonText,
                activeTab === "history" && { color: currentTheme.accent },
              ]}
            >
              {t.transactionHistory}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "history" ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Wallet size={48} color={commonColors.textSecondary} />
                <Text style={styles.emptyText}>{t.noTransactions}</Text>
              </View>
            ) : (
              transactions.map(renderTransactionCard)
            )}
          </ScrollView>
        ) : activeTab === "transfer" ? (
          renderTransferForm()
        ) : (
          renderTopUpForm()
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
  balanceCard: {
    borderRadius: 20,
    overflow: "hidden" as const,
  },
  balanceGradient: {
    padding: 20,
    gap: 12,
  },
  balanceHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    letterSpacing: -1,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
    lineHeight: 14,
  },
  scrollView: {
    maxHeight: 280,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  transactionCard: {
    borderRadius: 14,
    overflow: "hidden" as const,
  },
  transactionGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 14,
    gap: 14,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  transactionParty: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  transactionDate: {
    fontSize: 11,
    color: commonColors.textSecondary,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: "flex-end" as const,
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  statusBadge: {
    padding: 2,
  },
  formContainer: {
    gap: 16,
    padding: 16,
    backgroundColor: "rgba(20, 20, 30, 0.6)",
    borderRadius: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  input: {
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    borderRadius: 12,
    padding: 14,
    color: commonColors.textPrimary,
    fontSize: 16,
    borderWidth: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  formButton: {
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  quickAmountChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textSecondary,
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
