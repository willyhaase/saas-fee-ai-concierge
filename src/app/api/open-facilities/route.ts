import { NextResponse } from "next/server";
import { getLiveSaasFeeOpenFacilities } from "@/lib/saas-fee-live-status";

export const runtime = "nodejs";

export async function GET() {
  const facilities = await getLiveSaasFeeOpenFacilities();

  if (!facilities) {
    return NextResponse.json(
      {
        error: "Live open-facilities status is not available right now.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    ...facilities,
  });
}
