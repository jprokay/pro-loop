import { storage } from "~/kv";

import type { APIEvent } from "@solidjs/start/server";
import { getCookie } from "vinxi/http";
export async function GET(event: APIEvent) {
  console.log(event);
  const cookie = getCookie(event.nativeEvent, "ajs_user_id");
  console.log(cookie);
  return cookie;
}
