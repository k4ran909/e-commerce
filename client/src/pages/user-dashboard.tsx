import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm-dialog";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import DeleteAccountDialog from "@/components/modals/delete-account-dialog";
import { useToast } from "@/hooks/use-toast";

export default function UserDashboard() {
  const { me, loading, logout } = useAuth();

  useEffect(() => {
    document.title = "Your Dashboard";
  }, []);

  if (loading) return <div className="container mx-auto p-6">Loading…</div>;
  if (!me) return (
    <div className="container mx-auto p-6">
      <p className="mb-4">You are not logged in.</p>
      <Link href="/products"><Button>Browse products</Button></Link>
    </div>
  );

  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async ({ password, confirm }: { password: string; confirm: string }) => {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, confirm }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to delete account");
      return true;
    },
    onSuccess: async () => {
      toast({ title: "Account deleted" });
      await logout();
    },
    onError: (e: any) => {
      toast({ title: "Deletion failed", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <h1 className="font-serif text-3xl lg:text-4xl font-light">Welcome, {me.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-card">
          <h3 className="font-medium mb-2">Account</h3>
          <p className="text-sm text-muted-foreground">{me.email}</p>
          {me.role !== "admin" && (
            <div className="pt-4">
              <DeleteAccountDialog
                onConfirm={(password, confirm) => deleteMutation.mutate({ password, confirm })}
                loading={deleteMutation.isLoading}
              >
                <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10">
                  Delete My Account
                </Button>
              </DeleteAccountDialog>
            </div>
          )}
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <h3 className="font-medium mb-2">Orders</h3>
          <p className="text-sm text-muted-foreground">View your recent orders soon.</p>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <h3 className="font-medium mb-2">Actions</h3>
          <div className="flex gap-2">
            <Confirm
              title="Confirm Logout"
              description="Are you sure you want to sign out of your account?"
              confirmLabel="Logout"
              onConfirm={logout}
            >
              <Button variant="outline">Logout</Button>
            </Confirm>
            {me.role === "admin" && (
              <Link href="/admin"><Button>Admin Dashboard</Button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
