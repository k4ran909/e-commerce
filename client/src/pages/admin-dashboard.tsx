import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Confirm } from "@/components/ui/confirm-dialog";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { me, loading, logout } = useAuth();
  const { data } = useQuery<{ products: number; orders: number; revenue: number }>({
    queryKey: ["/api/admin/summary"],
  });

  const { data: productList } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [period, setPeriod] = useState<"week"|"month"|"quarter">("month");
  const { data: sales } = useQuery<{ period: string; from: string; to: string; points: { date: string; total: number }[] }>({
    queryKey: ["/api/admin/sales", period],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to delete product");
      }
      return true;
    },
    onSuccess: () => {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/summary"] });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
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
        {/* Desktop / tablet action buttons */}
        <div className="hidden md:flex gap-2">
          <Link href="/products"><Button variant="outline">View Store</Button></Link>
          <Confirm
            title="Confirm Logout"
            description="Are you sure you want to sign out of your account?"
            confirmLabel="Logout"
            onConfirm={logout}
          >
            <Button variant="outline">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </Confirm>
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

      {/* Mobile action buttons moved below revenue */}
      <div className="flex md:hidden gap-2 pt-2">
        <Link href="/products"><Button variant="outline" className="flex-1">View Store</Button></Link>
        <Confirm
          title="Confirm Logout"
          description="Are you sure you want to sign out of your account?"
          confirmLabel="Logout"
          onConfirm={logout}
        >
          <Button variant="outline" className="flex-1">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </Confirm>
      </div>

      {/* Product List */}
      <div className="border rounded-xl bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-light">Products</h2>
            <p className="text-sm text-muted-foreground">Manage your catalog</p>
          </div>
          <Link href="/admin/products/new"><Button>Add New Product</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productList?.slice()
                .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
                .map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/40">
                  <td className="py-3 px-4 align-middle font-mono text-xs">{p.id.slice(0, 8)}</td>
                  <td className="py-3 px-4 align-middle">{p.name}</td>
                  <td className="py-3 px-4 align-middle capitalize">{p.category}</td>
                  <td className="py-3 px-4 align-middle">{formatIDR.format(p.price / 100)}</td>
                  <td className="py-3 px-4 align-middle">{p.createdAt ? new Date(p.createdAt as any).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-4 align-middle text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/products/${p.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                      <Link href={`/product/${p.id}?from=admin`}><Button size="sm" variant="outline">Preview</Button></Link>
                      <Confirm
                        title="Delete product?"
                        description={`This will permanently remove ${p.name}.`}
                        confirmLabel="Delete"
                        onConfirm={() => deleteMutation.mutate(p.id)}
                      >
                        <Button size="sm" variant="destructive">Delete</Button>
                      </Confirm>
                    </div>
                  </td>
                </tr>
              ))}
              {!productList?.length && (
                <tr>
                  <td className="py-6 px-4 text-center text-muted-foreground" colSpan={6}>No products</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="border rounded-xl bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-light">Sales Overview</h2>
            <p className="text-sm text-muted-foreground">Total revenue per day</p>
          </div>
          <div className="flex gap-2">
            {(["week","month","quarter"] as const).map((p) => (
              <Button key={p} variant={period===p?"default":"outline"} size="sm" onClick={() => setPeriod(p)} className="capitalize">{p}</Button>
            ))}
          </div>
        </div>
        <div className="p-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sales?.points ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} minTickGap={24} />
              <YAxis tickFormatter={(v) => `${Math.round(v/1000)}k`} />
              <Tooltip formatter={(v: any) => formatIDR.format((v as number)/100)} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
