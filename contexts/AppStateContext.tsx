import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeKey, themes } from "@/constants/colors";
import { City, cities } from "@/constants/cities";
import { Language, translations } from "@/constants/translations";


export interface Profile {
  name: string;
  surname: string;
  phone: string;
  avatar?: string;
}

export interface Reminder {
  id: string;
  date: string;
  time: string;
  note: string;
}

export interface Order {
  id: string;
  type: string;
  description: string;
  deadline: string;
  budget: string;
  status: "pending" | "accepted" | "completed";
  createdAt: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
}

export interface Proposal {
  id: string;
  orderId: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerRating: number;
  budget: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "proposal";
  proposalId?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: Profile[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  orderId?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  venueName: string;
  venueAddress: string;
  venueImage?: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  featured: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  recipient?: string;
  sender?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface ChatPost {
  id: string;
  author: Profile;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  likedBy: string[];
}

export interface Comment {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
  replies: Comment[];
}

export type BackgroundOverlay = "none" | "dark" | "light" | "blur";
export type AnimationType = "none" | "sphere" | "particles" | "waves" | "cubes" | "rings" | "lines" | "stars" | "gradientFlow" | "sparkles" | "hexagons";

interface AppState {
  theme: ThemeKey;
  city: City;
  profile: Profile;
  reminders: Reminder[];
  orders: Order[];
  chatPosts: ChatPost[];
  hasSeenWelcome: boolean;
  language: Language;
  customBackground?: string;
  backgroundOverlay: BackgroundOverlay;
  animationType: AnimationType;
  glassOpacity: number;
  proposals: Proposal[];
  chats: Chat[];
  bookings: Booking[];
  listings: Listing[];
  transactions: Transaction[];
  walletBalance: number;
  lastAICheckin: string | null;
  aiCheckinEnabled: boolean;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "order1",
    type: "Такси",
    description: "Нужно такси от ЖК Highvill до аэропорта Алматы",
    deadline: "Сегодня, 15:00",
    budget: "3500",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    customerId: "user1",
    customerName: "Алия Касымова",
    customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "order2",
    type: "Курьер",
    description: "Доставка документов из офиса на Достык 89 в бизнес-центр Нурлы Тау",
    deadline: "Сегодня, 12:00",
    budget: "2000",
    status: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    customerId: "user2",
    customerName: "Арман Жумабаев",
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "order3",
    type: "Мастер/Специалист",
    description: "Установка кондиционера в квартире. 2 блока. Высота потолков 3м.",
    deadline: "Завтра",
    budget: "45000",
    status: "pending",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    customerId: "user3",
    customerName: "Динара Нурланова",
    customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
];

const MOCK_CHATS: Chat[] = [
  {
    id: "chat1",
    participants: [
      { name: "Серик", surname: "Мастеров", phone: "+7 700 123 4567", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    ],
    messages: [
      { id: "m1", senderId: "provider1", content: "Здравствуйте! Готов выполнить ваш заказ на такси.", type: "text", createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "m2", senderId: "provider1", content: "", type: "proposal", proposalId: "prop1", createdAt: new Date(Date.now() - 1700000).toISOString() },
    ],
    lastMessage: { id: "m2", senderId: "provider1", content: "", type: "proposal", proposalId: "prop1", createdAt: new Date(Date.now() - 1700000).toISOString() },
    orderId: "order1",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "chat2",
    participants: [
      { name: "Айгуль", surname: "Бекетова", phone: "+7 701 234 5678", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
    ],
    messages: [
      { id: "m3", senderId: "provider2", content: "Добрый день! Могу доставить ваши документы.", type: "text", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "m4", senderId: "me", content: "Отлично, когда можете забрать?", type: "text", createdAt: new Date(Date.now() - 3500000).toISOString() },
    ],
    lastMessage: { id: "m4", senderId: "me", content: "Отлично, когда можете забрать?", type: "text", createdAt: new Date(Date.now() - 3500000).toISOString() },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop1",
    orderId: "order1",
    providerId: "provider1",
    providerName: "Серик Мастеров",
    providerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    providerRating: 4.8,
    budget: "3200",
    message: "Здравствуйте! Готов выполнить заказ. Машина Toyota Camry, кондиционер, чисто.",
    status: "pending",
    createdAt: new Date(Date.now() - 1700000).toISOString(),
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "book1",
    venueName: "Del Papa",
    venueAddress: "ул. Гоголя, 39",
    venueImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    date: "2025-11-28",
    time: "19:00",
    guests: 4,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "book2",
    venueName: "Наша Italia",
    venueAddress: "пр. Достык, 89",
    venueImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    date: "2025-12-01",
    time: "20:00",
    guests: 2,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_LISTINGS: Listing[] = [
  {
    id: "list1",
    title: "Ремонт квартир под ключ",
    description: "Профессиональный ремонт любой сложности. Гарантия 2 года.",
    price: "от 15000 KZT/м²",
    category: "Ремонт",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400",
    authorId: "prov1",
    authorName: "Ремонт Про",
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "list2",
    title: "Услуги репетитора по английскому",
    description: "Индивидуальные занятия, подготовка к IELTS, деловой английский.",
    price: "5000 KZT/час",
    category: "Образование",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
    authorId: "prov2",
    authorName: "Анна Иванова",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "list3",
    title: "Такси бизнес-класса",
    description: "Mercedes E-class, Toyota Camry. Встреча в аэропорту, межгород.",
    price: "от 2000 KZT",
    category: "Транспорт",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
    authorId: "prov3",
    authorName: "VIP Такси",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tr1",
    type: "income",
    amount: 15000,
    description: "Оплата за заказ #1234",
    sender: "Алия Касымова",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "tr2",
    type: "expense",
    amount: 3500,
    description: "Оплата такси",
    recipient: "Серик Мастеров",
    status: "completed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "tr3",
    type: "income",
    amount: 50000,
    description: "Пополнение баланса",
    status: "completed",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const DEFAULT_STATE: AppState = {
  theme: "ios26Glass",
  city: cities[0],
  profile: {
    name: "Пользователь",
    surname: "GiDCity",
    phone: "+7 700 000 0000",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
  },
  reminders: [],
  orders: MOCK_ORDERS,
  chatPosts: [],
  hasSeenWelcome: false,
  language: "ru",
  customBackground: undefined,
  backgroundOverlay: "none",
  animationType: "sphere",
  glassOpacity: 0.08,
  proposals: MOCK_PROPOSALS,
  chats: MOCK_CHATS,
  bookings: MOCK_BOOKINGS,
  listings: MOCK_LISTINGS,
  transactions: MOCK_TRANSACTIONS,
  walletBalance: 61500,
  lastAICheckin: null,
  aiCheckinEnabled: true,
};

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("gidcity_state");
      if (stored) {
        try {
          if (stored.trim().length === 0) {
            setState(DEFAULT_STATE);
            setIsLoaded(true);
            return;
          }

          if (!stored.startsWith('{')) {
            setState(DEFAULT_STATE);
            setIsLoaded(true);
            return;
          }

          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setState({ ...DEFAULT_STATE, ...parsed });
          } else {
            setState(DEFAULT_STATE);
          }
        } catch (parseError) {
          console.log("JSON parse error:", parseError);
          setState(DEFAULT_STATE);
        }
      }
      setIsLoaded(true);
    } catch (error) {
      console.log("Error loading state:", error);
      setIsLoaded(true);
    }
  }, []);

  const saveState = useCallback(async (stateToSave: AppState) => {
    try {
      await AsyncStorage.setItem("gidcity_state", JSON.stringify(stateToSave));
    } catch (error) {
      console.log("Error saving state:", error);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveState(state);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [state, isLoaded, saveState]);

  const setTheme = useCallback((theme: ThemeKey) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const setCity = useCallback((city: City) => {
    setState((prev) => ({ ...prev, city }));
  }, []);

  const setProfile = useCallback((profile: Profile) => {
    setState((prev) => ({ ...prev, profile }));
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, "id">) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      reminders: [...prev.reminders, newReminder],
    }));
  }, []);

  const removeReminder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  }, []);

