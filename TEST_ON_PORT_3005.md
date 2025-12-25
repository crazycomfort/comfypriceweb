# Testing on Port 3005

Your app is running on **port 3005** (Next.js automatically uses the next available port).

## Test These URLs:

### ✅ Should Work:

1. **Landing Page**:
   ```
   http://localhost:3005/
   ```
   Should show: "ComfyPrice - HVAC Ballpark Estimator" with "Start Free Estimate" button

2. **Homeowner Flow - Step 1**:
   ```
   http://localhost:3005/homeowner/h1
   ```
   Should show: ZIP code input form

3. **Contractor Flow - Step 1** (test mode enabled):
   ```
   http://localhost:3005/contractor/c1
   ```
   Should show: Contractor tools form (ZIP code and square footage)

4. **Education Page**:
   ```
   http://localhost:3005/education
   ```
   Should show: HVAC education content

5. **Test Estimate Viewer**:
   ```
   http://localhost:3005/estimate/test-token
   ```
   Should show: Demo estimate (test mode)

## What to Check:

1. **Does the landing page load?** (`http://localhost:3005/`)
   - [ ] Page loads without errors
   - [ ] Shows "ComfyPrice" title
   - [ ] Shows "Start Free Estimate" button
   - [ ] Button links to `/homeowner/h1`

2. **Does the homeowner flow work?**
   - [ ] Can enter ZIP code on H1
   - [ ] Can navigate to H2
   - [ ] Can fill out all steps
   - [ ] Can generate estimate on H6

3. **Does the contractor flow work?** (if feature flag enabled)
   - [ ] Can access `/contractor/c1` without sign-in (test mode)
   - [ ] Can fill out forms
   - [ ] Can generate estimate

4. **Any errors in browser console?**
   - Press F12 → Console tab
   - Look for red error messages
   - Copy/paste any errors you see

## If Something Doesn't Work:

**Tell me:**
1. Which URL/page is broken?
2. What do you see? (blank page, error message, etc.)
3. What errors are in the browser console? (F12 → Console)

The app should work on port 3005 just like it would on 3000. The port number doesn't matter - it's just which port Next.js chose to use.

