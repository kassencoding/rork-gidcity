import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
} from "react-native";
import { Heart, MessageCircle, Share2, Send, MoreVertical, Trash2, X, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { GlassCard } from "../GlassCard";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface CityChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CityChatModal({ visible, onClose }: CityChatModalProps) {
  const { currentTheme, profile, chatPosts, addChatPost, toggleLike, addComment, deletePost, t } = useAppState();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const headerOpacity = useRef(new Animated.Value(1)).current;

  const handlePublish = () => {
    if (postContent.trim() || selectedImage) {
      addChatPost({
        author: profile,
        content: postContent,
        image: selectedImage,
      });
      setPostContent("");
      setSelectedImage(undefined);
      setShowCreatePost(false);
    }
  };

  const handleLike = (postId: string) => {
    const userId = profile.phone || "anonymous";
    toggleLike(postId, userId);
  };

  const handleComment = (postId: string) => {
    if (commentText.trim()) {
      addComment(postId, {
        author: profile,
        content: commentText,
      });
      setCommentText("");
      setSelectedPost(null);
    }
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
    setShowDeleteConfirm(null);
    setShowPostMenu(null);
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - scrollY;
    
    if (delta > 0 && currentScrollY > 50) {
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (delta < 0) {
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    setScrollY(currentScrollY);
  };

  const getFirstName = (author: typeof profile) => {
    return author.name || "Anonymous";
  };

  const getLastName = (author: typeof profile) => {
    return author.surname || "";
  };

  const getDisplayName = (author: typeof profile) => {
    if (author.name && author.surname) {
      return `${author.name} ${author.surname}`;
    }
    if (author.name) {
      return author.name;
    }
    return "Anonymous";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.fullScreenContainer, { backgroundColor: currentTheme.gradient[0] }]}>
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerLeft}>
            {profile.avatar && (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            )}
            <Text style={styles.headerName}>{getDisplayName(profile)}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowCreatePost(true)}>
              <Text style={[styles.shareButton, { color: currentTheme.neon }]}>
                {t.share}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <X size={28} color={commonColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showCreatePost && (
          <GlassCard style={styles.createPost}>
            <View style={styles.postInputContainer}>
              <TextInput
                style={styles.postInput}
                value={postContent}
                onChangeText={setPostContent}
                placeholder="What's on your mind?"
                placeholderTextColor={commonColors.textSecondary}
                multiline
              />
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={async () => {
                  try {
                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    
                    if (permissionResult.status !== "granted") {
                      return;
                    }

                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
                      allowsEditing: false,
                      quality: 0.8,
                    });

                    if (!result.canceled && result.assets[0]) {
                      setSelectedImage(result.assets[0].uri);
                    }
                  } catch (error) {
                    console.error("Error picking image:", error);
                  }
                }}
              >
                <ImageIcon size={24} color={currentTheme.neon} />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(undefined)}
                >
                  <X size={18} color={commonColors.white} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={[styles.createPostButton, { backgroundColor: currentTheme.accent }]}
                onPress={handlePublish}
              >
                <Text style={styles.createPostButtonText}>{t.publish}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createPostButton, styles.createPostButtonSecondary]}
                onPress={() => {
                  setShowCreatePost(false);
                  setPostContent("");
                  setSelectedImage(undefined);
                }}
              >
                <Text style={styles.createPostButtonTextSecondary}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        <ScrollView
          style={styles.feed}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {chatPosts.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
          ) : (
            chatPosts.map((post) => (
              <GlassCard key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatarContainer}>
                    {post.author.avatar ? (
                      <Image source={{ uri: post.author.avatar }} style={styles.postAvatar} />
                    ) : (
                      <View style={[styles.postAvatar, styles.postAvatarPlaceholder]}>
                        <Text style={styles.postAvatarText}>
                          {getFirstName(post.author).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.postAuthorInfo}>
                    <View style={styles.postNameRow}>
                      <Text style={styles.postFirstName}>{getFirstName(post.author)}</Text>
                      {getLastName(post.author) !== "" && (
                        <Text style={styles.postLastName}>{getLastName(post.author)}</Text>
                      )}
                    </View>
                    <Text style={styles.postTime}>
                      {new Date(post.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  {(post.author.phone === profile.phone || post.author.name === profile.name) && (
                    <TouchableOpacity
                      onPress={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                      style={styles.menuButton}
                    >
                      <MoreVertical size={20} color={commonColors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {showPostMenu === post.id && (
                  <View style={styles.postMenu}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => setShowDeleteConfirm(post.id)}
                    >
                      <Trash2 size={18} color={commonColors.danger} />
                      <Text style={[styles.menuItemText, { color: commonColors.danger }]}>
                        {t.deletePost}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {post.content !== "" && <Text style={styles.postContent}>{post.content}</Text>}
                
                {post.image && (
                  <Image 
                    source={{ uri: post.image }} 
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLike(post.id)}
                  >
                    <Heart
                      size={20}
                      color={
                        post.likedBy.includes(profile.phone || "anonymous")
                          ? currentTheme.accent
                          : commonColors.textSecondary
                      }
                      fill={
                        post.likedBy.includes(profile.phone || "anonymous")
                          ? currentTheme.accent
                          : "transparent"
                      }
                    />
                    <Text style={styles.actionText}>{post.likes}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      setSelectedPost(selectedPost === post.id ? null : post.id)
                    }
                  >
                    <MessageCircle size={20} color={commonColors.textSecondary} />
                    <Text style={styles.actionText}>{post.comments.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={20} color={commonColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {selectedPost === post.id && (
                  <View style={styles.commentSection}>
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        style={styles.commentInput}
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder={t.enterComment}
                        placeholderTextColor={commonColors.textSecondary}
                      />
                      <TouchableOpacity onPress={() => handleComment(post.id)}>
                        <Send size={20} color={currentTheme.neon} />
                      </TouchableOpacity>
                    </View>

                    {post.comments.map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentAuthor}>
                          {getDisplayName(comment.author)}
                        </Text>
                        <Text style={styles.commentContent}>{comment.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            ))
          )}
        </ScrollView>

        {showDeleteConfirm && (
          <View style={styles.deleteOverlay}>
            <View style={[styles.deleteModal, { backgroundColor: currentTheme.gradient[1] }]}>
              <Text style={styles.deleteTitle}>{t.deletePost}</Text>
              <Text style={styles.deleteMessage}>{t.deletePostConfirm}</Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirm(null)}
                >
                  <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.confirmButton]}
                  onPress={() => handleDeletePost(showDeleteConfirm)}
                >
                  <Text style={styles.confirmButtonText}>{t.delete}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 16,
    marginHorizontal: -16,
    borderBottomWidth: 0,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0,
  },
  headerName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: commonColors.textPrimary,
  },
  shareButton: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  createPost: {
    padding: 14,
    gap: 12,
    marginVertical: 10,
    marginHorizontal: 0,
  },
  postInputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  postInput: {
    flex: 1,
    color: commonColors.textPrimary,
    fontSize: 14,
    minHeight: 60,
    maxHeight: 80,
    textAlignVertical: "top",
  },
  selectedImageContainer: {
    position: "relative" as const,
  },
  selectedImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  mediaButton: {
    padding: 8,
  },
  feed: {
    flex: 1,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  feedContent: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 14,
    color: commonColors.textSecondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  postCard: {
    padding: 14,
    gap: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    marginLeft: "auto",
    padding: 4,
  },
  postMenu: {
    backgroundColor: commonColors.glass,
    borderWidth: 0,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  postAvatarContainer: {
    width: 40,
    height: 40,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
  },
  postAvatarPlaceholder: {
    backgroundColor: "rgba(96,165,250,0.25)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#60a5fa",
  },
  postAuthorInfo: {
    flex: 1,
    gap: 2,
  },
  postNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  postFirstName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  postLastName: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: commonColors.textPrimary,
    opacity: 0.8,
  },
  postTime: {
    fontSize: 11,
    color: commonColors.textSecondary,
  },
  postContent: {
    fontSize: 14,
    color: commonColors.textPrimary,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  createPostActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  createPostButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createPostButtonSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  createPostButtonText: {
    color: commonColors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  createPostButtonTextSecondary: {
    color: commonColors.textSecondary,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  commentSection: {
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: commonColors.glass,
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
  },
  commentInput: {
    flex: 1,
    color: commonColors.textPrimary,
    fontSize: 13,
  },
  comment: {
    gap: 4,
    paddingLeft: 12,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
  },
  commentContent: {
    fontSize: 12,
    color: commonColors.textSecondary,
  },
  deleteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: commonColors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModal: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 32,
    minWidth: 280,
    borderWidth: 0,
  },
  deleteTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    textAlign: "center" as const,
    marginBottom: 6,
  },
  deleteMessage: {
    fontSize: 14,
    color: commonColors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: commonColors.glass,
    borderWidth: 0,
  },
  confirmButton: {
    backgroundColor: commonColors.danger,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: commonColors.textPrimary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.white,
  },
});
