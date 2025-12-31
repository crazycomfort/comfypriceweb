# 🗄️ Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free tier is fine)
3. Sign up with GitHub or email

### Step 2: Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `comfyprice` (or whatever you want)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get Your API Keys
1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Run the Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy and paste the entire SQL into the editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 5: Set Environment Variables

#### For Local Development:
Create or edit `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 3.

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (your project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
4. Redeploy your app

### Step 6: Install Dependencies
```bash
npm install
```

This will install `@supabase/supabase-js`.

### Step 7: Test It!
1. Start your dev server: `npm run dev`
2. Try registering a contractor at `/contractor/register`
3. Try signing in at `/contractor/signin`

---

## ✅ Verification

### Check Database Tables
1. In Supabase, go to **Table Editor**
2. You should see:
   - `contractors` table
   - `companies` table

### Test Registration
1. Go to `/contractor/register`
2. Register a new contractor
3. Check Supabase **Table Editor** → `contractors` table
4. You should see your new contractor!

---

## 🔒 Security Notes

- The `anon` key is safe to use in client-side code (it's public)
- Row Level Security (RLS) is enabled but permissive for now
- For production, you'll want to tighten RLS policies
- Password hashing is done in `lib/auth.ts` (make sure it's secure!)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has both variables
- Restart your dev server after adding env vars
- Check variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "relation does not exist"
- You didn't run the SQL schema
- Go to SQL Editor and run `supabase/schema.sql`

### "duplicate key value violates unique constraint"
- Email already exists
- Try a different email

### Still using file storage?
- Make sure you've run `npm install` to get Supabase
- Check that `lib/storage.ts` is using Supabase (not file system)
- Restart your dev server

---

## 📊 Database Schema

### `contractors` table
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique, required
- `password_hash` (TEXT) - Hashed password
- `company_id` (UUID) - Foreign key to companies
- `role` (TEXT) - 'owner_admin', 'office', or 'tech'
- `created_at`, `updated_at` - Timestamps

### `companies` table
- `id` (UUID) - Primary key
- `name`, `address`, `license_number`, `tax_id`, `payment_method` (TEXT, nullable)
- `is_verified` (BOOLEAN) - Default false
- `created_at`, `updated_at` - Timestamps

---

## 🚀 Next Steps

Once database is working:
1. Test contractor registration
2. Test contractor sign-in
3. Test company setup flow
4. Test estimate creation (if you add that feature)

---

**Need help?** Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)


