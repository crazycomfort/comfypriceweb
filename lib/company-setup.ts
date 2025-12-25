// Company setup completion gating - Step 3
// Real persistence-based setup checking

import { getCompanyById, isCompanySetupComplete as checkCompanySetup } from "./storage";

/**
 * Checks if dev bypass is enabled (development only, ignored in production)
 * @returns boolean - true only if DEV_BYPASS_AUTH env var is set AND not in production
 */
function isDevBypassEnabled(): boolean {
  // Only allow bypass in development, never in production
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.DEV_BYPASS_AUTH === "true";
}

/**
 * Checks if contractor has completed company setup
 * @param companyId - Company ID to check
 * @returns boolean - true if company setup is complete
 */
export async function isCompanySetupComplete(companyId?: string | null): Promise<boolean> {
  // Dev bypass: only in development with explicit env var
  if (isDevBypassEnabled()) {
    return true;
  }
  
  if (!companyId) {
    return false;
  }
  
  const company = await getCompanyById(companyId);
  if (!company) {
    return false;
  }
  
  return checkCompanySetup(company);
}

/**
 * Gets company setup status details from persisted data
 * @param companyId - Company ID
 * @returns Setup status object
 */
export async function getCompanySetupStatus(companyId: string | null): Promise<{
  isComplete: boolean;
  missingFields: string[];
  progress: number; // 0-100
}> {
  if (!companyId) {
    return {
      isComplete: false,
      missingFields: ["company_name", "address", "license_number", "tax_id", "payment_method"],
      progress: 0,
    };
  }
  
  const company = await getCompanyById(companyId);
  if (!company) {
    return {
      isComplete: false,
      missingFields: ["company_name", "address", "license_number", "tax_id", "payment_method"],
      progress: 0,
    };
  }
  
  const requiredFields = [
    { key: "name", label: "company_name" },
    { key: "address", label: "address" },
    { key: "licenseNumber", label: "license_number" },
    { key: "taxId", label: "tax_id" },
    { key: "paymentMethod", label: "payment_method" },
  ];
  
  const missingFields: string[] = [];
  let completedCount = 0;
  
  for (const field of requiredFields) {
    if (!company[field.key as keyof typeof company]) {
      missingFields.push(field.label);
    } else {
      completedCount++;
    }
  }
  
  const progress = Math.round((completedCount / requiredFields.length) * 100);
  const isComplete = missingFields.length === 0;
  
  return {
    isComplete,
    missingFields,
    progress,
  };
}

