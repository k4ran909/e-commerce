"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteAccountDialogProps {
  children: React.ReactNode; // trigger
  onConfirm: (password: string, confirm: string) => Promise<void> | void;
  loading?: boolean;
}

export function DeleteAccountDialog({ children, onConfirm, loading }: DeleteAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || confirm !== "DELETE") return;
    try {
      setSubmitting(true);
      await onConfirm(password, confirm);
      setOpen(false);
      setPassword("");
      setConfirm("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DialogPrimitive.Title className="text-lg font-semibold">Delete Account</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
            This action is permanent. Enter your password and type <span className="font-semibold text-red-500">DELETE</span> below to confirm.
          </DialogPrimitive.Description>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label htmlFor="delete-password" className="text-xs font-medium text-muted-foreground">Password</label>
              <PasswordInput
                id="delete-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="delete-confirm" className="text-xs font-medium text-muted-foreground flex items-center gap-1">Type DELETE to confirm</label>
              <input
                id="delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="off"
                required
              />
              {confirm && confirm !== "DELETE" && (
                <p className="text-[11px] text-red-500">You must type DELETE exactly (case-sensitive).</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting || loading}>Cancel</Button>
              <Button
                type="submit"
                variant="outline"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={submitting || !password || confirm !== "DELETE" || loading}
              >
                {submitting || loading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default DeleteAccountDialog;