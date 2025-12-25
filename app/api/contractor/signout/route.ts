// Contractor sign-out API - Step 3
import { NextResponse } from "next/server";
import { clearContractorSession } from "@/lib/session";

export async function POST() {
  await clearContractorSession();
  return NextResponse.json({ success: true });
}

