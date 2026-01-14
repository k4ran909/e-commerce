import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;
let redisStore: any = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
      },
    });
    
    redisClient.on('error', (err) => console.error('[Redis] Client Error:', err));
    redisClient.on('connect', () => console.log('[Redis] Connected for rate limiting'));
    
    redisClient.connect().catch((err) => {
      console.error('[Redis] Failed to connect:', err);
      redisClient = null;
    });

    redisStore = new RedisStore({
      sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
    });
  } catch (error) {
    console.error('[Redis] Initialization error:', error);
    redisClient = null;
    redisStore = null;
  }
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore || undefined,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many registration attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: redisStore || undefined,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore || undefined,
});

export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { message: "Too many order attempts, please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore || undefined,
});
