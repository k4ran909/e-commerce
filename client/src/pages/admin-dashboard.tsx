import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const { me, loading, logout } = useAuth();
  const { data } = useQuery<{ products: number; orders: number; revenue: number }>({
    queryKey: ["/api/admin/summary"],
  });

  useEffect(() => {
    document.title = "Admin Dashboard";
  }, []);

  if (loading) return <div className="container mx-auto p-6">Loading…</div>;
  if (!me) return <div className="container mx-auto p-6">Unauthorized</div>;
  if (me.role !== "admin") return <div className="container mx-auto p-6">Admins only.</div>;

  const formatIDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl lg:text-4xl font-light">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/products"><Button variant="outline">View Store</Button></Link>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-sm text-muted-foreground">Products</div>
          <div className="text-2xl font-semibold">{data?.products ?? "—"}</div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="text-2xl font-semibold">{data?.orders ?? "—"}</div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-sm text-muted-foreground">Revenue</div>
          <div className="text-2xl font-semibold">{data ? formatIDR.format(data.revenue / 100) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
