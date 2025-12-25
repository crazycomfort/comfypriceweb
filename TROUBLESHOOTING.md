# Troubleshooting Guide

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Go to: `http://localhost:3000`
   - The terminal will show the exact port if it's different

## Common Issues

### Issue: "Page not found" or blank page

**Solution:**
- Make sure the dev server is running (`npm run dev`)
- Check the terminal for the exact port number
- Try: `http://localhost:3000/` (landing page)
- Try: `http://localhost:3000/homeowner/h1` (homeowner flow)

### Issue: Styles not loading

**Solution:**
- The app uses Tailwind CSS which should work automatically
- If styles look broken, try:
  ```bash
  rm -rf .next
  npm run dev
  ```

### Issue: JavaScript errors

**Solution:**
- Open browser DevTools (F12)
- Check the Console tab for errors
- Check the Network tab for failed requests

### Issue: "Cannot GET /route"

**Solution:**
- Make sure you're using the correct route paths:
  - Landing: `/`
  - Homeowner H1: `/homeowner/h1`
  - Homeowner H2: `/homeowner/h2` (after completing H1)
  - Estimate viewer: `/estimate/[token]` (needs a valid token)

## Testing the Flow

1. **Start at landing page:** `http://localhost:3000/`
2. **Click "Start Free Estimate"**
3. **Complete the homeowner flow:**
   - H1: Enter ZIP code
   - H2: Enter home details
   - H3: Current system info
   - H4: Preferences
   - H5: Review
   - H6: See estimate results

## If Nothing Works

1. **Stop all dev servers:**
   ```bash
   pkill -f "next dev"
   ```

2. **Clear cache:**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

3. **Reinstall dependencies (if needed):**
   ```bash
   npm install
   ```

4. **Start fresh:**
   ```bash
   npm run dev
   ```

## Check Build Status

To verify everything compiles:
```bash
npm run build
```

If build succeeds, the code is fine. The issue is likely:
- Dev server not running
- Wrong port
- Browser cache

