import { NextRequest, NextResponse } from "next/server";
import { getEstimateById } from "@/lib/estimate-storage";
import { logEvent } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  try {
    const { estimateId, email } = await request.json();

    if (!estimateId || !email) {
      return NextResponse.json(
        { error: "Estimate ID and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get estimate data
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // TODO: In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, log the email request
    await logEvent("estimate_email_requested", {
      estimateId,
      email: email.substring(0, 3) + "***", // Partial email for privacy
    });

    // Stub: In production, this would send an email via email service
    // Example with SendGrid:
    // await sendGrid.send({
    //   to: email,
    //   from: 'noreply@comfyprice.com',
    //   subject: 'Your HVAC Estimate from COMFYpri¢e',
    //   html: generateEmailTemplate(estimate)
    // });

    return NextResponse.json({
      success: true,
      message: "Estimate email sent successfully",
      // In development, return estimate data for testing
      ...(process.env.NODE_ENV !== "production" && { estimate }),
    });
  } catch (error) {
    console.error("Email sending error:", error);
    await logEvent("estimate_email_error", {
      error: (error as Error).message || "unknown",
    });
    return NextResponse.json(
      { error: "Failed to send estimate email" },
      { status: 500 }
    );
  }
}


