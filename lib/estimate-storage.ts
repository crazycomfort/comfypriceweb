// Estimate storage - Step 4
import { promises as fs } from "fs";
import path from "path";
import { EstimateResult } from "./estimate-engine";

// Use /tmp for Vercel serverless (only writable location)
// In production, this should be a real database
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const ESTIMATES_FILE = path.join(DATA_DIR, "estimates.json");

export interface StoredEstimate extends EstimateResult {
  companyId?: string | null; // For contractor estimates
  contractorId?: string | null; // For contractor estimates
  isHomeowner: boolean;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function readEstimates(): Promise<StoredEstimate[]> {
  try {
    await ensureDataDir();
    try {
      const data = await fs.readFile(ESTIMATES_FILE, "utf-8");
      if (!data || !data.trim()) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (readError) {
      // File doesn't exist or is invalid - return empty array
      console.error("Error reading estimates file:", readError);
      return [];
    }
  } catch (error) {
    // Directory creation failed or other error - return empty array
    console.error("Error in readEstimates:", error);
    return [];
  }
}

async function writeEstimates(estimates: StoredEstimate[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(ESTIMATES_FILE, JSON.stringify(estimates, null, 2), "utf-8");
  } catch (error) {
    // In Vercel, /tmp might have issues - but estimates don't need to persist
    // This is okay for now, estimates are generated on-demand
    // In production, this should use a real database
    console.error("Error writing estimates (non-critical):", error);
    // Don't throw - this is expected to fail in some environments
  }
}

export async function saveEstimate(estimate: EstimateResult, options: {
  companyId?: string | null;
  contractorId?: string | null;
  isHomeowner: boolean;
}): Promise<StoredEstimate> {
  const stored: StoredEstimate = {
    ...estimate,
    companyId: options.companyId || null,
    contractorId: options.contractorId || null,
    isHomeowner: options.isHomeowner,
  };
  
  // Try to save, but don't fail if storage is unavailable
  try {
    const estimates = await readEstimates();
    estimates.push(stored);
    await writeEstimates(estimates);
  } catch (storageError) {
    // Storage failure is non-critical - estimate is still valid
    console.error("Failed to persist estimate (non-critical):", storageError);
    // Return the estimate anyway - it's still valid for the current request
  }
  
  return stored;
}

export async function getEstimateById(estimateId: string): Promise<StoredEstimate | null> {
  try {
    const estimates = await readEstimates();
    return estimates.find((e) => e.estimateId === estimateId) || null;
  } catch (error) {
    console.error("Error in getEstimateById:", error);
    return null;
  }
}

export async function getEstimatesByCompany(companyId: string): Promise<StoredEstimate[]> {
  const estimates = await readEstimates();
  return estimates.filter((e) => e.companyId === companyId);
}

export async function getHomeownerEstimates(): Promise<StoredEstimate[]> {
  const estimates = await readEstimates();
  return estimates.filter((e) => e.isHomeowner && !e.companyId);
}

