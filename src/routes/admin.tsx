import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatDate } from "@/lib/format";
import { Package, Users, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, isAdmin, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ count: orderCount }, { count: userCount }, { count: productCount }, { data: orders }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total, created_at").order("created_at", { ascending: false }).limit(30),
      ]);
      const revenue = (orders || []).reduce((a, b: any) => a + Number(b.total), 0);
      const byDay: Record<string, number> = {};
      (orders || []).forEach((o: any) => {
        const d = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        byDay[d] = (byDay[d] || 0) + Number(o.total);
      });
      const chart = Object.entries(byDay).reverse().map(([date, value]) => ({ date, value }));
      return { orderCount, userCount, productCount, revenue, chart };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20">Loading…</div>;
  if (!user || !isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold">Admin access only</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have admin privileges. An admin can promote you via the user_roles table.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary underline">Back home</Link>
      </div>
    );

  const cards = [
    { label: "Revenue", value: formatPrice(stats?.revenue || 0), I: DollarSign },
    { label: "Orders", value: stats?.orderCount || 0, I: ShoppingBag },
    { label: "Products", value: stats?.productCount || 0, I: Package },
    { label: "Customers", value: stats?.userCount || 0, I: Users },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your store performance</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border bg-card p-5"
          >
            <s.I className="h-5 w-5 text-primary" />
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 lg:col-span-2">
          <div className="mb-4 text-sm font-semibold">Revenue (last 30 days)</div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={stats?.chart || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-4 text-sm font-semibold">Recent orders</div>
          <div className="space-y-2 text-sm">
            {(recent || []).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="font-medium">#{o.id.slice(0, 6)}</div>
                  <div className="text-xs capitalize text-muted-foreground">{o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(Number(o.total))}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-6 text-sm">
        <div className="font-semibold">Manage</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Full product/coupon/order management UIs are scaffolded in the database. CRUD pages can be
          added in the next iteration.
        </p>
      </div>
    </div>
  );
}
