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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthScreen from "@/components/AuthScreen";
import CaptureIdeaModal from "@/components/CaptureIdeaModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import CreateProjectModal from "@/components/CreateProjectModal";
import QuietNotice from "@/components/QuietNotice";
import { colors } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
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
      <AuthProvider>
        <ThemeProvider value={theme}>
          <StatusBar style="light" />
          <AuthGate />
        </ThemeProvider>
      </AuthProvider>
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
