# Quick Test Guide

## Start the Server

```bash
npm run dev
```

The server will start on **port 3000** (not 3001).

## Access URLs

### ✅ Works Immediately (No Flags Needed)

1. **Landing Page**:
   ```
   http://localhost:3000/
   ```

2. **Homeowner Flow - Step 1**:
   ```
   http://localhost:3000/homeowner/h1
   ```

### ⚠️ Requires Feature Flags

3. **Contractor Flow** (requires `contractorFlow: true`):
   ```
   http://localhost:3000/contractor/c1
   ```
   - Also requires authentication (sign in first)
   - Edit `lib/feature-flags.ts` and set `contractorFlow: true`

4. **Education Page** (requires `educationPage: true`):
   ```
   http://localhost:3000/education
   ```
   - Edit `lib/feature-flags.ts` and set `educationPage: true`

5. **Share Link Viewer** (requires `estimateSharing: true`):
   ```
   http://localhost:3000/estimate/test-token
   ```
   - Edit `lib/feature-flags.ts` and set `estimateSharing: true`
   - Note: "test-token" won't work - you need a real token from creating a share link

## Quick Fix: Enable All Flags for Testing

Edit `lib/feature-flags.ts`:

```typescript
export const featureFlags = {
  contractorFlow: true,      // Enable contractor flow
  educationPage: true,       // Enable education page
  estimateSharing: true,     // Enable share links
  detailedEstimate: false,   // Optional
  smartFeatures: false,      // Optional
} as const;
```

Then restart the dev server.

## Port Check

If you see port 3001, check:
- Is another app using port 3000?
- Check terminal output when running `npm run dev` - it will show the actual port
- Next.js will automatically use 3001 if 3000 is taken


