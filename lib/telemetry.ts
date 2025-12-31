// Telemetry system - Step 8
// Non-PII, silent, minimal audit only

import { promises as fs } from "fs";
import path from "path";

// Use /tmp for Vercel serverless (only writable location)
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const TELEMETRY_FILE = path.join(DATA_DIR, "telemetry.json");

export interface TelemetryEvent {
  id: string;
  eventType: string;
  timestamp: string;
  sessionId?: string; // Non-PII session identifier
  metadata: Record<string, any>; // No PII
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readTelemetry(): Promise<TelemetryEvent[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(TELEMETRY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTelemetry(events: TelemetryEvent[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TELEMETRY_FILE, JSON.stringify(events, null, 2));
}

// Log telemetry event (non-PII only)
export async function logEvent(
  eventType: string,
  metadata: Record<string, any> = {},
  sessionId?: string
): Promise<void> {
  try {
    const events = await readTelemetry();
    const event: TelemetryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: new Date().toISOString(),
      sessionId,
      metadata: sanitizeMetadata(metadata), // Remove any PII
    };
    events.push(event);
    
    // Keep only last 1000 events (minimal audit)
    if (events.length > 1000) {
      events.shift();
    }
    
    await writeTelemetry(events);
  } catch (error) {
    // Silent failure - telemetry should not break the app
    console.error("Telemetry logging failed:", error);
  }
}

// Sanitize metadata to remove PII
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const piiFields = ["email", "phone", "name", "address", "zipCode", "ssn", "taxId"];
  
  for (const [key, value] of Object.entries(metadata)) {
    if (piiFields.includes(key.toLowerCase())) {
      continue; // Skip PII fields
    }
    if (typeof value === "string" && value.length > 100) {
      sanitized[key] = value.substring(0, 100) + "..."; // Truncate long strings
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Generate non-PII session ID
export function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
}

