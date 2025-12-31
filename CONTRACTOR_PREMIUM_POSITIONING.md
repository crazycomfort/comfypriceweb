# Contractor Premium Positioning

## Overview

This platform positions contractors as **Pricing Authority Partners**—not users, not buyers. They are partners gaining leverage from the homeowner education system.

## Core Principles

### 1. Contractor Role Definition

**Title:** Pricing Authority Partner

**Responsibilities:**
- Review pre-qualified homeowners
- Validate structured estimates
- Close higher-trust opportunities
- Act as final validators, not price setters

**NOT:**
- Buying leads
- Competing in a race to the bottom
- Quoting blind
- Setting prices without homeowner context

### 2. Contractor Value Proposition (Internal Only)

**Positioning Statement:**
"Homeowners arrive informed, pre-qualified, and aligned on realistic investment ranges before you ever step on-site."

**Key Benefits:**
- Fewer price objections
- Shorter sales cycles
- Less time educating basics
- Higher close rates
- Premium brand association

**⚠️ IMPORTANT:** This language is contractor-facing only. Homeowners never see this.

### 3. Contractor Positioning Messaging

**Validator Role:**
"Final pricing is confirmed after on-site validation"

**NOT:**
"contractor sets the price"

This preserves homeowner trust and contractor authority simultaneously.

### 4. Data Flow Rules

**Direction:** Homeowner → Estimate → Contractor

**NEVER:** Contractor → Homeowner (until homeowner opts in)

**Restrictions:**
- No cold outreach
- No automated sales messages
- Contractors respond only when homeowners request next steps

### 5. Premium Partner Requirements (Silent Enforcement)

Contractors must meet these criteria:
1. Licensed and insured (verified)
2. Agree to no undercutting below estimate ranges
3. Agree to no bait-and-switch pricing
4. Agree to no pressure sales tactics

**Enforcement:** Violations result in silent removal from the network. This is policy-level, not marketing copy.

### 6. Contractor Dashboard Structure

The contractor interface must feel like:
- **A review console** - Review pre-qualified homeowners
- **A professional inbox** - See confidence signals and engagement levels
- **A validation workspace** - Accept for review, request site evaluation, add internal notes

**Required Elements:**
- View homeowner estimate (read-only)
- See confidence signals (completed steps, options reviewed, time spent, share link created)
- Ability to accept for review, request site evaluation, add internal-only notes
- Mark status (New, Reviewed, Scheduled, Closed)

**Explicitly Removed:**
- No bidding
- No price editing (only validation)
- No homeowner-visible messaging from contractor side

### 7. Future Monetization Direction (Not Implemented)

Contractors will eventually pay for:
- Access to pre-qualified homeowners
- Territory protection
- Priority routing
- Analytics on close rates and estimate alignment

**⚠️ DO NOT surface pricing, plans, or subscriptions yet.**

This is a premium network, not a SaaS upsell.

## Success Criteria

You are done when:
- ✅ Contractors feel lucky to be included
- ✅ Homeowners never feel sold to
- ✅ Pricing disputes drop
- ✅ On-site visits convert faster
- ✅ The platform feels like an authority referee, not a marketplace

## Hard Constraints

**DO NOT:**
- Add contractor login to homeowner pages
- Merge contractor and homeowner flows
- Add marketing copy to homeowner UX
- Expose contractor competition dynamics

## Implementation Files

- `lib/contractor-policies.ts` - Policy definitions and constants
- `app/contractor/owner/dashboard/page.tsx` - Main partner console
- `app/contractor/owner/leads/leads-client.tsx` - Professional inbox
- `app/contractor/value-orientation/page.tsx` - Partner onboarding
- `app/contractor/page.tsx` - Partner entry point

All changes are contractor-facing only. No homeowner-facing UI, copy, routes, or language is modified.



