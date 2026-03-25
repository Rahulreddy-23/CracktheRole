import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PRICING, GST_RATE } from "@/config/constants";

export const runtime = "nodejs";

// Map pack type -> base price in INR
const PACK_PRICES: Record<string, number> = {
  starter_pack: PRICING.starterPack.basePrice,
  interview_pack: PRICING.interviewPack.basePrice,
  pro_monthly: PRICING.pro.basePrice,
};

const PACK_NAMES: Record<string, string> = {
  starter_pack: PRICING.starterPack.name,
  interview_pack: PRICING.interviewPack.name,
  pro_monthly: PRICING.pro.name,
};

export async function POST(req: NextRequest) {
  try {
    const { packType, userId } = (await req.json()) as {
      packType: string;
      userId: string;
    };

    if (!packType || !userId) {
      return NextResponse.json({ error: "packType and userId are required" }, { status: 400 });
    }

    if (!(packType in PACK_PRICES)) {
      return NextResponse.json(
        { error: `Invalid packType. Must be one of: ${Object.keys(PACK_PRICES).join(", ")}` },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const basePrice = PACK_PRICES[packType];
    const gst = Math.round(basePrice * GST_RATE);
    const total = basePrice + gst;
    const totalInPaise = total * 100;

    const order = await razorpay.orders.create({
      amount: totalInPaise,
      currency: "INR",
      receipt: `${packType}_${Date.now()}`,
      notes: {
        userId,
        packType,
        packName: PACK_NAMES[packType],
        basePrice: String(basePrice),
        gst: String(gst),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: totalInPaise,
      baseAmount: basePrice * 100,
      gstAmount: gst * 100,
      currency: "INR",
      packName: PACK_NAMES[packType],
    });
  } catch (err) {
    console.error("[payments/create-order]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
