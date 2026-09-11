import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";
import AuthScreen from "@/components/AuthScreen";

export default function ResetPasswordScreen() {
  const { recovering, session } = useAuth();
  if (recovering || !session) return <AuthScreen />;
  return <Redirect href="/(tabs)/today" />;
}
