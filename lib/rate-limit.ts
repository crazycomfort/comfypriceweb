// Rate limiting - Step 9
import { promises as fs } from "fs";
import path from "path";

// Use /tmp for Vercel serverless (only writable location)
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const RATE_LIMIT_FILE = path.join(DATA_DIR, "rate-limits.json");

interface RateLimitEntry {
  key: string;
  count: number;
  resetAt: string;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readRateLimits(): Promise<RateLimitEntry[]> {
  try {
    await ensureDataDir();
    try {
      const data = await fs.readFile(RATE_LIMIT_FILE, "utf-8");
      if (!data || !data.trim()) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (readError) {
      // File doesn't exist or is invalid - return empty array
      return [];
    }
  } catch (error) {
    // Directory creation failed or other error - return empty array
    return [];
  }
}

async function writeRateLimits(limits: RateLimitEntry[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(limits, null, 2));
  } catch (error) {
    // Fail silently - rate limiting is not critical
    console.error("Error writing rate limits:", error);
  }
}

// Check rate limit
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const limits = await readRateLimits();
  const now = Date.now();
  
  // Clean expired entries
  const activeLimits = limits.filter(
    (entry) => new Date(entry.resetAt).getTime() > now
  );
  
  let entry = activeLimits.find((e) => e.key === key);
  
  if (!entry) {
    // Create new entry
    entry = {
      key,
      count: 0,
      resetAt: new Date(now + windowMs).toISOString(),
    };
    activeLimits.push(entry);
  }
  
  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count <= maxRequests;
  
  await writeRateLimits(activeLimits);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

// Get client identifier for rate limiting (non-PII)
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return `rate-${ip}`;
}

