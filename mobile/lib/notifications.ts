import Constants from "expo-constants";
import { supabase } from "./supabase";

const isExpoGo = Constants.appOwnership === "expo";

export function setupNotificationHandler() {
  if (isExpoGo) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N = require("expo-notifications");
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {}
}

export async function requestNotificationPermission() {
  if (isExpoGo) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N = require("expo-notifications");
    await N.requestPermissionsAsync();
  } catch {}
}

export async function scheduleLocalNotification(title: string, body: string) {
  if (isExpoGo) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N = require("expo-notifications");
    await N.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {}
}

export async function registerForPushTokenAsync() {
  if (isExpoGo) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N = require("expo-notifications");

    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return;

    const tokenData = await N.getExpoPushTokenAsync();
    const token: string = tokenData.data;
    if (!token) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("sellers").update({ push_token: token }).eq("id", user.id);
    }
  } catch {
    // Silent — push tokens optional
  }
}
