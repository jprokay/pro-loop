import { storage } from "~/kv";

import type { APIEvent } from "@solidjs/start/server";
import { getCookie } from "vinxi/http";
export async function GET(event: APIEvent) {
  console.log(event.params.id);
  return event.params.id;
}
