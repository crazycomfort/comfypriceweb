# Development Bypass Documentation

## Overview

For local development and testing, a bypass mechanism is available that skips authentication and company setup checks. This bypass is **production-safe** and only works in development mode.

## Environment Variable

**Name**: `DEV_BYPASS_AUTH`  
**Values**: `true` (enable bypass) or unset/`false` (disable bypass)  
**Production**: **IGNORED** - Bypass is automatically disabled in production builds

## Behavior

### When `DEV_BYPASS_AUTH=true` (Development Only)

- **Contractor Authentication**: Bypassed - all contractor pages accessible without sign-in
- **Company Setup**: Bypassed - C3 and C4 accessible without completing setup
- **Test Token**: `/estimate/test-token` shows demo estimate

### When `DEV_BYPASS_AUTH` is unset or `false`

- **Contractor Authentication**: Required - must sign in to access contractor pages
- **Company Setup**: Required - must complete setup to access C3 and C4
- **Test Token**: Returns 404

### Production Builds

- **Always Secure**: `NODE_ENV=production` automatically disables bypass regardless of env var
- **No Bypass Possible**: Even if `DEV_BYPASS_AUTH=true` is set, production builds ignore it

## Usage

### Enable Bypass (Development)

```bash
# Set env var before starting dev server
export DEV_BYPASS_AUTH=true
npm run dev
```

Or create `.env.local`:
```
DEV_BYPASS_AUTH=true
```

### Disable Bypass (Test Real Auth Flows)

```bash
# Unset env var or set to false
unset DEV_BYPASS_AUTH
npm run dev
```

Or in `.env.local`:
```
DEV_BYPASS_AUTH=false
```

## Code Locations

- `lib/contractor-access.ts:12-20` - `isDevBypassEnabled()` function
- `lib/company-setup.ts:12-20` - `isDevBypassEnabled()` function
- `app/estimate/[token]/page.tsx:22-23` - Dev bypass check for test tokens

## Security

✅ **Production-Safe**: Bypass is impossible in production builds  
✅ **Explicit Opt-In**: Must explicitly set env var to enable  
✅ **Development Only**: Only works when `NODE_ENV !== "production"`

---

**Default**: Secure (bypass disabled unless explicitly enabled)


