import "react-native-gesture-handler";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, type ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthScreen from "@/components/AuthScreen";
import { Wordmark } from "@/components/Brand";
import CaptureIdeaModal from "@/components/CaptureIdeaModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import CreateProjectModal from "@/components/CreateProjectModal";
import QuietNotice from "@/components/QuietNotice";
import { Subtitle, Title } from "@/components/Type";
import { colors } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UIProvider, useUI } from "@/lib/ui";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.sidebar,
    text: colors.foreground,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        {isSupabaseConfigured ? (
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        ) : (
          <RevealSplash>
            <SafeAreaView style={styles.setupScreen}>
              <ScrollView contentContainerStyle={styles.setupContent}>
                <Wordmark width={156} style={styles.setupWordmark} />
                <Title>Setup required.</Title>
                <Subtitle>
                  Limiqo needs a Supabase project URL and publishable key. For local development, copy .env.example to .env.local, fill in both values, then restart Expo.
                </Subtitle>
              </ScrollView>
            </SafeAreaView>
          </RevealSplash>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const { session, ready, recovering } = useAuth();
  if (!ready) return null;
  if (recovering || !session) {
    return (
      <RevealSplash>
        <AuthScreen />
      </RevealSplash>
    );
  }

  const meta = session.user.user_metadata;
  const displayName = typeof meta.name === "string" ? meta.name : "";

  return (
    <StoreProvider key={session.user.id} userId={session.user.id} displayName={displayName}>
      <UIProvider>
        <StoreGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="project/[id]" />
            <Stack.Screen name="settings" />
          </Stack>
          <Modals />
          <QuietNotice />
        </StoreGate>
      </UIProvider>
    </StoreProvider>
  );
}

function RevealSplash({ children }: { children: ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return children;
}

function StoreGate({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;
  return children;
}

function Modals() {
  const ui = useUI();
  return (
    <>
      <CreateProjectModal open={ui.projectOpen} onClose={ui.closeProject} />
      <CreateGoalModal open={ui.goalOpen} onClose={ui.closeGoal} />
      <CaptureIdeaModal open={ui.ideaOpen} onClose={ui.closeIdea} />
    </>
  );
}

const styles = StyleSheet.create({
  setupScreen: { flex: 1 },
  setupContent: { flexGrow: 1, justifyContent: "center", padding: 28 },
  setupWordmark: { marginBottom: 24 },
});
