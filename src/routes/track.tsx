import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({ component: Track });

function Track() {
  const [id, setId] = React.useState("");
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    setLoading(true);
    const short = id.trim().toLowerCase();
    const { data } = await supabase.from("orders").select("*").ilike("id", `${short}%`).maybeSingle();
    setLoading(false);
    if (!data) {
      toast.error("Order not found");
      setOrder(null);
      return;
    }
    setOrder(data);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Track your order</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your order ID to see its status.</p>

      <form onSubmit={search} className="mt-6 flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. a1b2c3d4"
          className="flex-1 rounded-full border bg-background px-5 py-3 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" disabled={loading} className="rounded-full">
          {loading ? "Searching…" : "Track"}
        </Button>
      </form>

      {order && (
        <div className="mt-8 rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">#{order.id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">Placed {formatDate(order.created_at)}</div>
            </div>
          </div>
          <div className="mt-4 text-sm">
            Status: <span className="font-semibold capitalize">{order.status}</span>
          </div>
          {order.tracking_number && (
            <div className="mt-1 text-sm">Tracking #: {order.tracking_number}</div>
          )}
          <Link to="/dashboard/orders/$id" params={{ id: order.id }} className="mt-4 inline-block text-sm text-primary underline">
            View full order →
          </Link>
        </div>
      )}
    </div>
  );
}
