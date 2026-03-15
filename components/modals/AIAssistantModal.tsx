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
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Mic, Loader, StopCircle, Send, X, Car, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react-native";
import { Audio } from "expo-av";
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
  type: "order" | "reminder" | "navigate" | "unknown" | "autoOrder";
  data?: any;
  preview?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  orderCard?: OrderCardData | null;
}

interface OrderCardData {
  type: string;
  fromLocation: string;
  toLocation: string;
  time: string;
  budget: string;
  confirmed: boolean;
  serviceType: string;
  description?: string;
  deadline?: string;
}

type TaxiFlowStep = "idle" | "from" | "to" | "time" | "budget" | "confirm" | "done";

export function AIAssistantModal({ visible, onClose, onAction }: AIAssistantModalProps) {
  const { currentTheme, t, addOrder, glassOpacity } = useAppState();
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

  const [taxiFlow, setTaxiFlow] = useState<TaxiFlowStep>("idle");
  const [pendingOrder, setPendingOrder] = useState<OrderCardData>({
    type: "",
    fromLocation: "",
    toLocation: "",
    time: "",
    budget: "",
    confirmed: false,
    serviceType: "",
  });

  const recording = useRef<Audio.Recording | null>(null);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const flatListRef = useRef<FlatList | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 10 }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnim.stopAnimation();
    waveAnim.setValue(0);
  };

  const startRecordingMobile = async () => {
    try {
      console.log("Requesting permissions for mobile recording...");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setError(t.micPermissionDenied);
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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
        web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
      });
      recording.current = newRecording;
      setIsRecording(true);
      startWaveAnimation();
    } catch (err) {
      console.error("Failed to start mobile recording:", err);
      setError(t.recordingFailed);
    }
  };

  const startRecordingWeb = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
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
      if (!recording.current) return;
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      if (uri) {
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const audioFile = { uri, name: `recording.${fileType}`, type: `audio/${fileType}` };
        await transcribeAudio(audioFile);
      }
      recording.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (err) {
      console.error("Failed to stop mobile recording:", err);
      setError(t.recordingFailed);
    }
  };

  const stopRecordingWeb = () => {
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
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
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
      if (!response.ok) throw new Error("Transcription failed");
      const data = await response.json();
      console.log("Transcription result:", data);
      await handleSendMessage(data.text);
    } catch (err) {
      console.error("Transcription error:", err);
      setError(t.transcriptionFailed);
      setIsProcessing(false);
    }
  };

  const addAiMessage = useCallback((content: string, orderCard?: OrderCardData | null) => {
    const msg: Message = {
      id: (Date.now() + Math.random()).toString(),
      role: "assistant",
      content,
      timestamp: Date.now(),
      orderCard: orderCard ?? null,
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

  const handleTaxiFlow = useCallback(async (userText: string, currentStep: TaxiFlowStep) => {
    const normalizedText = userText.trim().toLowerCase();

    if (currentStep === "from") {
      setPendingOrder((prev) => ({ ...prev, fromLocation: userText.trim() }));
      addAiMessage(`📍 ${t.fromWhere}: ${userText.trim()}\n\n${t.toWhere}?`);
      setTaxiFlow("to");
      return true;
    }

    if (currentStep === "to") {
      setPendingOrder((prev) => ({ ...prev, toLocation: userText.trim() }));
      addAiMessage(`📍 ${t.toWhere}: ${userText.trim()}\n\n${t.orderTime}?`);
      setTaxiFlow("time");
      return true;
    }

    if (currentStep === "time") {
      setPendingOrder((prev) => ({ ...prev, time: userText.trim() }));
      addAiMessage(`🕐 ${t.orderTime}: ${userText.trim()}\n\n${t.budget}?`);
      setTaxiFlow("budget");
      return true;
    }

    if (currentStep === "budget") {
      const updatedOrder = { ...pendingOrder, budget: userText.trim() };
      setPendingOrder(updatedOrder);

      addAiMessage(
        `${t.confirmOrder}`,
        {
          ...updatedOrder,
          budget: userText.trim(),
          confirmed: false,
          type: t.taxi,
          serviceType: "taxi",
        }
      );
      setTaxiFlow("confirm");
      return true;
    }

    if (currentStep === "confirm") {
      const isYes = normalizedText === "да" ||
        normalizedText === "yes" ||
        normalizedText === "ия" ||
        normalizedText === "иә" ||
        normalizedText === "конечно" ||
        normalizedText === "подтверждаю" ||
        normalizedText === "оформить" ||
        normalizedText === "давай" ||
        normalizedText === "ок" ||
        normalizedText === "ok" ||
        normalizedText.includes("да") ||
        normalizedText.includes("yes");

      if (isYes) {
        addOrder({
          type: t.taxi,
          description: `${t.fromWhere}: ${pendingOrder.fromLocation} → ${t.toWhere}: ${pendingOrder.toLocation}`,
          deadline: pendingOrder.time,
          budget: pendingOrder.budget,
        });

        const confirmedOrder = { ...pendingOrder, confirmed: true, type: t.taxi, serviceType: "taxi" };
        setPendingOrder(confirmedOrder);

        addAiMessage(
          `✅ ${t.orderConfirmed}\n\n🚕 ${t.taxi}\n📍 ${pendingOrder.fromLocation} → ${pendingOrder.toLocation}\n🕐 ${pendingOrder.time}\n💰 ${pendingOrder.budget} ₸`,
          { ...confirmedOrder, confirmed: true }
        );

        setTaxiFlow("done");
        setTimeout(() => {
          setTaxiFlow("idle");
          setPendingOrder({ type: "", fromLocation: "", toLocation: "", time: "", budget: "", confirmed: false, serviceType: "" });
        }, 1000);
        return true;
      } else {
        addAiMessage("Заказ отменён. Чем ещё могу помочь?");
        setTaxiFlow("idle");
        setPendingOrder({ type: "", fromLocation: "", toLocation: "", time: "", budget: "", confirmed: false, serviceType: "" });
        return true;
      }
    }

    return false;
  }, [pendingOrder, addAiMessage, addOrder, t]);

  const handleSendMessage = async (text?: string) => {
    const userMessage = (text ?? messageInput).trim();
    if (!userMessage || isProcessing) return;

    setMessageInput("");
    setError("");
    addUserMessage(userMessage);

    if (taxiFlow !== "idle") {
      setIsProcessing(true);
      const handled = await handleTaxiFlow(userMessage, taxiFlow);
      setIsProcessing(false);
      if (handled) return;
    }

    setIsProcessing(true);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role === "system" ? ("assistant" as const) : msg.role,
        content: msg.content,
      }));

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) throw new Error("API ключ не настроен");

      const systemPrompt = `You are Aria, an AI assistant for GiDCity app. You help users order services, book taxis, and more.
IMPORTANT: If the user asks to order a taxi (such as "закажи такси", "нужно такси", "taxi please", etc.), respond EXACTLY with: "🚕 Хорошо, оформляю такси! Откуда?"
Do NOT ask for all details at once. Ask one question at a time.
Be friendly, brief, and conversational. Respond in the same language as the user.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `API ошибка: ${response.status}`);

      const aiResponseText = data.choices?.[0]?.message?.content;
      if (!aiResponseText) throw new Error("Пустой ответ от AI");

      addAiMessage(aiResponseText);

      await detectAndStartFlow(userMessage, aiResponseText);
    } catch (err: any) {
      console.error("AI chat error:", err);
      const errorMessage = err?.message || "Произошла ошибка при обработке вашего сообщения.";
      setError(errorMessage);
      addAiMessage(`Извините, произошла ошибка: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectAndStartFlow = async (userText: string, _aiResponse: string) => {
    try {
      const commandSchema = z.object({
        intent: z.enum(["taxi", "order", "reminder", "navigate", "unknown"]),
        fromLocation: z.string().optional(),
        toLocation: z.string().optional(),
        time: z.string().optional(),
        budget: z.string().optional(),
        serviceType: z.string().optional(),
        description: z.string().optional(),
        deadline: z.string().optional(),
        navigateTo: z.string().optional(),
        reminderNote: z.string().optional(),
        reminderDate: z.string().optional(),
        reminderTime: z.string().optional(),
      });

      const result = (await generateObject({
        messages: [
          {
            role: "user",
            content: `Analyze: "${userText}". Is this a taxi request, order, reminder, or navigation? Extract all available data. If they mention locations for taxi, extract fromLocation and toLocation.`,
          },
        ],
        schema: commandSchema as any,
      })) as z.infer<typeof commandSchema>;

      console.log("Intent detection result:", result);

      if (result.intent === "taxi") {
        const newOrder: OrderCardData = {
          type: t.taxi,
          fromLocation: result.fromLocation || "",
          toLocation: result.toLocation || "",
          time: result.time || "",
          budget: result.budget || "",
          confirmed: false,
          serviceType: "taxi",
        };
        setPendingOrder(newOrder);

        if (result.fromLocation && result.toLocation && result.time && result.budget) {
          addAiMessage(
            t.confirmOrder,
            { ...newOrder, confirmed: false }
          );
          setTaxiFlow("confirm");
        } else if (result.fromLocation && result.toLocation) {
          addAiMessage(`📍 ${result.fromLocation} → ${result.toLocation}\n\n${t.orderTime}?`);
          setTaxiFlow("time");
        } else if (result.fromLocation) {
          addAiMessage(`📍 ${t.fromWhere}: ${result.fromLocation}\n\n${t.toWhere}?`);
          setTaxiFlow("to");
        } else {
          setTaxiFlow("from");
        }
      } else if (result.intent === "order" && result.serviceType) {
        onAction({
          type: "order",
          data: {
            type: result.serviceType,
            description: result.description || "",
            deadline: result.deadline || "",
            budget: result.budget || "",
          },
        });
      } else if (result.intent === "navigate" && result.navigateTo) {
        const normalizedScreen = result.navigateTo.toLowerCase().trim();
        if (normalizedScreen === "work" || normalizedScreen === "services") {
          onAction({ type: "navigate", data: { screen: normalizedScreen } });
        }
      } else if (result.intent === "reminder") {
        onAction({
          type: "reminder",
          data: {
            date: result.reminderDate || "",
            time: result.reminderTime || "",
            note: result.reminderNote || userText,
          },
        });
      }
    } catch (err) {
      console.error("Error detecting flow:", err);
    }
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const renderOrderCard = (card: OrderCardData) => (
    <View style={[styles.orderCard, card.confirmed && styles.orderCardConfirmed]}>
      <View style={styles.orderCardHeader}>
        <View style={styles.orderCardIcon}>
          <Car size={20} color="#fbbf24" />
        </View>
        <Text style={styles.orderCardTitle}>{t.taxi}</Text>
        {card.confirmed && (
          <View style={styles.confirmedBadge}>
            <CheckCircle size={14} color="#10b981" />
            <Text style={styles.confirmedText}>{t.orderConfirmed}</Text>
          </View>
        )}
      </View>

      <View style={styles.orderCardBody}>
        {card.fromLocation ? (
          <View style={styles.orderCardRow}>
            <MapPin size={14} color="#fbbf24" />
            <Text style={styles.orderCardLabel}>{t.fromWhere}:</Text>
            <Text style={styles.orderCardValue}>{card.fromLocation}</Text>
          </View>
        ) : null}
        {card.toLocation ? (
          <View style={styles.orderCardRow}>
            <MapPin size={14} color="#ef4444" />
            <Text style={styles.orderCardLabel}>{t.toWhere}:</Text>
            <Text style={styles.orderCardValue}>{card.toLocation}</Text>
          </View>
        ) : null}
        {card.time ? (
          <View style={styles.orderCardRow}>
            <Clock size={14} color="#60a5fa" />
            <Text style={styles.orderCardLabel}>{t.orderTime}:</Text>
            <Text style={styles.orderCardValue}>{card.time}</Text>
          </View>
        ) : null}
        {card.budget ? (
          <View style={styles.orderCardRow}>
            <DollarSign size={14} color="#10b981" />
            <Text style={styles.orderCardLabel}>{t.budget}:</Text>
            <Text style={styles.orderCardValue}>{card.budget} ₸</Text>
          </View>
        ) : null}
      </View>

      {!card.confirmed && (
        <Text style={styles.orderCardHint}>
          {t.confirmOrder} ({t.recording || "Скажите"} "Да")
        </Text>
      )}
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
        <View style={{ maxWidth: "75%", gap: 8 }}>
          <View style={[styles.messageBubble, isUser ? [styles.userBubble, { backgroundColor: currentTheme.accent }] : styles.aiBubble]}>
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
          </View>
          {item.orderCard && renderOrderCard(item.orderCard)}
        </View>
      </View>
    );
  };

  if (!visible) return null;

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
        style={styles.modalContainer}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose}>
            <Animated.View style={[styles.modalWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                <View style={[styles.glassContainer, { backgroundColor: `rgba(20, 20, 30, ${Math.max(glassOpacity, 0.85)})` }]}>
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
                            {isProcessing ? t.recording || "Печатает..." : taxiFlow !== "idle" ? t.aiFillingOrder : "В сети"}
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

                    {taxiFlow !== "idle" && taxiFlow !== "done" && (
                      <View style={styles.flowIndicator}>
                        <Car size={14} color="#fbbf24" />
                        <Text style={styles.flowIndicatorText}>
                          {taxiFlow === "from" && t.fromWhere + "?"}
                          {taxiFlow === "to" && t.toWhere + "?"}
                          {taxiFlow === "time" && t.orderTime + "?"}
                          {taxiFlow === "budget" && t.budget + "?"}
                          {taxiFlow === "confirm" && t.confirmOrder}
                        </Text>
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
                              taxiFlow === "confirm"
                                ? "Да / Нет"
                                : taxiFlow !== "idle"
                                ? `${taxiFlow === "from" ? t.fromWhere : taxiFlow === "to" ? t.toWhere : taxiFlow === "time" ? t.orderTime : t.budget}...`
                                : t.typeCommand || "Введите сообщение..."
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
  modalContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
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
    width: "92%",
    maxHeight: "88%",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 20,
  },
  modalContent: {
    width: "100%",
  },
  glassContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  container: {
    height: 560,
    maxHeight: 560,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    marginTop: 4,
  },
  messageBubble: {
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
  orderCard: {
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
    gap: 10,
  },
  orderCardConfirmed: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  orderCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fbbf24",
    flex: 1,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#10b981",
  },
  orderCardBody: {
    gap: 6,
  },
  orderCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderCardLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500" as const,
  },
  orderCardValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600" as const,
    flex: 1,
  },
  orderCardHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
    marginTop: 4,
  },
  flowIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderTopWidth: 1,
    borderTopColor: "rgba(251, 191, 36, 0.15)",
  },
  flowIndicatorText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600" as const,
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
    textAlign: "center",
  },
  inputArea: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  recordingIndicator: {
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
});
