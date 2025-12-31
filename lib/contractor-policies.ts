/**
 * CONTRACTOR PREMIUM POSITIONING POLICIES
 * 
 * Internal policies for Pricing Authority Partners (contractors).
 * These policies are enforced silently and are NOT visible to homeowners.
 * 
 * This is a premium network, not a commodity lead marketplace.
 */

/**
 * PREMIUM PARTNER REQUIREMENTS
 * 
 * Contractors must meet these criteria to participate:
 * 1. Licensed and insured (verified)
 * 2. Agree to no undercutting below estimate ranges
 * 3. Agree to no bait-and-switch pricing
 * 4. Agree to no pressure sales tactics
 * 
 * Violations result in silent removal from the network.
 */
export interface PremiumPartnerRequirements {
  isLicensed: boolean;
  isInsured: boolean;
  agreesToNoUndercutting: boolean;
  agreesToNoBaitAndSwitch: boolean;
  agreesToNoPressureSales: boolean;
}

/**
 * CONTRACTOR ROLE DEFINITION
 * 
 * Contractors are "Pricing Authority Partners" - not users, not buyers.
 * They are partners gaining leverage from the homeowner education system.
 * 
 * Their role:
 * - Review pre-qualified homeowners
 * - Validate structured estimates
 * - Close higher-trust opportunities
 * - Act as final validators, not price setters
 */
export const CONTRACTOR_ROLE_DEFINITION = {
  title: "Pricing Authority Partner",
  description: "Review pre-qualified homeowners, validate structured estimates, and close higher-trust opportunities.",
  responsibilities: [
    "Review homeowner estimates (read-only)",
    "Validate pricing ranges based on on-site evaluation",
    "Confirm final pricing after professional assessment",
    "Maintain premium brand association",
  ],
  not: [
    "Buying leads",
    "Competing in a race to the bottom",
    "Quoting blind",
    "Setting prices without homeowner context",
  ],
};

/**
 * DATA FLOW RULES
 * 
 * Homeowner → Estimate → Contractor
 * 
 * NEVER Contractor → Homeowner (until homeowner opts in)
 * 
 * - No cold outreach
 * - No automated sales messages
 * - Contractors respond only when homeowners request next steps
 */
export const DATA_FLOW_RULES = {
  direction: "Homeowner → Estimate → Contractor",
  restrictions: [
    "No contractor-initiated contact until homeowner requests appointment",
    "No automated sales messages",
    "No cold outreach",
    "Homeowner must explicitly opt-in to contractor contact",
  ],
};

/**
 * CONTRACTOR VALUE PROPOSITION (INTERNAL ONLY)
 * 
 * This positioning is contractor-facing only. Homeowners never see this.
 */
export const CONTRACTOR_VALUE_PROPOSITION = {
  positioningStatement: "Homeowners arrive informed, pre-qualified, and aligned on realistic investment ranges before you ever step on-site.",
  keyBenefits: [
    "Fewer price objections",
    "Shorter sales cycles",
    "Less time educating basics",
    "Higher close rates",
    "Premium brand association",
  ],
};

/**
 * FUTURE MONETIZATION DIRECTION (NOT IMPLEMENTED)
 * 
 * Contractors will eventually pay for:
 * - Access to pre-qualified homeowners
 * - Territory protection
 * - Priority routing
 * - Analytics on close rates and estimate alignment
 * 
 * This is a premium network, not a SaaS upsell.
 * DO NOT surface pricing, plans, or subscriptions yet.
 */
export const FUTURE_MONETIZATION = {
  futureOfferings: [
    "Access to pre-qualified homeowners",
    "Territory protection",
    "Priority routing",
    "Analytics on close rates and estimate alignment",
  ],
  note: "Premium network model - not implemented yet",
};

/**
 * CONTRACTOR POSITIONING MESSAGING
 * 
 * Contractors are positioned as "Final Validators", not "Price Setters"
 * This preserves homeowner trust and contractor authority simultaneously.
 */
export const CONTRACTOR_POSITIONING = {
  validator: "Final pricing is confirmed after on-site validation",
  not: "contractor sets the price",
  rationale: "Preserves homeowner trust and contractor authority simultaneously",
};



