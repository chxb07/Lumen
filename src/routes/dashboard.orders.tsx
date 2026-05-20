import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/orders")({ component: Orders });

const STATUS_CLR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700",
  paid: "bg-blue-500/15 text-blue-700",
  processing: "bg-indigo-500/15 text-indigo-700",
  shipped: "bg-violet-500/15 text-violet-700",
  delivered: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-rose-500/15 text-rose-700",
  refunded: "bg-slate-500/15 text-slate-700",
};

function Orders() {
  const { user } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  if (!orders || orders.length === 0)
    return (
      <div className="rounded-3xl border bg-card p-10 text-center">
        <div className="font-display text-xl font-semibold">No orders yet</div>
        <Link to="/shop" className="mt-3 inline-block text-sm text-primary underline">
          Start shopping
        </Link>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-t hover:bg-secondary/30">
              <td className="px-4 py-3">
                <Link to="/dashboard/orders/$id" params={{ id: o.id }} className="font-medium hover:underline">
                  #{o.id.slice(0, 8)}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLR[o.status] || ""}`}>
                  {o.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold">{formatPrice(Number(o.total))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
