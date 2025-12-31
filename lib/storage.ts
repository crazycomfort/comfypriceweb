// Database storage using Supabase - Production ready
import { supabase, ContractorRow, CompanyRow } from "./supabase";
import { ContractorRole } from "./session";

export interface Contractor {
  id: string;
  email: string;
  passwordHash: string;
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
  companyCode: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper: Convert database row to app interface
function contractorRowToContractor(row: ContractorRow): Contractor {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    companyId: row.company_id,
    role: row.role,
    createdAt: row.created_at,
  };
}

function companyRowToCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    licenseNumber: row.license_number,
    taxId: row.tax_id,
    paymentMethod: row.payment_method,
    companyCode: row.company_code,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Contractor operations
export async function getContractorById(id: string): Promise<Contractor | null> {
  try {
    const { data, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching contractor by ID:", error);
      return null;
    }

    return data ? contractorRowToContractor(data) : null;
  } catch (error) {
    console.error("Exception fetching contractor by ID:", error);
    return null;
  }
}

export async function getContractorsByCompanyId(companyId: string): Promise<Contractor[]> {
  try {
    const { data, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contractors by company ID:", error);
      return [];
    }

    return data ? data.map(contractorRowToContractor) : [];
  } catch (error) {
    console.error("Exception fetching contractors by company ID:", error);
    return [];
  }
}

export async function getContractorByEmail(email: string): Promise<Contractor | null> {
  try {
    const { data, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      // Not found is okay, return null
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching contractor by email:", error);
      return null;
    }

    return data ? contractorRowToContractor(data) : null;
  } catch (error) {
    console.error("Exception fetching contractor by email:", error);
    return null;
  }
}

export async function createContractor(
  email: string,
  passwordHash: string,
  role: ContractorRole = "tech"
): Promise<Contractor> {
  try {
    const { data, error } = await supabase
      .from("contractors")
      .insert({
        email,
        password_hash: passwordHash,
        role,
        company_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contractor:", error);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      throw new Error(`Failed to create contractor: ${error.message} (code: ${error.code})`);
    }

    if (!data) {
      throw new Error("Failed to create contractor: No data returned");
    }

    return contractorRowToContractor(data);
  } catch (error) {
    console.error("Exception creating contractor:", error);
    throw error;
  }
}

export async function updateContractor(
  id: string,
  updates: Partial<Contractor>
): Promise<Contractor | null> {
  try {
    // Convert app interface to database format
    const dbUpdates: Partial<ContractorRow> = {};
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.passwordHash !== undefined) dbUpdates.password_hash = updates.passwordHash;
    if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId;
    if (updates.role !== undefined) dbUpdates.role = updates.role;

    const { data, error } = await supabase
      .from("contractors")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contractor:", error);
      return null;
    }

    return data ? contractorRowToContractor(data) : null;
  } catch (error) {
    console.error("Exception updating contractor:", error);
    return null;
  }
}

// Company operations
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching company by ID:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const company = companyRowToCompany(data);
    
    // If company doesn't have a code, generate one (for existing companies)
    if (!company.companyCode) {
      const code = await ensureCompanyCode(id);
      if (code) {
        // Fetch again to get the updated company with code
        const { data: updatedData, error: updateError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();
        
        if (!updateError && updatedData) {
          return companyRowToCompany(updatedData);
        }
      }
    }

    return company;
  } catch (error) {
    console.error("Exception fetching company by ID:", error);
    return null;
  }
}

export async function getCompanyByCode(code: string): Promise<Company | null> {
  try {
    const normalizedCode = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("company_code", normalizedCode)
      .single();

    if (error) {
      // Not found is okay, return null
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching company by code:", error);
      return null;
    }

    return data ? companyRowToCompany(data) : null;
  } catch (error) {
    console.error("Exception fetching company by code:", error);
    return null;
  }
}

// Generate a unique company code (8 characters, uppercase alphanumeric)
function generateCompanyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like 0, O, I, 1
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Ensure a company has a code - generates one if missing
async function ensureCompanyCode(companyId: string): Promise<string | null> {
  try {
    const company = await getCompanyById(companyId);
    if (!company) {
      return null;
    }

    // If company already has a code, return it
    if (company.companyCode) {
      return company.companyCode;
    }

    // Generate a unique code
    let companyCode: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      companyCode = generateCompanyCode();
      const existing = await getCompanyByCode(companyCode);
      if (!existing) {
        break; // Code is unique
      }
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      console.error("Failed to generate unique company code after multiple attempts");
      return null;
    }

    // Update company with the new code
    const updated = await updateCompany(companyId, { companyCode });
    return updated?.companyCode || null;
  } catch (error) {
    console.error("Error ensuring company code:", error);
    return null;
  }
}

export async function createCompany(): Promise<Company> {
  try {
    // Generate a unique company code
    let companyCode: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      companyCode = generateCompanyCode();
      const existing = await getCompanyByCode(companyCode);
      if (!existing) {
        break; // Code is unique
      }
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique company code after multiple attempts");
    }

    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: null,
        address: null,
        license_number: null,
        tax_id: null,
        payment_method: null,
        company_code: companyCode,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      throw new Error(`Failed to create company: ${error.message} (code: ${error.code})`);
    }

    if (!data) {
      throw new Error("Failed to create company: No data returned");
    }

    return companyRowToCompany(data);
  } catch (error) {
    console.error("Exception creating company:", error);
    throw error;
  }
}

export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, "id" | "createdAt">>
): Promise<Company | null> {
  try {
    // Convert app interface to database format
    const dbUpdates: Partial<CompanyRow> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.licenseNumber !== undefined) dbUpdates.license_number = updates.licenseNumber;
    if (updates.taxId !== undefined) dbUpdates.tax_id = updates.taxId;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.companyCode !== undefined) dbUpdates.company_code = updates.companyCode;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;

    const { data, error } = await supabase
      .from("companies")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error);
      return null;
    }

    return data ? companyRowToCompany(data) : null;
  } catch (error) {
    console.error("Exception updating company:", error);
    return null;
  }
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
