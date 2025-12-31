-- Migration: Generate company codes for existing companies
-- Run this in your Supabase SQL Editor to generate codes for companies that don't have one

-- Function to generate a random company code
CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update all companies without codes
DO $$
DECLARE
  company_record RECORD;
  new_code TEXT;
  attempts INTEGER;
  max_attempts INTEGER := 10;
BEGIN
  FOR company_record IN 
    SELECT id FROM companies WHERE company_code IS NULL OR company_code = ''
  LOOP
    attempts := 0;
    LOOP
      new_code := generate_company_code();
      
      -- Check if code already exists
      IF NOT EXISTS (SELECT 1 FROM companies WHERE company_code = new_code) THEN
        UPDATE companies 
        SET company_code = new_code 
        WHERE id = company_record.id;
        EXIT; -- Code is unique, exit loop
      END IF;
      
      attempts := attempts + 1;
      IF attempts >= max_attempts THEN
        RAISE WARNING 'Failed to generate unique code for company % after % attempts', company_record.id, max_attempts;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Clean up the function (optional)
DROP FUNCTION IF EXISTS generate_company_code();



