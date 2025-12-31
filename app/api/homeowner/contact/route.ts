// Homeowner contact/lead capture API
import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/telemetry";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const key = getRateLimitKey(request);
  const limit = await checkRateLimit(key, 5, 60 * 1000); // 5 requests per minute
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      preferredContact,
      timeline,
      financing,
      upgrades,
      replacementReason,
      howTheyKnow,
      notes,
      estimateId,
      selectedTier,
      estimateRange,
      consentToContact,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // For minimal appointment requests, email OR phone is required (not both)
    // For full contact forms, both may be required
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Please provide either an email address or phone number" },
        { status: 400 }
      );
    }

    // If preferredContact is specified, validate that method is provided
    if (preferredContact === "email" && !email) {
      return NextResponse.json(
        { error: "Email address is required for email contact" },
        { status: 400 }
      );
    }

    if (preferredContact === "phone" && !phone) {
      return NextResponse.json(
        { error: "Phone number is required for phone contact" },
        { status: 400 }
      );
    }

    // Basic email validation (only if email is provided)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }
    }

    // Consent is only required for full contact forms, not minimal appointment requests
    // If consentToContact is provided, validate it; otherwise assume consent is implied by form submission
    if (consentToContact !== undefined && !consentToContact) {
      return NextResponse.json(
        { error: "Consent to contact is required" },
        { status: 400 }
      );
    }

    // Log the contact submission
    await logEvent("contact_form_submitted", {
      estimateId: estimateId || "unknown",
      selectedTier: selectedTier || "none",
      timeline,
      financing,
      upgrades: upgrades?.length || 0,
      replacementReason,
      howTheyKnow,
    });

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create CRM lead
    // 4. Trigger contractor assignment workflow
    // 5. Send confirmation email to homeowner

    // For now, we'll just return success
    // TODO: Integrate with email service, CRM, or contractor management system

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll contact you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    await logEvent("contact_form_error", { error: "unknown" });
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

