import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { getSupabase } from "./supabase";

const RECOVER_KEY = "limiqo.recovering";

function friendly(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) return "Email or password is not right.";
  if (lower.includes("already registered")) return "That email already has an account. Sign in instead.";
  if (lower.includes("same as the old") || lower.includes("different from the old")) {
    return "Pick a password you are not already using.";
  }
  if (lower.includes("password")) return "Password needs at least 6 characters.";
  if (lower.includes("expired") || lower.includes("invalid") || lower.includes("otp")) {
    return "That reset link or code is not valid anymore. Request a new one.";
  }
  if (lower.includes("email")) return "Enter a real email address.";
  return message;
}

function queryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseAuthUrl(url: string) {
  const normalized = url.replace(/#/g, "?");
  return Linking.parse(normalized).queryParams ?? {};
}

async function markRecovering(on: boolean) {
  if (on) await AsyncStorage.setItem(RECOVER_KEY, "1");
  else await AsyncStorage.removeItem(RECOVER_KEY);
}

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirm: boolean }>;
  resetPassword: (email: string) => Promise<string | null>;
  verifyRecovery: (email: string, token: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const lastUrl = useRef("");

  async function enterRecovery() {
    setRecovering(true);
    await markRecovering(true);
  }

  async function leaveRecovery() {
    setRecovering(false);
    await markRecovering(false);
  }

  async function consumeAuthUrl(url: string) {
    if (!url || lastUrl.current === url) return;
    const params = parseAuthUrl(url);
    const code = queryValue(params.code);
    const accessToken = queryValue(params.access_token);
    const refreshToken = queryValue(params.refresh_token);
    const type = queryValue(params.type);
    if (!code && !accessToken) return;
    lastUrl.current = url;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return;
    } else {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return;
    }

    if (type === "recovery" || /reset-password/i.test(url)) await enterRecovery();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data }, flag] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(RECOVER_KEY),
      ]);
      if (cancelled) return;
      setSession(data.session);
      setRecovering(Boolean(flag && data.session));
      setReady(true);
    })();

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") {
        void enterRecovery();
      }
      if (event === "SIGNED_OUT") {
        void leaveRecovery();
      }
    });

    const sub = Linking.addEventListener("url", (event) => {
      void consumeAuthUrl(event.url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) void consumeAuthUrl(url);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      ready,
      recovering,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return error ? friendly(error.message) : null;
      },
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) return { error: friendly(error.message), needsConfirm: false };
        return { error: null, needsConfirm: !data.session };
      },
      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: Linking.createURL("reset-password"),
        });
        return error ? friendly(error.message) : null;
      },
      async verifyRecovery(email, token) {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: "recovery",
        });
        if (error) return friendly(error.message);
        await enterRecovery();
        return null;
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return friendly(error.message);
        await leaveRecovery();
        return null;
      },
      async signOut() {
        await leaveRecovery();
        await supabase.auth.signOut();
      },
    }),
    [session, ready, recovering],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
