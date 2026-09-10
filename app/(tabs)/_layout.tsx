import { Lightbulb, Stack, SunDim, Target } from "phosphor-react-native";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, floatingTab, fonts } from "@/constants/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12) + floatingTab.bottomGap;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          bottom,
          height: floatingTab.height,
          marginHorizontal: floatingTab.sideInset,
          borderRadius: floatingTab.height / 2,
          backgroundColor: colors.sidebar,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          paddingTop: 6,
          paddingBottom: 6,
          elevation: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.38,
          shadowRadius: 20,
          ...Platform.select({
            android: { overflow: "hidden" },
            default: {},
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 10,
          letterSpacing: 0.2,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <SunDim size={22} color={String(color)} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, focused }) => (
            <Target size={22} color={String(color)} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, focused }) => (
            <Stack size={22} color={String(color)} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: "Ideas",
          tabBarIcon: ({ color, focused }) => (
            <Lightbulb size={22} color={String(color)} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
