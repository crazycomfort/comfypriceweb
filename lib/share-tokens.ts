// Share token system - Step 7
// Tokenized, expirable, revocable share links

import { promises as fs } from "fs";
import path from "path";

// Use /tmp for Vercel serverless (only writable location)
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const SHARE_TOKENS_FILE = path.join(DATA_DIR, "share-tokens.json");

export interface ShareToken {
  token: string;
  estimateId: string;
  version: string;
  companyId?: string | null;
  expiresAt: string | null;
  revoked: boolean;
  singleUse: boolean;
  used: boolean;
  createdAt: string;
  revokedAt?: string;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readTokens(): Promise<ShareToken[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(SHARE_TOKENS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTokens(tokens: ShareToken[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SHARE_TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// Generate secure token
function generateToken(): string {
  return `share-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
}

// Create share token
export async function createShareToken(
  estimateId: string,
  version: string,
  options: {
    companyId?: string | null;
    expiresInHours?: number;
    singleUse?: boolean;
  } = {}
): Promise<ShareToken> {
  const tokens = await readTokens();
  
  const expiresAt = options.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000).toISOString()
    : null;

  const token: ShareToken = {
    token: generateToken(),
    estimateId,
    version,
    companyId: options.companyId || null,
    expiresAt,
    revoked: false,
    singleUse: options.singleUse || false,
    used: false,
    createdAt: new Date().toISOString(),
  };

  tokens.push(token);
  await writeTokens(tokens);
  return token;
}

// Validate and use token
export async function validateShareToken(token: string): Promise<{
  valid: boolean;
  estimateId?: string;
  version?: string;
  error?: string;
}> {
  const tokens = await readTokens();
  const shareToken = tokens.find((t) => t.token === token);

  if (!shareToken) {
    return { valid: false, error: "Token not found" };
  }

  if (shareToken.revoked) {
    return { valid: false, error: "Token revoked" };
  }

  if (shareToken.expiresAt && new Date(shareToken.expiresAt) < new Date()) {
    return { valid: false, error: "Token expired" };
  }

  if (shareToken.singleUse && shareToken.used) {
    return { valid: false, error: "Token already used" };
  }

  // Mark as used if single-use
  if (shareToken.singleUse && !shareToken.used) {
    shareToken.used = true;
    await writeTokens(tokens);
  }

  return {
    valid: true,
    estimateId: shareToken.estimateId,
    version: shareToken.version,
  };
}

// Revoke token
export async function revokeShareToken(token: string, companyId?: string): Promise<boolean> {
  const tokens = await readTokens();
  const shareToken = tokens.find((t) => t.token === token);

  if (!shareToken) {
    return false;
  }

  // Company isolation: only company that created token can revoke
  if (companyId && shareToken.companyId !== companyId) {
    return false;
  }

  shareToken.revoked = true;
  shareToken.revokedAt = new Date().toISOString();
  await writeTokens(tokens);
  return true;
}

// Get tokens for estimate (company-scoped)
export async function getTokensForEstimate(
  estimateId: string,
  companyId?: string
): Promise<ShareToken[]> {
  const tokens = await readTokens();
  return tokens.filter(
    (t) =>
      t.estimateId === estimateId &&
      (!companyId || t.companyId === companyId)
  );
}

