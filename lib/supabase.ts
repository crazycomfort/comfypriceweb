// Supabase client configuration
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In development, allow app to start without env vars (with warnings)
// In production, require them
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  } else {
    console.warn(
      "⚠️  Missing Supabase environment variables. Some features may not work.\n" +
      "   To set up Supabase:\n" +
      "   1. Create a .env.local file in the project root\n" +
      "   2. Add: NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n" +
      "   3. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n" +
      "   See DATABASE_SETUP.md for detailed instructions."
    );
  }
}

// Create client with placeholder values if missing (for dev mode)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Database types
export interface ContractorRow {
  id: string;
  email: string;
  password_hash: string;
  company_id: string | null;
  role: "owner_admin" | "office" | "tech";
  created_at: string;
  updated_at: string;
}

export interface CompanyRow {
  id: string;
  name: string | null;
  address: string | null;
  license_number: string | null;
  tax_id: string | null;
  payment_method: string | null;
  company_code: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}


