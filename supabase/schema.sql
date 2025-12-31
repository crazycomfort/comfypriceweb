-- ComfyPrice Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (must be created first since contractors references it)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  address TEXT,
  license_number TEXT,
  tax_id TEXT,
  payment_method TEXT,
  company_code TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractors table (references companies)
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('owner_admin', 'office', 'tech')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint (in case it wasn't added in CREATE TABLE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contractors_company_id_fkey'
  ) THEN
    ALTER TABLE contractors 
    ADD CONSTRAINT contractors_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractors(email);
CREATE INDEX IF NOT EXISTS idx_contractors_company_id ON contractors(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(company_code);

-- Add company_code column to existing companies table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'company_code'
  ) THEN
    ALTER TABLE companies ADD COLUMN company_code TEXT UNIQUE;
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
DROP TRIGGER IF EXISTS update_contractors_updated_at ON contractors;
CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Optional but recommended
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can view, insert, and update data
CREATE POLICY "Contractors can view data" ON contractors
  FOR SELECT USING (true);

CREATE POLICY "Contractors can insert data" ON contractors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Contractors can update data" ON contractors
  FOR UPDATE USING (true);

-- Policy: Companies can be viewed, inserted, and updated
CREATE POLICY "Companies are viewable" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Companies are insertable" ON companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Companies are updatable" ON companies
  FOR UPDATE USING (true);
