// Middleware - Edge runtime compatible
// Note: Rate limiting and telemetry are handled in API routes (Node.js runtime)
// Middleware runs in Edge runtime which doesn't support Node.js modules
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware is kept minimal for Edge runtime compatibility
  // Rate limiting is handled in individual API routes
  // Telemetry is handled in API routes and page components
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/homeowner/:path*",
    "/contractor/:path*",
  ],
};

