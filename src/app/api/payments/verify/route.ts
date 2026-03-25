import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { recordPayment } from "@/lib/db";
import { PRICING } from "@/config/constants";

export const runtime = "nodejs";

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string;
  packType: string;
  /** Total paid amount in paise */
  amount?: number;
}

async function activatePack(userId: string, packType: string): Promise<Record<string, unknown>> {
  const ref = doc(db, "users", userId);

  if (packType === "starter_pack") {
    await updateDoc(ref, {
      resumeDownloadsLeft: increment(1),
      resumesLimit: increment(1),
    });
    return { resumeDownloadsLeft: "incremented", resumesLimit: "incremented" };
  }

  if (packType === "interview_pack") {
    await updateDoc(ref, {
      interviewsLimit: increment(PRICING.interviewPack.interviews),
    });
    return { interviewsLimit: `+${PRICING.interviewPack.interviews}` };
  }

  if (packType === "pro_monthly") {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await updateDoc(ref, {
      plan: "pro",
      interviewsLimit: PRICING.pro.interviews,
      resumesLimit: PRICING.pro.resumes,
      resumeDownloadsLeft: PRICING.pro.resumeDownloads,
      planExpiresAt: expiresAt,
    });
    return {
      plan: "pro",
      interviewsLimit: PRICING.pro.interviews,
      resumesLimit: PRICING.pro.resumes,
      planExpiresAt: expiresAt.toISOString(),
    };
  }

  throw new Error(`Unknown packType: ${packType}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyRequest;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      packType,
      amount,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !packType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    // ── Verify HMAC signature ─────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // ── Activate pack ─────────────────────────────────────────────────────
    const updatedPlan = await activatePack(userId, packType);

    // ── Record payment in Firestore ───────────────────────────────────────
    const paidInRupees = amount ? Math.round(amount / 100) : 0;
    const gstRupees = Math.round(paidInRupees * 0.18 / 1.18);
    await recordPayment(userId, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: paidInRupees,
      gstAmount: gstRupees,
      packType,
      status: "captured",
    });

    return NextResponse.json({ success: true, updatedPlan });
  } catch (err) {
    console.error("[payments/verify]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
