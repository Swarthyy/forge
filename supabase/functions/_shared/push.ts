// Push delivery is stubbed until real Expo/FCM/APNs credentials are configured.
// EXPO_ACCESS_TOKEN unset -> no-op console log so the rest of the pipeline (grading,
// pot transfer, DB writes) is fully testable without a push project set up.

export interface PushMessage {
  to: string;
  title: string;
  body: string;
}

export async function sendPush(messages: PushMessage[]): Promise<void> {
  const token = Deno.env.get("EXPO_ACCESS_TOKEN");
  if (!token) {
    console.log("[sendPush:noop]", JSON.stringify(messages));
    return;
  }

  const targets = messages.filter((m) => !!m.to);
  if (targets.length === 0) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(
      targets.map((m) => ({ to: m.to, title: m.title, body: m.body, sound: "default" }))
    ),
  });
}
