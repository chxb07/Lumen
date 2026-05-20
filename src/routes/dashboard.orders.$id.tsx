import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatDate } from "@/lib/format";
import { CheckCircle2, Circle, Truck, Package, Home } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders/$id")({ component: OrderDetail });

const STEPS = ["pending", "paid", "processing", "shipped", "delivered"] as const;

function OrderDetail() {
  const { id } = useParams({ from: "/dashboard/orders/$id" });
  const { data } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
      return { order, items: items || [] };
    },
  });

  if (!data?.order)
    return <div className="rounded-3xl border bg-card p-10 text-center">Loading…</div>;

  const o: any = data.order;
  const stepIdx = STEPS.indexOf(o.status as any);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/orders" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back to orders
      </Link>
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Order</div>
            <div className="font-display text-2xl font-bold">#{o.id.slice(0, 8)}</div>
            <div className="text-xs text-muted-foreground">Placed {formatDate(o.created_at)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-display text-2xl font-bold">{formatPrice(Number(o.total))}</div>
          </div>
        </div>

        {/* Tracking */}
        <div className="mt-6 grid grid-cols-5 gap-1">
          {STEPS.map((s, i) => {
            const reached = i <= stepIdx;
            const Icon = i === 4 ? Home : i === 3 ? Truck : i === 2 ? Package : reached ? CheckCircle2 : Circle;
            return (
              <div key={s} className="flex flex-col items-center text-center">
                <div className={`grid h-9 w-9 place-items-center rounded-full ${reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className={`mt-1 text-[10px] uppercase ${reached ? "font-semibold" : "text-muted-foreground"}`}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6">
        <div className="text-sm font-semibold">Items</div>
        <div className="mt-4 space-y-3">
          {data.items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-3">
              {it.product_image && <img src={it.product_image} className="h-14 w-14 rounded-xl object-cover" />}
              <div className="flex-1 text-sm">
                <div className="font-medium">{it.product_name}</div>
                <div className="text-xs text-muted-foreground">× {it.quantity}</div>
              </div>
              <div className="font-semibold">{formatPrice(Number(it.unit_price) * it.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-1 border-t pt-4 text-sm">
          <Row l="Subtotal" v={formatPrice(Number(o.subtotal))} />
          {Number(o.discount) > 0 && <Row l="Discount" v={`− ${formatPrice(Number(o.discount))}`} />}
          <Row l="Shipping" v={Number(o.shipping) === 0 ? "Free" : formatPrice(Number(o.shipping))} />
          <Row l="Tax" v={formatPrice(Number(o.tax))} />
          <Row l="Total" v={formatPrice(Number(o.total))} strong />
        </div>
      </div>
    </div>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{l}</span><span>{v}</span>
    </div>
  );
}
