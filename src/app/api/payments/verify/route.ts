import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { PRICING } from "@/config/constants";

export const runtime = "nodejs";

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId: string;
  packType: string;
}

async function activatePack(
  userId: string,
  packType: string
): Promise<Record<string, unknown>> {
  const ref = adminDb.collection("users").doc(userId);

  if (packType === "starter_pack") {
    await ref.update({
      resumeDownloadsLeft: FieldValue.increment(1),
      resumesLimit: FieldValue.increment(1),
    });
    return { resumeDownloadsLeft: "incremented", resumesLimit: "incremented" };
  }

  if (packType === "interview_pack") {
    await ref.update({
      interviewsLimit: FieldValue.increment(PRICING.interviewPack.interviews),
    });
    return { interviewsLimit: `+${PRICING.interviewPack.interviews}` };
  }

  if (packType === "pro_monthly") {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await ref.update({
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
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !packType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    // ── Verify HMAC signature ────────────────────────────────────────────────
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // ── Replay attack protection: ensure this order hasn't been fulfilled ────
    const existingPayment = await adminDb
      .collection("payments")
      .where("orderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!existingPayment.empty) {
      // Already processed — idempotent success, don't re-activate
      return NextResponse.json({
        success: true,
        updatedPlan: { note: "Payment was already processed" },
      });
    }

    // ── Fetch authoritative amount from Razorpay — never trust client payload ──
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paidInRupees = Math.round(Number(payment.amount) / 100);
    const gstRupees = Math.round((paidInRupees * 0.18) / 1.18);

    // ── Activate pack ────────────────────────────────────────────────────────
    const updatedPlan = await activatePack(userId, packType);

    // ── Record payment (admin SDK bypasses Firestore rules) ──────────────────
    await adminDb.collection("payments").add({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: paidInRupees,
      gstAmount: gstRupees,
      packType,
      status: payment.status,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, updatedPlan });
  } catch (err) {
    console.error("[payments/verify]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
