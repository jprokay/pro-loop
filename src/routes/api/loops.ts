import { storage, loopsKey } from "~/kv";

import type { APIEvent } from "@solidjs/start/server";
import { getCookie } from "vinxi/http";

// TODO: Add in unauthorized calls that trigger a CTA
// to sign up
export async function GET(event: APIEvent) {
  const userId = getCookie(event.nativeEvent, "ajs_user_id");
  console.log(userId);
  if (userId) {
    const data = await storage.get(loopsKey(userId));
    if (data) {
      return JSON.parse(data?.toString());
    } else {
      return {};
    }
  }
  return {};
}

export async function POST(event: APIEvent) {
  const userId = getCookie(event.nativeEvent, "ajs_user_id");
  console.log("userId");
  if (userId) {
    console.log("setting loops");
    return await storage.set(
      loopsKey(userId),
      JSON.stringify(event.params.loops),
    );
  }
  return {};
}
