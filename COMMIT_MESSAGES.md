# Suggested Commit Messages

## Step 3: Real Authentication & Persistence

```
Step 3: Implement real contractor authentication and company setup persistence

- Replace stubbed contractor access gate with session-based authentication
- Add secure cookie-based session management (httpOnly, secure, sameSite)
- Implement company setup persistence with file-based storage
- Add contractor registration, sign-in, sign-out APIs
- Update all contractor pages to use real session checks
- Wire company setup completion gate to persisted data
- Add access-denied and setup-required pages
- All feature flags remain OFF by default
```

## Step 4: Estimate Generation System

```
Step 4: Implement deterministic estimate generation and homeowner flow completion

- Add deterministic estimate generation engine (stubbed pricing)
- Implement estimate persistence with file-based storage
- Convert homeowner pages (H1-H6) to client components with form state
- Add homeowner estimate generation API
- Complete homeowner flow with estimate display on H6
- Ensure determinism: same inputs → same outputs
- Maintain homeowner-safe defaults (no internal costs exposed)
```

## Step 5: Contractor Flow Completion

```
Step 5: Complete contractor flow with estimate generation

- Add contractor estimate generation API
- Enforce company isolation for all contractor estimates
- Wire contractor pages to generate and display estimates
- Ensure company-scoped operations throughout
```

## Step 6: Versioning System

```
Step 6: Implement immutable versioning system

- Add version management with v1 and v+1 behavior
- Implement status transition logging
- Create versioned entity structure
- Add version anchoring for estimates and share links
- Ensure immutability of version history
```

## Step 7: Share Links & PDF

```
Step 7: Implement tokenized share links system

- Add share token generation and validation
- Support expirable, revocable, and single-use tokens
- Implement share link creation API
- Update estimate viewer to use real token validation
- Add version anchoring to share links
- Gate behind estimateSharing feature flag (OFF by default)
- Stub PDF generation (coming soon)
```

## Step 8: Telemetry System

```
Step 8: Add non-PII telemetry and audit logging

- Implement telemetry system with PII filtering
- Add silent failure handling (doesn't break app)
- Limit to last 1000 events (minimal audit)
- Add automatic page view logging in middleware
- Log key events: estimate generation, share links, errors
- Ensure all metadata is sanitized (no PII)
```

## Step 9: Hardening & Execution Authorization

```
Step 9: Add rate limiting, token TTL, and execution authorization

- Implement rate limiting for API routes (10-100 req/min)
- Add token TTL support for share links
- Implement single-use token enforcement
- Add 7-day session timeout
- Create execution authorization system
- Enforce company isolation end-to-end
- Add middleware for rate limiting and telemetry
- Update all API routes with authorization checks
```

## Documentation

```
docs: Add runbook and acceptance documentation

- Add RUNBOOK.md with installation and testing instructions
- Add STEPS_3-9_ACCEPTANCE.md with complete requirements checklist
- Add STEPS_3-9_SUMMARY.md with implementation overview
- Add COMMIT_MESSAGES.md (this file)
```


