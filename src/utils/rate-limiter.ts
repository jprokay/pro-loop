import { storage } from "~/kv";
import type { APIEvent } from "@solidjs/start/server";
import SuperJSON from "superjson";

type RateLimitOptions = {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  windowInSeconds: number;

  /**
   * Identifier for the rate limit (e.g., 'youtube-api', 'user-actions')
   */
  identifier: string;
};

/**
 * Generate a unique key for the rate limiter
 */
function getRateLimitKey(identifier: string, clientId: string): string {
  return `rate-limit/${identifier}/${clientId}`;
}

/**
 * Extract client identifier from request (IP address or user ID)
 */
function getClientIdentifier(event: APIEvent): string {
  // Try to get user ID from cookie if authenticated
  const userId = event.request.headers
    .get("cookie")
    ?.match(/ajs_user_id=([^;]+)/)?.[1];

  if (userId) {
    return userId;
  }

  // Fall back to IP address
  const ip =
    event.request.headers.get("cf-connecting-ip") ||
    event.request.headers.get("x-forwarded-for") ||
    "unknown";

  return ip.split(",")[0].trim(); // Get the first IP if there are multiple
}

/**
 * Check if a request should be rate limited
 * Returns true if the request is allowed, false if it should be blocked
 */
export async function checkRateLimit(
  event: APIEvent,
  options: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const clientId = getClientIdentifier(event);
  const key = getRateLimitKey(options.identifier, clientId);

  // Get current count from KV
  const data = await storage.get(key);
  console.log("Rate limit: ", data);
  const now = Math.floor(Date.now() / 1000);

  let count = 0;
  let resetTime = now + options.windowInSeconds;
  try {
    if (data) {
      console.log("Checking data");
      const rateData = SuperJSON.parse(data as string);
      count = rateData.count;
      resetTime = rateData.reset;

      // If the window has expired, reset the counter
      if (now >= resetTime) {
        count = 0;
        resetTime = now + options.windowInSeconds;
      }
    }
  } catch (error) {
    console.warn("Error in rate limiter", error);
  } finally {
    // Increment the counter
    count++;

    // Store updated count in KV
    await storage.set(
      key,
      { count, reset: resetTime },
      {
        expirationTtl: options.windowInSeconds,
      },
    );

    const remaining = Math.max(0, options.limit - count);

    return {
      allowed: count <= options.limit,
      remaining,
      reset: resetTime,
    };
  }
}

/**
 * Rate limiting middleware for API routes
 */
export async function rateLimit(
  event: APIEvent,
  options: RateLimitOptions,
): Promise<Response | null> {
  try {
    const result = await checkRateLimit(event, options);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: result.reset - Math.floor(Date.now() / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": options.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": (
              result.reset - Math.floor(Date.now() / 1000)
            ).toString(),
          },
        },
      );
    }

    return null; // Continue processing the request
  } catch {
    return null;
  }
}
