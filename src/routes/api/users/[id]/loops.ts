import { storage, loopsKey } from "~/kv";
import type { APIEvent } from "@solidjs/start/server";
import superjson from "superjson";

// TODO: Add in unauthorized calls that trigger a CTA
// to sign up
export async function GET(event: APIEvent) {
  const userId = event.params.id;
  if (userId) {
    const data = await storage.get(loopsKey(userId));
    if (data) {
      return superjson.parse(data.toString());
    }
    return {};
  }
  return {};
}

export async function POST(event: APIEvent) {
  const userId = event.params.id;
  if (userId) {
    const data = await event.request.text();
    const setValue = await storage.set(loopsKey(userId), data);
    const values = await storage.get(loopsKey(userId));

    return true;
  }
  return false;
}
