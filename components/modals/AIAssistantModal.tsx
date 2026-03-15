import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  TextInput,
  FlatList,
} from "react-native";
import { Mic, Loader, StopCircle, Send, X, Car, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react-native";
import { Audio } from "expo-av";
import { GlassModal } from "../GlassModal";
import { useAppState } from "@/contexts/AppStateContext";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { AnimatedSphere } from "../AnimatedSphere";

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: AIAction) => void;
}

export interface AIAction {
  type: "order" | "reminder" | "navigate" | "taxi_order_created" | "unknown";
  data?: any;
  preview?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  taxiCard?: TaxiOrderData;
  isOrderCreated?: boolean;
}

interface TaxiOrderData {
  from: string;
  to: string;
  time: string;
  budget: string;
}

type TaxiFlowStep = "idle" | "ask_from" | "ask_to" | "ask_time" | "ask_budget" | "confirm" | "done";

export function AIAssistantModal({ visible, onClose, onAction }: AIAssistantModalProps) {
  const { currentTheme, t, addOrder } = useAppState();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t.gidAssistantSubtitle || "Здравствуйте! Я ваш AI-ассистент. Чем могу помочь?",
      timestamp: Date.now(),
    },
  ]);

  const [taxiFlowStep, setTaxiFlowStep] = useState<TaxiFlowStep>("idle");
  const [taxiData, setTaxiData] = useState<TaxiOrderData>({ from: "", to: "", time: "", budget: "" });

  const recording = useRef<Audio.Recording | null>(null);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const flatListRef = useRef<FlatList | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnim.stopAnimation();
    waveAnim.setValue(0);
  };

  const addAssistantMessage = useCallback((content: string, extra?: Partial<Message>) => {
    const msg: Message = {
      id: (Date.now() + Math.random()).toString(),
      role: "assistant",
      content,
      timestamp: Date.now(),
      ...extra,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const isTaxiIntent = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const taxiKeywords = [
      "такси", "taxi", "таксі",
      "закажи такси", "вызови такси", "нужно такси",
      "заказать такси", "хочу такси", "мне такси",
      "order taxi", "book taxi", "need a taxi", "call a taxi",
    ];
    return taxiKeywords.some((kw) => lower.includes(kw));
  }, []);

  const isConfirmation = useCallback((text: string): boolean => {
    const lower = text.toLowerCase().trim();
    const yesWords = ["да", "yes", "ия", "иә", "конечно", "подтверждаю", "ок", "ok", "давай", "оформляй", "заказывай", "sure", "yep", "yeah"];
    return yesWords.some((w) => lower === w || lower.startsWith(w + " ") || lower.startsWith(w + ",") || lower.startsWith(w + "."));
  }, []);

  const handleTaxiFlow = useCallback((userText: string) => {
    console.log("Taxi flow step:", taxiFlowStep, "user:", userText);

    if (taxiFlowStep === "idle" || taxiFlowStep === "done") {
      setTaxiData({ from: "", to: "", time: "", budget: "" });
      addUserMessage(userText);
      addAssistantMessage(`🚖 ${t.taxiWhereFrom}`);
      setTaxiFlowStep("ask_from");
      return true;
    }

    if (taxiFlowStep === "ask_from") {
      addUserMessage(userText);
      setTaxiData((prev) => ({ ...prev, from: userText }));
      addAssistantMessage(`📍 ${t.taxiWhereTo}`);
      setTaxiFlowStep("ask_to");
      return true;
    }

    if (taxiFlowStep === "ask_to") {
      addUserMessage(userText);
      setTaxiData((prev) => ({ ...prev, to: userText }));
      addAssistantMessage(`🕐 ${t.taxiWhenTime}`);
      setTaxiFlowStep("ask_time");
      return true;
    }

    if (taxiFlowStep === "ask_time") {
      addUserMessage(userText);
      setTaxiData((prev) => ({ ...prev, time: userText }));
      addAssistantMessage(`💰 ${t.taxiWhatBudget}`);
      setTaxiFlowStep("ask_budget");
      return true;
    }

    if (taxiFlowStep === "ask_budget") {
      addUserMessage(userText);
      const finalData: TaxiOrderData = { ...taxiData, budget: userText };
      setTaxiData(finalData);

      addAssistantMessage(
        `${t.taxiConfirmOrder}\n\n${t.taxiConfirmYes}`,
        { taxiCard: finalData }
      );
      setTaxiFlowStep("confirm");
      return true;
    }

    if (taxiFlowStep === "confirm") {
      addUserMessage(userText);
      if (isConfirmation(userText)) {
        const finalData = { ...taxiData };
        if (!finalData.budget && userText) {
          finalData.budget = userText;
        }

        addOrder({
          type: t.taxi,
          description: `${t.taxiFrom}: ${finalData.from} → ${t.taxiTo}: ${finalData.to}`,
          deadline: finalData.time,
          budget: finalData.budget,
          startingPoint: finalData.from,
          destination: finalData.to,
        });

        console.log("Taxi order created:", finalData);

        addAssistantMessage(
          `✅ ${t.taxiOrderCreated}`,
          { isOrderCreated: true }
        );

        onAction({ type: "taxi_order_created", data: finalData });
        setTaxiFlowStep("done");
        setTaxiData({ from: "", to: "", time: "", budget: "" });
      } else {
        addAssistantMessage("Заказ отменён. Если хотите заказать такси снова, просто скажите!");
        setTaxiFlowStep("idle");
        setTaxiData({ from: "", to: "", time: "", budget: "" });
      }
      return true;
    }

    return false;
  }, [taxiFlowStep, taxiData, t, addOrder, addUserMessage, addAssistantMessage, isConfirmation, onAction]);

  const startRecordingMobile = async () => {
    try {
      console.log("Requesting permissions for mobile recording...");
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== "granted") {
        setError(t.micPermissionDenied);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting mobile recording...");
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      recording.current = newRecording;
      setIsRecording(true);
      startWaveAnimation();
      console.log("Mobile recording started");
    } catch (err) {
      console.error("Failed to start mobile recording:", err);
      setError(t.recordingFailed);
    }
  };

  const startRecordingWeb = async () => {
    try {
      console.log("Requesting permissions for web recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunks.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
      startWaveAnimation();
      console.log("Web recording started");
    } catch (err) {
      console.error("Failed to start web recording:", err);
      setError(t.recordingFailed);
    }
  };

  const startRecording = async () => {
    setError("");
    if (Platform.OS === "web") {
      await startRecordingWeb();
    } else {
      await startRecordingMobile();
    }
  };

  const stopRecordingMobile = async () => {
    try {
      console.log("Stopping mobile recording...");
      if (!recording.current) return;

      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      console.log("Mobile recording stopped, URI:", uri);

      if (uri) {
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const audioFile = {
          uri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        };

        await transcribeAudio(audioFile);
      }

      recording.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err) {
      console.error("Failed to stop mobile recording:", err);
      setError(t.recordingFailed);
    }
  };

  const stopRecordingWeb = () => {
    console.log("Stopping web recording...");
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    stopWaveAnimation();

    if (Platform.OS === "web") {
      stopRecordingWeb();
    } else {
      await stopRecordingMobile();
    }
  };

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

  const transcribeAudio = async (audio: any) => {
    try {
      setIsProcessing(true);
      console.log("Transcribing audio...");

      const formData = new FormData();
      formData.append("audio", audio as any);

      const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      console.log("Transcription result:", data);
      await handleSendMessage(data.text);
    } catch (err) {
      console.error("Transcription error:", err);
      setError(t.transcriptionFailed);
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const userMessage = (text ?? messageInput).trim();
    if (!userMessage || isProcessing) return;

    setMessageInput("");
    setError("");

    if (taxiFlowStep !== "idle" && taxiFlowStep !== "done") {
      handleTaxiFlow(userMessage);
      return;
    }

    if (isTaxiIntent(userMessage)) {
      handleTaxiFlow(userMessage);
      return;
    }

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

      const systemPrompt = `You are Aria, an AI assistant for GiDCity app. Respond helpfully to: "${userMessage}". If the user asks for taxi, tell them you can help order a taxi. If it's an order/service request, confirm you understand. If it's a reminder, acknowledge it. Be friendly and conversational in the same language as the user. Keep responses brief and natural.`;

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error("OpenAI API key is not configured");
        throw new Error("API ключ не настроен");
      }

      console.log("Sending request to OpenAI...");
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
          ],
        }),
      });

      const data = await response.json();
      console.log("OpenAI response status:", response.status);
      
      if (!response.ok) {
        console.error("OpenAI API error:", data);
        throw new Error(data.error?.message || `API ошибка: ${response.status}`);
      }

      const aiResponseText = data.choices?.[0]?.message?.content;
      
      if (!aiResponseText) {
        console.error("No content in OpenAI response:", data);
        throw new Error("Пустой ответ от AI");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      await checkForActions(userMessage);
    } catch (err: any) {
      console.error("AI chat error:", err);
      const errorMessage = err?.message || "Произошла ошибка при обработке вашего сообщения.";
      setError(errorMessage);
      
      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Извините, произошла ошибка: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkForActions = async (command: string) => {
    try {
      const commandSchema = z.object({
        intent: z.enum(["order", "reminder", "navigate", "unknown"]),
        serviceType: z.string().optional(),
        description: z.string().optional(),
        deadline: z.string().optional(),
        budget: z.string().optional(),
        startingPoint: z.string().optional(),
        destination: z.string().optional(),
        reminderNote: z.string().optional(),
        reminderDate: z.string().optional(),
        reminderTime: z.string().optional(),
        navigateTo: z.string().optional(),
      });

      const result = (await generateObject({
        messages: [
          {
            role: "user",
            content: `Analyze if this message contains an actionable request: "${command}". 
            Extract intent and data if it's an order, reminder, or navigation request.`,
          },
        ],
        schema: commandSchema as any,
      })) as z.infer<typeof commandSchema>;

      if (result.intent === "order") {
        const type = result.serviceType || t.gidRequest;
        const description = result.description || "";
        const deadline = result.deadline || "";
        const budget = result.budget || "";
        const startingPoint = result.startingPoint || "";
        const destination = result.destination || "";

        onAction({
          type: "order",
          data: { type, description, deadline, budget, startingPoint, destination },
        });
      } else if (result.intent === "reminder") {
        const date = result.reminderDate || "";
        const time = result.reminderTime || "";
        const note = result.reminderNote || command;

        onAction({
          type: "reminder",
          data: { date, time, note },
        });
      } else if (result.intent === "navigate" && result.navigateTo) {
        const normalizedScreen = result.navigateTo.toLowerCase().trim();
        if (normalizedScreen === "work" || normalizedScreen === "services") {
          onAction({
            type: "navigate",
            data: { screen: normalizedScreen as "work" | "services" },
          });
        }
      }
    } catch (err) {
      console.error("Error checking actions:", err);
    }
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const renderTaxiCard = (data: TaxiOrderData) => (
    <View style={styles.taxiCard}>
      <View style={styles.taxiCardHeader}>
        <Car size={18} color="#fbbf24" />
        <Text style={styles.taxiCardTitle}>{t.taxiOrderCard}</Text>
      </View>
      <View style={styles.taxiCardRow}>
        <MapPin size={14} color="#10b981" />
        <Text style={styles.taxiCardLabel}>{t.taxiFrom}:</Text>
        <Text style={styles.taxiCardValue}>{data.from}</Text>
      </View>
      <View style={styles.taxiCardRow}>
        <MapPin size={14} color="#ef4444" />
        <Text style={styles.taxiCardLabel}>{t.taxiTo}:</Text>
        <Text style={styles.taxiCardValue}>{data.to}</Text>
      </View>
      <View style={styles.taxiCardRow}>
        <Clock size={14} color="#60a5fa" />
        <Text style={styles.taxiCardLabel}>{t.taxiTime}:</Text>
        <Text style={styles.taxiCardValue}>{data.time}</Text>
      </View>
      <View style={styles.taxiCardRow}>
        <DollarSign size={14} color="#fbbf24" />
        <Text style={styles.taxiCardLabel}>{t.taxiBudget}:</Text>
        <Text style={styles.taxiCardValue}>{data.budget} ₸</Text>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <AnimatedSphere size={32} colors={[currentTheme.accent, currentTheme.neon] as any} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? [styles.userBubble, { backgroundColor: currentTheme.accent }] : styles.aiBubble]}>
          {item.taxiCard && renderTaxiCard(item.taxiCard)}
          {item.isOrderCreated && (
            <View style={styles.orderCreatedBadge}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.orderCreatedText}>{t.taxiOrderCreated}</Text>
            </View>
          )}
          {!item.isOrderCreated && (
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <GlassModal visible={visible} onClose={onClose} scrollable={false}>
      <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerAvatar}>
                <AnimatedSphere size={36} colors={[currentTheme.accent, currentTheme.neon] as any} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: currentTheme.neon }]}>
                  {t.aiAssistant} Aria
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isProcessing ? t.recording || "Печатает..." : taxiFlowStep !== "idle" && taxiFlowStep !== "done" ? "🚖 Оформление такси..." : "В сети"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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

          {error !== "" && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputArea}>
            {!isRecording ? (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={messageInput}
                  onChangeText={setMessageInput}
                  placeholder={
                    taxiFlowStep === "ask_from" ? t.taxiWhereFrom :
                    taxiFlowStep === "ask_to" ? t.taxiWhereTo :
                    taxiFlowStep === "ask_time" ? t.taxiWhenTime :
                    taxiFlowStep === "ask_budget" ? t.taxiWhatBudget :
                    taxiFlowStep === "confirm" ? t.taxiConfirmYes :
                    t.typeCommand || "Введите сообщение..."
                  }
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  maxLength={500}
                  editable={!isProcessing}
                />
                <TouchableOpacity
                  onPress={startRecording}
                  disabled={isProcessing}
                  style={styles.micButton}
                >
                  <Mic size={20} color={currentTheme.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSendMessage()}
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
            ) : (
              <View style={styles.recordingContainer}>
                <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: waveScale }] }]}>
                  <View style={[styles.recordingDot, { backgroundColor: "#ef4444" }]} />
                </Animated.View>
                <Text style={styles.recordingText}>{t.recordingTapToStop || "Запись... Нажмите для остановки"}</Text>
                <TouchableOpacity
                  onPress={stopRecording}
                  style={[styles.stopButton, { backgroundColor: "#ef4444" }]}
                >
                  <StopCircle size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%' as any,
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
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  headerSubtitle: {
    fontSize: 11,
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
  taxiCard: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    gap: 8,
  },
  taxiCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  taxiCardTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#fbbf24",
  },
  taxiCardRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  taxiCardLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.6)",
    minWidth: 55,
  },
  taxiCardValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#ffffff",
    flex: 1,
  },
  orderCreatedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 4,
  },
  orderCreatedText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#10b981",
    flex: 1,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    textAlign: "center" as const,
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
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(30, 30, 45, 0.8)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  recordingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  recordingIndicator: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recordingText: {
    flex: 1,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500" as const,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
