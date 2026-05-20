import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, formatDate } from "@/lib/format";
import { Package, ShoppingBag, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/")({ component: DashHome });

function DashHome() {
  const { user } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const totalSpent = (orders || []).reduce((a, b: any) => a + Number(b.total), 0);

  const stats = [
    { label: "Orders", value: orders?.length || 0, I: Package },
    { label: "Total spent", value: formatPrice(totalSpent), I: TrendingUp },
    { label: "Active", value: orders?.filter((o: any) => ["pending","paid","processing","shipped"].includes(o.status)).length || 0, I: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
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

      <div className="rounded-3xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">Recent orders</div>
          <Link to="/dashboard/orders" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        {orders && orders.length > 0 ? (
          <div className="space-y-2">
            {orders.map((o: any) => (
              <Link
                key={o.id}
                to="/dashboard/orders/$id"
                params={{ id: o.id }}
                className="flex items-center justify-between rounded-xl border p-3 text-sm hover:bg-secondary"
              >
                <div>
                  <div className="font-medium">#{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(Number(o.total))}</div>
                  <div className="text-xs capitalize text-muted-foreground">{o.status}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No orders yet — <Link to="/shop" className="text-primary underline">browse the shop</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
