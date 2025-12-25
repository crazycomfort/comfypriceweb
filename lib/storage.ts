// Simple file-based storage for contractors and companies - Step 3
// In production, this would be replaced with a real database

import { promises as fs } from "fs";
import path from "path";
import { ContractorRole } from "./session";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTRACTORS_FILE = path.join(DATA_DIR, "contractors.json");
const COMPANIES_FILE = path.join(DATA_DIR, "companies.json");

export interface Contractor {
  id: string;
  email: string;
  passwordHash: string; // In production, use proper hashing (bcrypt)
  companyId: string | null;
  role: ContractorRole;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string | null;
  address: string | null;
  licenseNumber: string | null;
  taxId: string | null;
  paymentMethod: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Read contractors from file
async function readContractors(): Promise<Contractor[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONTRACTORS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write contractors to file
async function writeContractors(contractors: Contractor[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONTRACTORS_FILE, JSON.stringify(contractors, null, 2));
}

// Read companies from file
async function readCompanies(): Promise<Company[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(COMPANIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write companies to file
async function writeCompanies(companies: Array<Company>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(COMPANIES_FILE, JSON.stringify(companies, null, 2));
}

// Contractor operations
export async function getContractorById(id: string): Promise<Contractor | null> {
  const contractors = await readContractors();
  return contractors.find((c) => c.id === id) || null;
}

export async function getContractorByEmail(email: string): Promise<Contractor | null> {
  const contractors = await readContractors();
  return contractors.find((c) => c.email === email) || null;
}

export async function createContractor(
  email: string,
  passwordHash: string,
  role: ContractorRole = "tech"
): Promise<Contractor> {
  const contractors = await readContractors();
  const contractor: Contractor = {
    id: `contractor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    passwordHash,
    companyId: null,
    role,
    createdAt: new Date().toISOString(),
  };
  contractors.push(contractor);
  await writeContractors(contractors);
  return contractor;
}

export async function updateContractor(
  id: string,
  updates: Partial<Contractor>
): Promise<Contractor | null> {
  const contractors = await readContractors();
  const index = contractors.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  contractors[index] = { ...contractors[index], ...updates };
  await writeContractors(contractors);
  return contractors[index];
}

// Company operations
export async function getCompanyById(id: string): Promise<Company | null> {
  const companies = await readCompanies();
  return companies.find((c) => c.id === id) || null;
}

export async function createCompany(): Promise<Company> {
  const companies = await readCompanies();
  const company: Company = {
    id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: null,
    address: null,
    licenseNumber: null,
    taxId: null,
    paymentMethod: null,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  companies.push(company);
  await writeCompanies(companies);
  return company;
}

export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, "id" | "createdAt">>
): Promise<Company | null> {
  const companies = await readCompanies();
  const index = companies.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  companies[index] = {
    ...companies[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeCompanies(companies);
  return companies[index];
}

// Check if company setup is complete
export function isCompanySetupComplete(company: Company | null): boolean {
  if (!company) return false;
  
  return !!(
    company.name &&
    company.address &&
    company.licenseNumber &&
    company.taxId &&
    company.paymentMethod
  );
}

