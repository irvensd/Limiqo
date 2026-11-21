import "expo-sqlite/localStorage/install";
import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

function isSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return /^https?:\/\//i.test(value) &&
      Boolean(url.hostname) &&
      url.hostname !== "your-project.supabase.co";
  } catch {
    return false;
  }
}

const client = supabaseUrl && isSupabaseUrl(supabaseUrl) &&
  supabasePublishableKey && supabasePublishableKey !== "your-publishable-or-anon-key"
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: globalThis.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isSupabaseConfigured = client !== null;

export function getSupabase() {
  if (!client) throw new Error("Limiqo needs Supabase configuration.");
  return client;
}

if (client) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      client.auth.startAutoRefresh();
    } else {
      client.auth.stopAutoRefresh();
    }
  });
}
