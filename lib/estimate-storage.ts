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
  await ensureDataDir();
  try {
    const data = await fs.readFile(ESTIMATES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeEstimates(estimates: StoredEstimate[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(ESTIMATES_FILE, JSON.stringify(estimates, null, 2));
  } catch (error) {
    console.error("Error writing estimates:", error);
    // In Vercel, /tmp might have issues - but estimates don't need to persist
    // This is okay for now, estimates are generated on-demand
    // In production, this should use a real database
  }
}

export async function saveEstimate(estimate: EstimateResult, options: {
  companyId?: string | null;
  contractorId?: string | null;
  isHomeowner: boolean;
}): Promise<StoredEstimate> {
  const estimates = await readEstimates();
  const stored: StoredEstimate = {
    ...estimate,
    companyId: options.companyId || null,
    contractorId: options.contractorId || null,
    isHomeowner: options.isHomeowner,
  };
  estimates.push(stored);
  await writeEstimates(estimates);
  return stored;
}

export async function getEstimateById(estimateId: string): Promise<StoredEstimate | null> {
  const estimates = await readEstimates();
  return estimates.find((e) => e.estimateId === estimateId) || null;
}

export async function getEstimatesByCompany(companyId: string): Promise<StoredEstimate[]> {
  const estimates = await readEstimates();
  return estimates.filter((e) => e.companyId === companyId);
}

export async function getHomeownerEstimates(): Promise<StoredEstimate[]> {
  const estimates = await readEstimates();
  return estimates.filter((e) => e.isHomeowner && !e.companyId);
}

