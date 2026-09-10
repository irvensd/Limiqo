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
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CaptureIdeaModal from "@/components/CaptureIdeaModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import CreateProjectModal from "@/components/CreateProjectModal";
import { colors } from "@/constants/theme";
import { StoreProvider } from "@/lib/store";
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

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StoreProvider>
        <UIProvider>
          <ThemeProvider value={theme}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="project/[id]" />
              <Stack.Screen name="review" />
              <Stack.Screen name="settings" />
            </Stack>
            <Modals />
          </ThemeProvider>
        </UIProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
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
