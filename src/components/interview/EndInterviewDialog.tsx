"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface EndInterviewDialogProps {
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function EndInterviewDialog({
    onConfirm,
    isLoading = false,
}: EndInterviewDialogProps) {
    const [open, setOpen] = useState(false);

    function handleConfirm() {
        setOpen(false);
        onConfirm();
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="border-brand-danger/40 text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger bg-transparent gap-1.5 h-8 text-xs"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    End Interview
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-surface border-border/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-text-primary">
                        End this interview?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-text-secondary">
                        Are you sure you want to end this interview? Your conversation will
                        be scored and reviewed. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2">
                        Continue Interview
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-brand-danger hover:bg-brand-danger/90 text-white"
                    >
                        End and Score
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
