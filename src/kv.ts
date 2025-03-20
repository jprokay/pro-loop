import { createStorage } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";

export const storage = createStorage({
  driver: cloudflareKVBindingDriver({ binding: "LOOPS" }),
});

export function loopsKey(userId: string): string {
  return `${userId}/loops`;
}