  const addOrder = useCallback((order: Omit<Order, "id" | "status" | "createdAt" | "customerId" | "customerName" | "customerAvatar">) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      customerId: "me",
      customerName: state.profile.name + " " + state.profile.surname,
      customerAvatar: state.profile.avatar,
    };
    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));
  }, [state.profile]);

  const addProposal = useCallback((proposal: Omit<Proposal, "id" | "status" | "createdAt">) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      proposals: [...prev.proposals, newProposal],
    }));
  }, []);

  const updateProposalStatus = useCallback((proposalId: string, status: "accepted" | "declined") => {
    setState((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) =>
        p.id === proposalId ? { ...p, status } : p
      ),
    }));
  }, []);

  const addBooking = useCallback((booking: Omit<Booking, "id" | "status" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
    }));
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      ),
    }));
  }, []);

  const addListing = useCallback((listing: Omit<Listing, "id" | "createdAt" | "authorId" | "authorName" | "authorAvatar">) => {
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      authorId: "me",
      authorName: state.profile.name + " " + state.profile.surname,
      authorAvatar: state.profile.avatar,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      listings: [newListing, ...prev.listings],
    }));
  }, [state.profile]);

  const addTransaction = useCallback((transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      walletBalance: transaction.type === "income" 
        ? prev.walletBalance + transaction.amount 
        : prev.walletBalance - transaction.amount,
    }));
  }, []);

  const addChatMessage = useCallback((chatId: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: newMessage }
          : chat
      ),
    }));
  }, []);

  const addChatPost = useCallback((post: Omit<ChatPost, "id" | "likes" | "comments" | "createdAt" | "likedBy">) => {
    const newPost: ChatPost = {
      ...post,
      id: Date.now().toString(),
      likes: 0,
      comments: [],
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      chatPosts: [newPost, ...prev.chatPosts],
    }));
  }, []);

  const toggleLike = useCallback((postId: string, userId: string) => {
    setState((prev) => ({
      ...prev,
      chatPosts: prev.chatPosts.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likedBy.includes(userId);
          return {
            ...post,
            likes: hasLiked ? post.likes - 1 : post.likes + 1,
            likedBy: hasLiked
              ? post.likedBy.filter((id) => id !== userId)
              : [...post.likedBy, userId],
          };
        }
        return post;
      }),
    }));
  }, []);

  const addComment = useCallback((postId: string, comment: Omit<Comment, "id" | "createdAt" | "replies">) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setState((prev) => ({
      ...prev,
      chatPosts: prev.chatPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      }),
    }));
  }, []);

  const deletePost = useCallback((postId: string) => {
    setState((prev) => ({
      ...prev,
      chatPosts: prev.chatPosts.filter((post) => post.id !== postId),
    }));
  }, []);

  const setHasSeenWelcome = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, hasSeenWelcome: value }));
  }, []);

  const setCustomBackground = useCallback((uri?: string) => {
    setState((prev) => ({ ...prev, customBackground: uri }));
  }, []);

  const setBackgroundOverlay = useCallback((overlay: BackgroundOverlay) => {
    setState((prev) => ({ ...prev, backgroundOverlay: overlay }));
  }, []);

  const setAnimationType = useCallback((animationType: AnimationType) => {
    setState((prev) => ({ ...prev, animationType }));
  }, []);

  const setGlassOpacity = useCallback((glassOpacity: number) => {
    setState((prev) => ({ ...prev, glassOpacity }));
  }, []);

  const setLastAICheckin = useCallback((date: string | null) => {
    setState((prev) => ({ ...prev, lastAICheckin: date }));
  }, []);

  const setAICheckinEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, aiCheckinEnabled: enabled }));
  }, []);

  const currentTheme = useMemo(() => themes[state.theme] || themes.ios26Glass, [state.theme]);
  const t = useMemo(() => translations[state.language], [state.language]);

  return useMemo(
    () => ({
      ...state,
      currentTheme,
      t,
      isLoaded,
      setTheme,
      setCity,
      setProfile,
      setLanguage,
      addReminder,
      removeReminder,
      addOrder,
      addChatPost,
      toggleLike,
      addComment,
      deletePost,
      setHasSeenWelcome,
      setCustomBackground,
      setBackgroundOverlay,
      setAnimationType,
      setGlassOpacity,
      addProposal,
      updateProposalStatus,
      addBooking,
      cancelBooking,
      addListing,
      addTransaction,
      addChatMessage,
      setLastAICheckin,
      setAICheckinEnabled,
    }),
    [
      state,
      currentTheme,
      t,
      isLoaded,
      setTheme,
      setCity,
      setProfile,
      setLanguage,
      addReminder,
      removeReminder,
      addOrder,
      addChatPost,
      toggleLike,
      addComment,
      deletePost,
      setHasSeenWelcome,
      setCustomBackground,
      setBackgroundOverlay,
      setAnimationType,
      setGlassOpacity,
      addProposal,
      updateProposalStatus,
      addBooking,
      cancelBooking,
      addListing,
      addTransaction,
      addChatMessage,
      setLastAICheckin,
      setAICheckinEnabled,
    ]
  );
});
