import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Send,
  ArrowLeft,
  Check,
  X,
  Star,
  Clock,
  MessageCircle,
  BadgeCheck,
} from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState, Chat, Proposal } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface MessengerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MessengerModal({ visible, onClose }: MessengerModalProps) {
  const {
    currentTheme,
    t,
    chats,
    proposals,
    updateProposalStatus,
    addChatMessage,
  } = useAppState();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const getProposal = (proposalId: string): Proposal | undefined => {
    return proposals.find((p) => p.id === proposalId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} мин`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ч`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    addChatMessage(selectedChat.id, {
      senderId: "me",
      content: messageInput.trim(),
      type: "text",
    });

    setMessageInput("");
  };

  const handleAcceptProposal = (proposalId: string) => {
    updateProposalStatus(proposalId, "accepted");
  };

  const handleDeclineProposal = (proposalId: string) => {
    updateProposalStatus(proposalId, "declined");
  };

  const renderProposalCard = (proposalId: string) => {
    const proposal = getProposal(proposalId);
    if (!proposal) return null;

    return (
      <View style={styles.proposalCard}>
        <LinearGradient
          colors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.08)"]}
          style={styles.proposalGradient}
        >
          <View style={styles.proposalHeader}>
            <View style={styles.proposalTitleRow}>
              <Text style={styles.proposalTitle}>{t.newProposal}</Text>
              <BadgeCheck size={16} color="#10b981" />
            </View>
            {proposal.status === "pending" && (
              <View style={styles.pendingBadge}>
                <Clock size={11} color="#fbbf24" />
                <Text style={styles.pendingText}>{t.pending}</Text>
              </View>
            )}
            {proposal.status === "accepted" && (
              <View style={[styles.statusBadge, { backgroundColor: "#10b98125" }]}>
                <Check size={12} color="#10b981" />
                <Text style={[styles.statusText, { color: "#10b981" }]}>
                  {t.proposalAccepted}
                </Text>
              </View>
            )}
            {proposal.status === "declined" && (
              <View style={[styles.statusBadge, { backgroundColor: "#ef444425" }]}>
                <X size={12} color="#ef4444" />
                <Text style={[styles.statusText, { color: "#ef4444" }]}>
                  {t.proposalDeclined}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.proposalProviderRow}>
            {proposal.providerAvatar ? (
              <Image source={{ uri: proposal.providerAvatar }} style={styles.proposalAvatar} />
            ) : (
              <View style={[styles.proposalAvatarPlaceholder, { backgroundColor: currentTheme.accent + "30" }]}>
                <Text style={styles.proposalAvatarText}>
                  {proposal.providerName?.charAt(0) || "?"}
                </Text>
              </View>
            )}
            <View style={styles.proposalProviderInfo}>
              <Text style={styles.proposalProviderName}>{proposal.providerName}</Text>
              <View style={styles.proposalRatingRow}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.proposalRating}>{proposal.providerRating}</Text>
                <Text style={styles.proposalReviews}>• {t.verified}</Text>
              </View>
            </View>
          </View>

          <View style={styles.proposalContent}>
            <View style={styles.proposalRow}>
              <Text style={styles.proposalLabel}>{t.budget}:</Text>
              <Text style={[styles.proposalValue, { color: "#10b981" }]}>
                {proposal.budget} ₸
              </Text>
            </View>
            {proposal.message && (
              <Text style={styles.proposalMessage}>{proposal.message}</Text>
            )}
          </View>

          {proposal.status === "pending" && (
            <View style={styles.proposalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptProposal(proposal.id)}
                activeOpacity={0.8}
              >
                <Check size={16} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>{t.accept}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDeclineProposal(proposal.id)}
                activeOpacity={0.8}
              >
                <X size={16} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>{t.decline}</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderChatList = () => (
    <View style={styles.scrollView}>
      <Text style={styles.sectionTitle}>{t.activeChats}</Text>
      
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MessageCircle size={40} color={commonColors.textSecondary} />
          </View>
          <Text style={styles.emptyText}>{t.noChats}</Text>
          <Text style={styles.emptySubtext}>
            Начните диалог с исполнителем после получения предложения
          </Text>
        </View>
      ) : (
        chats.map((chat) => {
          const hasProposal = chat.lastMessage?.type === "proposal";
          return (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => setSelectedChat(chat)}
              activeOpacity={0.8}
            >
              <View style={styles.chatCardInner}>
                <View style={styles.chatAvatar}>
                  {chat.participants[0]?.avatar ? (
                    <Image
                      source={{ uri: chat.participants[0].avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        { backgroundColor: currentTheme.accent + "30" },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {chat.participants[0]?.name?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.onlineDot} />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>
                      {chat.participants[0]?.name} {chat.participants[0]?.surname}
                    </Text>
                    <Text style={styles.chatTime}>
                      {chat.lastMessage
                        ? formatDate(chat.lastMessage.createdAt)
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.chatPreviewRow}>
                    {hasProposal && (
                      <View style={styles.proposalBadgeSmall}>
                        <Text style={styles.proposalBadgeText}>📋</Text>
                      </View>
                    )}
                    <Text style={[styles.chatPreview, hasProposal && styles.chatPreviewProposal]} numberOfLines={1}>
                      {hasProposal
                        ? t.newProposal
                        : chat.lastMessage?.content || ""}
                    </Text>
                  </View>
                </View>

                {hasProposal && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: currentTheme.accent },
                    ]}
                  >
                    <Text style={styles.unreadText}>1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderChatView = () => {
    if (!selectedChat) return null;

    const participant = selectedChat.participants[0];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatViewContainer}
      >
        <View style={styles.chatViewHeader}>
          <TouchableOpacity
            onPress={() => setSelectedChat(null)}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color={commonColors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.chatHeaderInfo}>
            {participant?.avatar ? (
              <Image
                source={{ uri: participant.avatar }}
                style={styles.headerAvatar}
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarPlaceholder,
                  { backgroundColor: currentTheme.accent + "30" },
                ]}
              >
                <Text style={styles.headerAvatarText}>
                  {participant?.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.headerName}>
                {participant?.name} {participant?.surname}
              </Text>
              <View style={styles.onlineStatus}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineText}>{t.online}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRating}>
            <Star size={13} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <View style={styles.messagesContainer}>
          {selectedChat.messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.senderId === "me"
                  ? styles.myMessageWrapper
                  : styles.theirMessageWrapper,
              ]}
            >
              {message.type === "proposal" && message.proposalId ? (
                renderProposalCard(message.proposalId)
              ) : (
                <View
                  style={[
                    styles.messageBubble,
                    message.senderId === "me"
                      ? [
                          styles.myMessage,
                          { backgroundColor: currentTheme.accent + "35" },
                        ]
                      : styles.theirMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{message.content}</Text>
                  <Text style={styles.messageTime}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder={t.typeMessage}
            placeholderTextColor={commonColors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              messageInput.trim()
                ? { backgroundColor: currentTheme.accent }
                : { backgroundColor: "rgba(255,255,255,0.1)" },
            ]}
            onPress={handleSendMessage}
            disabled={!messageInput.trim()}
            activeOpacity={0.8}
          >
            <Send
              size={18}
              color={messageInput.trim() ? "#ffffff" : commonColors.textSecondary}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <GlassModal visible={visible} onClose={onClose} scrollable={!selectedChat}>
      <View style={styles.container}>
        {selectedChat ? (
          renderChatView()
        ) : (
          <>
            <Text style={[styles.title, { color: currentTheme.neon }]}>
              {t.messenger}
            </Text>
            {renderChatList()}
            <GlassButton
              title={t.close}
              onPress={onClose}
              variant="secondary"
              accentColor={commonColors.textSecondary}
              style={styles.closeButton}
            />
          </>
        )}
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  scrollView: {
    gap: 10,
  },
  chatCard: {
    borderRadius: 16,
    overflow: "hidden" as const,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
  },
  chatCardInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 14,
    gap: 14,
  },
  chatAvatar: {
    position: "relative" as const,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  onlineDot: {
    position: "absolute" as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.8)",
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  chatTime: {
    fontSize: 11,
    color: commonColors.textSecondary,
  },
  chatPreviewRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  proposalBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  proposalBadgeText: {
    fontSize: 10,
  },
  chatPreview: {
    fontSize: 13,
    color: commonColors.textSecondary,
    flex: 1,
  },
  chatPreviewProposal: {
    color: "#10b981",
    fontWeight: "500" as const,
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#ffffff",
  },
  chatViewContainer: {
    flex: 1,
    minHeight: 450,
  },
  chatViewHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  headerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  onlineStatus: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    marginTop: 2,
  },
  onlineIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  onlineText: {
    fontSize: 11,
    color: "#10b981",
  },
  headerRating: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
    marginTop: 12,
    gap: 12,
  },
  messageWrapper: {
    maxWidth: "88%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end" as const,
  },
  theirMessageWrapper: {
    alignSelf: "flex-start" as const,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  myMessage: {
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "rgba(30, 30, 45, 0.8)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: commonColors.textPrimary,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: commonColors.textSecondary,
    alignSelf: "flex-end" as const,
  },
  proposalCard: {
    borderRadius: 16,
    overflow: "hidden" as const,
    minWidth: 280,
  },
  proposalGradient: {
    padding: 14,
    gap: 12,
    borderRadius: 16,
  },
  proposalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  proposalTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  proposalTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#10b981",
  },
  pendingBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "#fbbf24",
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
  proposalProviderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  proposalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  proposalAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  proposalAvatarText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  proposalProviderInfo: {
    flex: 1,
    gap: 2,
  },
  proposalProviderName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  proposalRatingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  proposalRating: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  proposalReviews: {
    fontSize: 11,
    color: commonColors.textSecondary,
  },
  proposalContent: {
    gap: 8,
  },
  proposalRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  proposalLabel: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  proposalValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  proposalMessage: {
    fontSize: 12,
    color: commonColors.textPrimary,
    lineHeight: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 10,
  },
  proposalActions: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  declineButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: commonColors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 40,
    gap: 12,
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
  },
  emptySubtext: {
    fontSize: 12,
    color: commonColors.textSecondary,
    textAlign: "center" as const,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 4,
  },
});
