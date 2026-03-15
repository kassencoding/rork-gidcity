import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log("App crash caught:", error, info);
  }

  handleReset = async () => {
    try {
      await AsyncStorage.removeItem("gidcity_state");
      console.log("State cleared, restarting...");
    } catch (e) {
      console.log("Failed to clear state:", e);
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={ebStyles.container}>
          <Text style={ebStyles.title}>Ошибка приложения</Text>
          <Text style={ebStyles.message}>
            {this.state.error?.message || "Неизвестная ошибка"}
          </Text>
          <TouchableOpacity style={ebStyles.button} onPress={this.handleReset}>
            <Text style={ebStyles.buttonText}>Сбросить и перезапустить</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const ebStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#ffffff",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center" as const,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="main" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppStateProvider>
            <RootLayoutNav />
          </AppStateProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
