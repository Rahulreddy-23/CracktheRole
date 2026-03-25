import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAuthToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ── Verify Firebase auth token ────────────────────────────────────────────
  let userId: string;
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    userId = await verifyAuthToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await adminDb.collection("users").doc(userId).update({
      plan: "free",
      interviewsLimit: 1,
      resumesLimit: 1,
      resumeDownloadsLeft: 0,
      planExpiresAt: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payments/cancel]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
