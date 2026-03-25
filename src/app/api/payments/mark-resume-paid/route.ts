import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAuthToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";

interface MarkPaidRequest {
  resumeId: string;
}

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
    const body = (await req.json()) as MarkPaidRequest;
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    if (resumeId === "unsaved") {
      return NextResponse.json({ success: true });
    }

    // Verify ownership before writing
    const resumeDoc = await adminDb.collection("resumes").doc(resumeId).get();
    if (!resumeDoc.exists) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (resumeDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("resumes").doc(resumeId).update({
      isPaidDownload: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payments/mark-resume-paid]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
