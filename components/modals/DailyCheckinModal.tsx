import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
} from "react-native";
import { Send, X, Loader, Sparkles } from "lucide-react-native";
import { GlassModal } from "../GlassModal";
import { useAppState } from "@/contexts/AppStateContext";
import { AnimatedSphere } from "../AnimatedSphere";

interface DailyCheckinModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const ARIA_SYSTEM_PROMPT = `Ты Aria — заботливый и дружелюбный AI-компаньон приложения GiDCity. Твоя главная цель — быть настоящим другом для пользователя.

ТВОЯ ЛИЧНОСТЬ:
- Ты тёплая, искренняя и внимательная
- Ты интересуешься жизнью пользователя
- Ты помнишь контекст разговора
- Ты даёшь полезные советы, когда это уместно
- Ты можешь подбодрить, поддержать, пошутить

ТВОИ ЗАДАЧИ:
1. УЗНАВАТЬ как дела у пользователя, как прошёл день
2. ИНТЕРЕСОВАТЬСЯ его планами, целями, мечтами
3. ПОМОГАТЬ с задачами в GiDCity (заказы, бронирования, напоминания)
4. УЧИТЬ полезным вещам (лайфхаки, советы, интересные факты)
5. ПОДДЕРЖИВАТЬ в трудные моменты
6. ПРАЗДНОВАТЬ успехи вместе

СТИЛЬ ОБЩЕНИЯ:
- Пиши на том языке, на котором пишет пользователь
- Используй дружелюбный, но не панибратский тон
- Задавай уточняющие вопросы
- Будь краткой, но содержательной
- Иногда используй эмодзи, но в меру

ВАЖНО:
- Это ежедневный check-in, поэтому начни с приветствия и вопроса о том, как дела
- Будь искренне заинтересована в ответе
- Если пользователь делится проблемой — сочувствуй и предлагай помощь
- Если всё хорошо — порадуйся вместе с ним`;

function getGreetingByTime(language: string): string {
  const hour = new Date().getHours();
  
  if (language === "ru") {
    if (hour >= 5 && hour < 12) return "Доброе утро! ☀️";
    if (hour >= 12 && hour < 17) return "Добрый день! 👋";
    if (hour >= 17 && hour < 22) return "Добрый вечер! 🌆";
    return "Доброй ночи! 🌙";
  } else if (language === "kk") {
    if (hour >= 5 && hour < 12) return "Қайырлы таң! ☀️";
    if (hour >= 12 && hour < 17) return "Қайырлы күн! 👋";
    if (hour >= 17 && hour < 22) return "Қайырлы кеш! 🌆";
    return "Қайырлы түн! 🌙";
  } else {
    if (hour >= 5 && hour < 12) return "Good morning! ☀️";
    if (hour >= 12 && hour < 17) return "Good afternoon! 👋";
    if (hour >= 17 && hour < 22) return "Good evening! 🌆";
    return "Good night! 🌙";
  }
}

