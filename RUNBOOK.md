# ComfyPrice - Local Development Runbook

## Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables** (optional for local dev):
   - No environment variables required for local development
   - All data stored in `/data` directory (file-based)
   - Sessions use secure cookies (httpOnly, sameSite: lax)

3. **Database Migration and Seed**:
   - No database required - using file-based storage
   - Data directory (`/data`) is created automatically on first use
   - No seed data needed - start with empty state

## How to Run

### Development Server

```bash
npm run dev
```

Access the application at: `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Test Credentials

### Contractor Account

To test contractor flow:

1. **Enable contractor flow feature flag**:
   - Edit `lib/feature-flags.ts`
   - Set `contractorFlow: true`

2. **Register a contractor**:
   - Navigate to `/contractor/register`
   - Email: `test@contractor.com`
   - Password: `test123`
   - Role: `owner_admin` (or `office` / `tech`)

3. **Complete company setup**:
   - After registration, you'll be redirected to company setup
   - Fill in all required fields:
     - Company Name: `Test HVAC Co`
     - Business Address: `123 Main St, City, State 12345`
     - License Number: `HVAC-12345`
     - Tax ID: `12-3456789`
     - Payment Method: `credit-card`

4. **Sign in**:
   - Navigate to `/contractor/signin`
   - Use credentials from step 2

### Homeowner Flow

No credentials needed - homeowner flow is public:
- Navigate to `/homeowner/h1`
- Complete the form steps H1-H6
- Estimate will be generated and displayed

## Feature Flags for QA

All feature flags are in `lib/feature-flags.ts`:

```typescript
export const featureFlags = {
  contractorFlow: false,      // Enable contractor flow
  educationPage: false,       // Enable education page
  estimateSharing: false,     // Enable share links & PDF
  detailedEstimate: false,    // Enable detailed estimate flow
  smartFeatures: false,       // Enable smart features
} as const;
```

### QA Testing Scenarios

**Scenario 1: Homeowner Flow (Default)**
- All flags OFF
- Navigate to `/` → Click "Start Free Estimate"
- Complete H1-H6 steps
- View estimate results

**Scenario 2: Contractor Flow**
- Set `contractorFlow: true`
- Register contractor account
- Complete company setup
- Access contractor tools (C1-C4)
- Generate estimates

**Scenario 3: Share Links**
- Set `contractorFlow: true` and `estimateSharing: true`
- Generate estimate as contractor
- Create share link via API: `POST /api/share/create`
- Access shared estimate: `/estimate/{token}`

**Scenario 4: Education Page**
- Set `educationPage: true`
- Navigate to `/education`
- View HVAC education content

## Data Storage

All data is stored in `/data` directory:
- `contractors.json` - Contractor accounts
- `companies.json` - Company information
- `estimates.json` - Generated estimates
- `share-tokens.json` - Share link tokens
- `telemetry.json` - Telemetry events (last 1000)
- `rate-limits.json` - Rate limit tracking

**Note**: Data directory is git-ignored. Clear `/data` to reset application state.

## API Endpoints

### Homeowner
- `POST /api/homeowner/estimate` - Generate estimate
- `GET /api/homeowner/estimate/[estimateId]` - Get estimate

### Contractor
- `POST /api/contractor/register` - Register contractor
- `POST /api/contractor/signin` - Sign in
- `POST /api/contractor/signout` - Sign out
- `POST /api/contractor/company-setup` - Update company setup
- `POST /api/contractor/estimate` - Generate contractor estimate

### Share Links (requires estimateSharing flag)
- `POST /api/share/create` - Create share link
- `GET /estimate/[token]` - View shared estimate

## Rate Limits

- API routes: 100 requests/minute (homeowner), 20 requests/minute (contractor)
- Rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Session Management

- Sessions stored in secure HTTP-only cookies
- Session duration: 7 days
- Cookie name: `contractor_session`
- Session timeout: Automatic after 7 days

## Troubleshooting

### Issue: "Rate limit exceeded"
- Wait 1 minute or clear `/data/rate-limits.json`

### Issue: "Company setup incomplete"
- Complete company setup at `/contractor/company-setup`
- Ensure all required fields are filled

### Issue: "Feature not enabled"
- Check `lib/feature-flags.ts` - ensure flag is set to `true`
- Restart dev server if needed

### Issue: Data not persisting
- Check `/data` directory exists and is writable
- Check file permissions

## Security Notes

⚠️ **Development Only**:
- Password hashing uses base64 (NOT secure) - replace with bcrypt in production
- File-based storage is for development only - use database in production
- Rate limiting is in-memory/file-based - use Redis in production

