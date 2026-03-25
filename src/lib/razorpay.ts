// ── Client-side Razorpay utility ─────────────────────────────────────────────
// This file is imported only in client components / hooks.

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(false); return; }
    if (document.getElementById("razorpay-script")) { resolve(true); return; }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface InitiatePaymentOptions {
  orderId: string;
  /** Total amount in paise (including GST) */
  amount: number;
  /** Base amount in paise (before GST) */
  baseAmount: number;
  /** GST amount in paise */
  gstAmount: number;
  packType: string;
  packName: string;
  userEmail: string | null;
  userPhone: string | null;
  userId: string;
  onSuccess: (response: RazorpayResponse) => void;
  /** scriptFailed=true when the Razorpay JS bundle failed to load */
  onFailure: (scriptFailed?: boolean) => void;
}

export async function initiatePayment(opts: InitiatePaymentOptions): Promise<void> {
  const {
    orderId, amount, baseAmount, gstAmount,
    packType, packName, userEmail, userPhone, userId,
    onSuccess, onFailure,
  } = opts;

  const loaded = await loadRazorpayScript();
  if (!loaded) { onFailure(true); return; }

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency: "INR",
    name: "CrackTheRole",
    description: `${packName} (incl. 18% GST)`,
    order_id: orderId,
    prefill: {
      email: userEmail ?? "",
      contact: userPhone ?? "",
    },
    notes: {
      userId,
      packType,
      baseAmount: String(Math.round(baseAmount / 100)),
      gstAmount: String(Math.round(gstAmount / 100)),
    },
    theme: { color: "#3b82f6" },
    handler: onSuccess,
    modal: { ondismiss: onFailure },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}