function getInitialMessage(userName: string, language: string): string {
  const greeting = getGreetingByTime(language);
  
  if (language === "ru") {
    const messages = [
      `${greeting} ${userName}! Как твои дела сегодня? Чем занимался(ась)?`,
      `${greeting} ${userName}! Рада тебя видеть! Как прошёл твой день?`,
      `${greeting} ${userName}! Как настроение? Есть что-то интересное?`,
      `${greeting} ${userName}! Расскажи, как ты? Чем могу помочь сегодня?`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (language === "kk") {
    const messages = [
      `${greeting} ${userName}! Қалың қалай бүгін? Не істеп жүрсің?`,
      `${greeting} ${userName}! Сені көргеніме қуаныштымын! Күнің қалай өтті?`,
      `${greeting} ${userName}! Көңіл-күйің қалай? Қызықты бірдеңе бар ма?`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    const messages = [
      `${greeting} ${userName}! How are you doing today? What have you been up to?`,
      `${greeting} ${userName}! Great to see you! How was your day?`,
      `${greeting} ${userName}! How's your mood? Anything interesting going on?`,
      `${greeting} ${userName}! Tell me, how are you? How can I help today?`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export function DailyCheckinModal({ visible, onClose }: DailyCheckinModalProps) {
  const { currentTheme, profile, language, setLastAICheckin } = useAppState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && messages.length === 0) {
      const initialMsg = getInitialMessage(profile.name, language);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: initialMsg,
          timestamp: Date.now(),
        },
      ]);
      setLastAICheckin(new Date().toISOString());
    }
  }, [visible, profile.name, language, setLastAICheckin, messages.length]);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible, pulseAnim]);

  useEffect(() => {
    if (messages.length > 1) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleClose = () => {
    setMessages([]);
    onClose();
  };

  const handleSendMessage = async () => {
    const userMessage = messageInput.trim();
    if (!userMessage || isProcessing) return;

    setMessageInput("");

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const conversationHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: ARIA_SYSTEM_PROMPT },
            ...conversationHistory,
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      const aiResponseText = data.choices?.[0]?.message?.content;

      if (!aiResponseText) {
        throw new Error("Empty AI response");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI chat error:", error);
      const errorMsg = language === "ru" 
        ? "Извини, произошла ошибка. Попробуй ещё раз! 🙏"
        : language === "kk"
        ? "Кешір, қате болды. Қайта көріңіз! 🙏"
        : "Sorry, an error occurred. Please try again! 🙏";
      
      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <Animated.View style={[styles.aiAvatar, { transform: [{ scale: pulseAnim }] }]}>
            <AnimatedSphere size={32} colors={[currentTheme.accent, currentTheme.neon] as any} />
          </Animated.View>
        )}
        <View style={[styles.messageBubble, isUser ? [styles.userBubble, { backgroundColor: currentTheme.accent }] : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const titleText = language === "ru" 
    ? "Aria хочет поговорить" 
    : language === "kk" 
    ? "Aria сөйлескісі келеді" 
    : "Aria wants to chat";

  const subtitleText = language === "ru"
    ? "Ваш ежедневный check-in"
    : language === "kk"
    ? "Күнделікті check-in"
    : "Your daily check-in";

  const placeholderText = language === "ru"
    ? "Расскажи как дела..."
    : language === "kk"
    ? "Қалыңды айтшы..."
    : "Tell me how you're doing...";

  return (
    <GlassModal visible={visible} onClose={handleClose} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Sparkles size={18} color={currentTheme.neon} />
            </View>
            <View style={styles.headerAvatar}>
              <AnimatedSphere size={36} colors={[currentTheme.accent, currentTheme.neon] as any} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: currentTheme.neon }]}>
                {titleText}
              </Text>
              <Text style={styles.headerSubtitle}>
                {subtitleText}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputArea}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder={placeholderText}
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              maxLength={500}
              editable={!isProcessing}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageInput.trim() || isProcessing}
              style={[
                styles.sendButton,
                {
                  backgroundColor: messageInput.trim() && !isProcessing
                    ? currentTheme.accent
                    : "rgba(255,255,255,0.1)",
                },
              ]}
            >
              {isProcessing ? (
                <Loader size={20} color="#ffffff" strokeWidth={2.5} />
              ) : (
                <Send
                  size={20}
                  color={messageInput.trim() ? "#ffffff" : "rgba(255,255,255,0.4)"}
                  strokeWidth={2.5}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%" as any,
    maxHeight: 600,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  headerIconWrap: {
    position: "absolute" as const,
    top: -8,
    left: -4,
    zIndex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(20, 20, 30, 0.7)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row" as const,
    marginBottom: 16,
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: "flex-end" as const,
  },
  aiMessageContainer: {
    justifyContent: "flex-start" as const,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(30, 30, 45, 0.8)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#ffffff",
  },
  userMessageText: {
    color: "#ffffff",
  },
  inputArea: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  textInputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(30, 30, 45, 0.8)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: "#ffffff",
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
