import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Registers for push and stores the Expo push token on the user's row so
// grade-week / stakes-ante can target them. No-ops quietly on failure (e.g.
// simulator, permissions denied) so it never blocks the rest of the app.
export async function registerPushToken(): Promise<void> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        lightColor: "#39FF14",
      });
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    await supabase.from("users").update({ expo_push_token: token }).eq("auth_id", authUser.id);
  } catch (err) {
    console.warn("registerPushToken failed (non-fatal):", err);
  }
}
