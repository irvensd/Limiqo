import { useState } from "react";
import { Eye, EyeSlash } from "phosphor-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wordmark } from "@/components/Brand";
import { colors, fonts } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

type Mode = "in" | "up" | "reset";

const copy: Record<Mode, { title: string; lede: string; action: string }> = {
  in: {
    title: "Welcome back.",
    lede: "Sign in to open your lists.",
    action: "Sign in",
  },
  up: {
    title: "Create your account.",
    lede: "Then we will ask what to call you.",
    action: "Create account",
  },
  reset: {
    title: "Reset password.",
    lede: "We will email you a link.",
    action: "Send reset link",
  },
};

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setNote("");
    setShowPassword(false);
  }

  async function submit() {
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("Enter your email.");
      return;
    }
    if (mode !== "reset" && password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setNote("");

    if (mode === "in") {
      const next = await signIn(nextEmail, password);
      if (next) setError(next);
    } else if (mode === "up") {
      const result = await signUp(nextEmail, password);
      if (result.error) setError(result.error);
      else if (result.needsConfirm) {
        setMode("in");
        setShowPassword(false);
        setNote("Check your email to confirm, then sign in.");
      }
    } else {
      const next = await resetPassword(nextEmail);
      if (next) setError(next);
      else setNote("Check your email for a reset link.");
    }

    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Wordmark width={156} />

          <View style={styles.form}>
            <Text style={styles.headline}>{copy[mode].title}</Text>
            <Text style={styles.lede}>{copy[mode].lede}</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />

            {mode !== "reset" ? (
              <>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, styles.passwordInput]}
                    secureTextEntry={!showPassword}
                    textContentType={mode === "in" ? "password" : "newPassword"}
                    autoComplete={mode === "in" ? "password" : "new-password"}
                    returnKeyType="done"
                    onSubmitEditing={submit}
                  />
                  <Pressable
                    onPress={() => setShowPassword((open) => !open)}
                    hitSlop={12}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    style={styles.eye}
                  >
                    {showPassword ? (
                      <EyeSlash size={20} color={colors.mutedForeground} />
                    ) : (
                      <Eye size={20} color={colors.mutedForeground} />
                    )}
                  </Pressable>
                </View>
                {mode === "up" ? (
                  <Text style={styles.hint}>At least 6 characters.</Text>
                ) : (
                  <Pressable onPress={() => switchMode("reset")} hitSlop={8} style={styles.forgot}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                )}
              </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {note ? <Text style={styles.note}>{note}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={busy}
              style={[styles.cta, busy && styles.ctaBusy]}
            >
              <Text style={styles.ctaText}>{busy ? "One moment…" : copy[mode].action}</Text>
            </Pressable>

            {mode === "reset" ? (
              <Pressable onPress={() => switchMode("in")} style={styles.switch}>
                <Text style={styles.switchText}>Back to sign in</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => switchMode(mode === "in" ? "up" : "in")}
                style={styles.switch}
              >
                <Text style={styles.switchText}>
                  {mode === "in" ? "Need an account? " : "Already have one? "}
                  <Text style={styles.switchAction}>
                    {mode === "in" ? "Create one" : "Sign in"}
                  </Text>
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  page: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
  },
  form: {
    marginTop: 48,
  },
  headline: {
    color: colors.foreground,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fonts.semibold,
    letterSpacing: -1.2,
    marginBottom: 10,
  },
  lede: {
    color: colors.mutedForeground,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    marginBottom: 28,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 44,
    marginBottom: 8,
  },
  eye: {
    position: "absolute",
    right: 12,
    top: 13,
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 18,
  },
  forgot: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  forgotText: {
    color: colors.foreground,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  error: {
    color: colors.destructive,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },
  note: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaBusy: { opacity: 0.7 },
  ctaText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  switch: {
    marginTop: 20,
    alignSelf: "flex-start",
  },
  switchText: {
    color: colors.mutedForeground,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  switchAction: {
    color: colors.foreground,
    fontFamily: fonts.medium,
  },
});
