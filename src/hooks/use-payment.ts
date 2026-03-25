"use client";

import { useState } from "react";
import { toast } from "sonner";
import { initiatePayment, type RazorpayResponse } from "@/lib/razorpay";
import { useAuth } from "@/hooks/use-auth";
import { PRICING } from "@/config/constants";

type PackType = "starter_pack" | "interview_pack" | "pro_monthly";

interface PackConfig {
  name: string;
}

function getPackConfig(packType: PackType): PackConfig {
  switch (packType) {
    case "starter_pack":  return { name: PRICING.starterPack.name };
    case "interview_pack": return { name: PRICING.interviewPack.name };
    case "pro_monthly":   return { name: PRICING.pro.name };
  }
}

interface OrderData {
  orderId: string;
  amount: number;
  baseAmount: number;
  gstAmount: number;
  currency: string;
  packName: string;
}

const PAYMENT_TIMEOUT_MS = 120_000; // 2 minutes

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, userProfile, refreshProfile } = useAuth();

  const purchase = async (
    packType: PackType,
    onSuccess?: () => void
  ) => {
    if (!user) {
      toast.error("You must be logged in to make a purchase.");
      return;
    }
    setIsProcessing(true);

    // Payment timeout — if the modal is open too long, show a warning
    const timeoutId = setTimeout(() => {
      toast.warning(
        "Payment status unclear. Contact support if you were charged.",
        { duration: 10_000 }
      );
    }, PAYMENT_TIMEOUT_MS);

    try {
      // Step 1: Create Razorpay order on the server
      const orderToken = await user.getIdToken();
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${orderToken}`,
        },
        body: JSON.stringify({ packType }),
      });

      if (!orderRes.ok) {
        const err = (await orderRes.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create payment order.");
      }

      const orderData = (await orderRes.json()) as OrderData;
      const packConfig = getPackConfig(packType);

      // Step 2: Open Razorpay checkout
      // initiatePayment returns false (via onFailure) if the script fails to load
      await initiatePayment({
        orderId: orderData.orderId,
        amount: orderData.amount,
        baseAmount: orderData.baseAmount,
        gstAmount: orderData.gstAmount,
        packType,
        packName: packConfig.name,
        userEmail: user.email,
        userPhone: userProfile?.phoneNumber ?? null,
        userId: user.uid,

        onSuccess: async (response: RazorpayResponse) => {
          clearTimeout(timeoutId);
          try {
            // Step 3: Verify payment on the server and activate pack
            // Get a fresh token — payment modal may have been open for a while
            const verifyToken = await user.getIdToken();
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${verifyToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packType,
                amount: orderData.amount,
              }),
            });

            const verifyData = (await verifyRes.json()) as { success?: boolean; error?: string };

            if (verifyData.success) {
              await refreshProfile();
              toast.success(`${packConfig.name} activated!`);
              onSuccess?.();
            } else {
              toast.error(
                verifyData.error ?? "Payment verification failed. Contact support."
              );
            }
          } catch {
            toast.error("Verification error. Contact support if amount was deducted.");
          } finally {
            setIsProcessing(false);
          }
        },

        onFailure: (scriptFailed?: boolean) => {
          clearTimeout(timeoutId);
          if (scriptFailed) {
            const fallbackLink = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK;
            if (fallbackLink) {
              toast.error(
                "Payment widget failed to load.",
                {
                  description: "Use the direct payment link instead.",
                  action: {
                    label: "Pay via link",
                    onClick: () => window.open(fallbackLink, "_blank"),
                  },
                  duration: 10_000,
                }
              );
            } else {
              toast.error(
                "Payment widget failed to load. Please refresh the page and try again."
              );
            }
          } else {
            toast("Payment cancelled.");
          }
          setIsProcessing(false);
        },
      });
    } catch (err) {
      clearTimeout(timeoutId);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return { purchase, isProcessing };
}
