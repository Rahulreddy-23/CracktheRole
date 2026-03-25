"use client";

import { useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Download, Zap, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { usePayment } from "@/hooks/use-payment";
import { useAuth } from "@/hooks/use-auth";
import { PRICING } from "@/config/constants";

interface DownloadGateProps {
  resumeId: string;
  /** Ref pointing to the DOM element that react-to-print should print */
  contentRef: React.RefObject<HTMLDivElement | null>;
  userId: string;
  isPro: boolean;
  isPaidDownload: boolean;
}

async function markResumeAsPaid(resumeId: string) {
  if (!resumeId || resumeId === "unsaved") return;
  const ref = doc(db, "resumes", resumeId);
  await updateDoc(ref, { isPaidDownload: true });
}

export default function DownloadGate({
  resumeId,
  contentRef,
  userId,
  isPro,
  isPaidDownload,
}: DownloadGateProps) {
  const [open, setOpen] = useState(false);
  const [localPaid, setLocalPaid] = useState(isPaidDownload);
  const { purchase, isProcessing } = usePayment();
  const { userProfile } = useAuth();

  const handlePrint = useReactToPrint({ contentRef });

  const triggerDownload = () => {
    handlePrint();
    toast.success("Resume downloaded!");
  };

  // After a successful purchase we mark the resume and trigger download
  const handlePurchase = async (packType: "starter_pack" | "pro_monthly") => {
    await purchase(packType, async () => {
      // Mark this specific resume as paid (for starter pack; Pro grants globally)
      if (packType === "starter_pack") {
        await markResumeAsPaid(resumeId);
        setLocalPaid(true);
      }
      setOpen(false);
      triggerDownload();
    });
  };

  // Check live Pro status from userProfile (refreshed after payment)
  const effectivelyPro = isPro || userProfile?.plan === "pro";

  // Already paid or on Pro plan → direct download
  if (effectivelyPro || localPaid) {
    return (
      <Button onClick={triggerDownload} className="gap-2">
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Download PDF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Download Your Resume
            </DialogTitle>
            <DialogDescription>
              Your resume is ready! To download, choose an option below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {/* Starter Pack option */}
            <PayOption
              icon={<Zap className="w-5 h-5 text-blue-400" />}
              title="One-Time Download"
              price={`Rs. ${PRICING.starterPack.basePrice}`}
              total={`Rs. ${PRICING.starterPack.totalPrice} total (incl. GST)`}
              features={["Download this resume as PDF", "ATS-friendly format"]}
              buttonLabel="Pay & Download"
              loading={isProcessing}
              onClick={() => handlePurchase("starter_pack")}
              variant="primary"
            />

            {/* Pro plan option */}
            <PayOption
              icon={<Crown className="w-5 h-5 text-yellow-400" />}
              title="Go Pro"
              price={`Rs. ${PRICING.pro.basePrice}/mo`}
              total={`Rs. ${PRICING.pro.totalPrice}/mo (incl. GST)`}
              features={[
                `${PRICING.pro.resumeDownloads} resume downloads/month`,
                `${PRICING.pro.interviews} mock interviews/month`,
                "Priority AI responses",
              ]}
              buttonLabel="Upgrade to Pro"
              loading={isProcessing}
              onClick={() => handlePurchase("pro_monthly")}
              variant="secondary"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PayOptionProps {
  icon: React.ReactNode;
  title: string;
  price: string;
  total: string;
  features: string[];
  buttonLabel: string;
  loading: boolean;
  onClick: () => void;
  variant: "primary" | "secondary";
}

function PayOption({ icon, title, price, total, features, buttonLabel, loading, onClick, variant }: PayOptionProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-colors",
        variant === "primary"
          ? "border-blue-500/30 bg-blue-500/5"
          : "border-white/10 bg-white/2"
      )}
    >
      <div className="flex items-start gap-2">
        {icon}
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">
            {price} <span className="text-muted-foreground/60">· {total}</span>
          </p>
        </div>
      </div>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onClick}
        disabled={loading}
        className="w-full"
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
      >
        {loading ? "Processing…" : buttonLabel}
      </Button>
    </div>
  );
}
