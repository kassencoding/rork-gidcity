import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

export default function NotFoundScreen() {
  const { currentTheme } = useAppState();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <LinearGradient
          colors={currentTheme.gradient as [string, string, ...string[]]}
          style={styles.gradient}
        >
          <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
          <Link href="/" style={styles.link}>
            <Text style={[styles.linkText, { color: currentTheme.neon }]}>
              Go to home screen!
            </Text>
          </Link>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: commonColors.textPrimary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
