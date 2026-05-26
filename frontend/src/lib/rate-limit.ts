import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, requests: number, windowSeconds: number): Ratelimit | null {
  if (limiters.has(key)) return limiters.get(key)!;
  const redis = getRedis();
  if (!redis) return null;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    prefix: `rl:${key}`,
  });
  limiters.set(key, limiter);
  return limiter;
}

export async function checkRateLimit(
  req: NextRequest,
  key: string,
  requests: number,
  windowSeconds: number,
  identifier?: string
): Promise<NextResponse | null> {
  const limiter = getLimiter(key, requests, windowSeconds);
  if (!limiter) return null;

  const id =
    identifier ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining, reset } = await limiter.limit(id);

  if (!success) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen bir süre bekleyin." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}
