import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Grid,
  List,
  Sparkles,
  Tag,
  User,
} from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { GlassButton } from "../GlassButton";
import { useAppState, Listing } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

interface ServiceAdsModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Ремонт",
  "Образование",
  "Транспорт",
  "Красота",
  "IT услуги",
  "Доставка",
  "Клининг",
  "Другое",
];

export function ServiceAdsModal({ visible, onClose }: ServiceAdsModalProps) {
  const { currentTheme, t, listings, addListing } = useAppState();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "create">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const myListings = listings.filter((l) => l.authorId === "me");
  const filteredListings = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  const handleCreateListing = () => {
    if (!newTitle || !newDescription || !newPrice || !newCategory) return;

    addListing({
      title: newTitle,
      description: newDescription,
      price: newPrice,
      category: newCategory,
      featured: false,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setNewTitle("");
      setNewDescription("");
      setNewPrice("");
      setNewCategory("");
      setActiveTab("my");
    }, 2000);
  };

  const renderListingCard = (listing: Listing) => (
    <TouchableOpacity
      key={listing.id}
      style={[styles.listingCard, viewMode === "grid" && styles.gridCard]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.04)"]}
        style={[styles.listingGradient, viewMode === "grid" && styles.gridGradient]}
      >
        {listing.image && (
          <Image
            source={{ uri: listing.image }}
            style={[styles.listingImage, viewMode === "grid" && styles.gridImage]}
          />
        )}
        <View style={[styles.listingInfo, viewMode === "grid" && styles.gridInfo]}>
          <View style={styles.listingHeader}>
            {listing.featured && (
              <View style={[styles.featuredBadge, { backgroundColor: currentTheme.accent + "30" }]}>
                <Sparkles size={12} color={currentTheme.accent} />
                <Text style={[styles.featuredText, { color: currentTheme.accent }]}>
                  {t.featured}
                </Text>
              </View>
            )}
            <Text style={styles.listingTitle} numberOfLines={viewMode === "grid" ? 2 : 1}>
              {listing.title}
            </Text>
          </View>

          <Text style={styles.listingDescription} numberOfLines={2}>
            {listing.description}
          </Text>

          <View style={styles.listingFooter}>
            <Text style={[styles.listingPrice, { color: currentTheme.accent }]}>
              {listing.price}
            </Text>
            <View style={styles.authorInfo}>
              {listing.authorAvatar ? (
                <Image source={{ uri: listing.authorAvatar }} style={styles.authorAvatar} />
              ) : (
                <View style={[styles.authorPlaceholder, { backgroundColor: currentTheme.accent + "30" }]}>
                  <User size={10} color={currentTheme.accent} />
                </View>
              )}
              <Text style={styles.authorName} numberOfLines={1}>
                {listing.authorName}
              </Text>
            </View>
          </View>

          <View style={styles.categoryTag}>
            <Tag size={12} color={commonColors.textSecondary} />
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCreateForm = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {showSuccess ? (
        <View style={[styles.successBanner, { backgroundColor: "#10b98130" }]}>
          <Sparkles size={32} color="#10b981" />
          <Text style={styles.successText}>{t.publish}</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.listingTitle}</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder={t.enterDescription}
              placeholderTextColor={commonColors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.listingDescription}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder={t.enterDescription}
              placeholderTextColor={commonColors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.listingPrice}</Text>
            <TextInput
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="например: 5000 KZT/час"
              placeholderTextColor={commonColors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.listingCategory}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    newCategory === cat && { backgroundColor: currentTheme.accent },
                  ]}
                  onPress={() => setNewCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      newCategory === cat && { color: "#ffffff" },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GlassButton
            title={t.createListing}
            onPress={handleCreateListing}
            variant="primary"
            accentColor={currentTheme.accent}
            style={styles.createButton}
          />
        </>
      )}
    </ScrollView>
  );

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.neon }]}>{t.serviceAds}</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "all" && { backgroundColor: currentTheme.accent + "25" },
            ]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeTab === "all" && { color: currentTheme.accent }]}
            >
              {t.allListings}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "my" && { backgroundColor: currentTheme.accent + "25" },
            ]}
            onPress={() => setActiveTab("my")}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeTab === "my" && { color: currentTheme.accent }]}
            >
              {t.yourListings}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "create" && { backgroundColor: currentTheme.accent + "25" },
            ]}
            onPress={() => setActiveTab("create")}
            activeOpacity={0.8}
          >
            <Plus
              size={16}
              color={activeTab === "create" ? currentTheme.accent : commonColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {activeTab !== "create" && (
          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedCategory && { backgroundColor: currentTheme.accent + "30" },
                ]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !selectedCategory && { color: currentTheme.accent },
                  ]}
                >
                  Все
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && { backgroundColor: currentTheme.accent + "30" },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat && { color: currentTheme.accent },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
                onPress={() => setViewMode("list")}
              >
                <List size={18} color={viewMode === "list" ? currentTheme.accent : commonColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === "grid" && styles.viewButtonActive]}
                onPress={() => setViewMode("grid")}
              >
                <Grid size={18} color={viewMode === "grid" ? currentTheme.accent : commonColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "create" ? (
          renderCreateForm()
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              viewMode === "grid" && styles.gridContainer,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {(activeTab === "all" ? filteredListings : myListings).length === 0 ? (
              <View style={styles.emptyState}>
                <Sparkles size={48} color={commonColors.textSecondary} />
                <Text style={styles.emptyText}>{t.noListings}</Text>
              </View>
            ) : (
              (activeTab === "all" ? filteredListings : myListings).map(renderListingCard)
            )}
          </ScrollView>
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
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  tabs: {
    flexDirection: "row" as const,
    gap: 6,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 4,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
    textAlign: "center" as const,
  },
  filterRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  categoryScroll: {
    gap: 8,
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  viewToggle: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderRadius: 14,
    padding: 2,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  viewButton: {
    padding: 8,
    borderRadius: 12,
  },
  viewButtonActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  scrollView: {
    maxHeight: 340,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  gridContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  },
  listingCard: {
    borderRadius: 14,
    overflow: "hidden" as const,
  },
  gridCard: {
    width: "48%",
    marginBottom: 10,
  },
  listingGradient: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 12,
  },
  gridGradient: {
    flexDirection: "column" as const,
    padding: 10,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  gridImage: {
    width: "100%",
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
  },
  listingInfo: {
    flex: 1,
    gap: 6,
  },
  gridInfo: {
    gap: 6,
  },
  listingHeader: {
    gap: 4,
  },
  featuredBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: commonColors.textPrimary,
    lineHeight: 20,
  },
  listingDescription: {
    fontSize: 12,
    color: commonColors.textSecondary,
    lineHeight: 18,
    flexShrink: 1,
  },
  listingFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  authorInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  authorName: {
    fontSize: 11,
    color: commonColors.textSecondary,
    maxWidth: 80,
  },
  categoryTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 11,
    color: commonColors.textSecondary,
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
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderRadius: 16,
    padding: 14,
    color: commonColors.textPrimary,
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
  categoryGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(12, 12, 18, 0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: commonColors.textSecondary,
  },
  createButton: {
    marginTop: 16,
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
