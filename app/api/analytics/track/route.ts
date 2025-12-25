import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  try {
    const { event, properties } = await request.json();

    if (!event) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Log analytics event (non-PII only)
    await logEvent(`analytics_${event}`, properties || {});

    // TODO: In production, send to analytics service
    // Example: Google Analytics, Mixpanel, etc.
    // await analyticsService.track(event, sanitizedProperties);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

