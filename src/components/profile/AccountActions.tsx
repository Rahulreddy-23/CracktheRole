"use client";

import { useState } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useUserContext } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";

export default function AccountActions() {
  const { user, signOut } = useUserContext();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE" || !user) return;
    setDeleting(true);

    try {
      const supabase = createClient();
      // Deleting the profile row cascades to all related data
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to delete account. Please contact support.");
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
    } catch {
      toast.error("Something went wrong.");
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Account</h3>

      <div className="space-y-3">
        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          variant="outline"
          className="w-full border-border/50 bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface2 h-10 gap-2"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Sign Out
        </Button>

        <Button
          onClick={() => setDeleteOpen(true)}
          variant="outline"
          className="w-full border-brand-danger/30 bg-brand-danger/5 text-brand-danger hover:bg-brand-danger/15 h-10 gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-surface border border-border/50 text-text-primary max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-brand-danger">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary text-sm">
              This action is permanent and cannot be undone. All your interview sessions,
              progress data, and bookmarks will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-2">
            <p className="text-xs text-text-secondary mb-2">
              Type <span className="font-mono font-bold text-text-primary">DELETE</span> to confirm
            </p>
            <Input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9 font-mono"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { setDeleteInput(""); setDeleteOpen(false); }}
              className="border-border/50 bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface2"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteInput !== "DELETE" || deleting}
              className="bg-brand-danger hover:bg-brand-danger/90 text-white gap-2 disabled:opacity-40"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
