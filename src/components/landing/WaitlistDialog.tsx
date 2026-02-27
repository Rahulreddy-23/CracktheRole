"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface WaitlistDialogProps {
    tier: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WaitlistDialog({
    tier,
    open,
    onOpenChange,
}: WaitlistDialogProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("waitlist")
                .insert({ email: trimmed, tier });

            if (error) {
                if (error.code === "23505") {
                    toast.success("You are already on the waitlist! We will notify you soon.");
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } else {
                toast.success(
                    "You are on the list! We will notify you when payments go live."
                );
            }

            setEmail("");
            onOpenChange(false);
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-surface border-border/60">
                <DialogHeader>
                    <DialogTitle className="text-text-primary text-lg">
                        Join the {tier} Waitlist
                    </DialogTitle>
                    <DialogDescription className="text-text-secondary text-sm">
                        Enter your email and we will notify you as soon as {tier} plan
                        payments go live with Razorpay.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="bg-background border-border/60 text-text-primary placeholder:text-text-secondary/40 h-11"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium h-11"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            "Join Waitlist"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
