import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as React from "react";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const addrSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(100),
  zip: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

function Checkout() {
  const { items, subtotal, clear, count } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    full_name: "",
    email: user?.email || "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });

  React.useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email! }));
  }, [user]);

  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 9;
  const tax = (subtotal - discount) * 0.08;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!data) {
      toast.error("Invalid coupon");
      setDiscount(0);
      return;
    }
    if (Number(data.min_subtotal) > subtotal) {
      toast.error(`Min subtotal ${formatPrice(Number(data.min_subtotal))}`);
      return;
    }
    const d =
      data.type === "percent" ? (subtotal * Number(data.value)) / 100 : Number(data.value);
    setDiscount(Math.min(d, subtotal));
    toast.success(`Applied ${data.code}`);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      nav({ to: "/auth/login" });
      return;
    }
    const parsed = addrSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal,
        discount,
        shipping,
        tax,
        total,
        coupon_code: discount > 0 ? coupon.toUpperCase() : null,
        shipping_address: parsed.data,
      })
      .select()
      .single();

    if (error || !order) {
      setSubmitting(false);
      toast.error(error?.message || "Could not create order");
      return;
    }

    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product?.name || "",
      product_image: it.product?.images?.[0] || null,
      unit_price: Number(it.product?.price || 0),
      quantity: it.quantity,
    }));
    const { error: oiErr } = await supabase.from("order_items").insert(orderItems);
    if (oiErr) {
      setSubmitting(false);
      toast.error(oiErr.message);
      return;
    }

    await clear();
    setSubmitting(false);
    toast.success("Order placed!");
    nav({ to: "/dashboard/orders/$id", params: { id: order.id } });
  };

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold">Cart is empty</div>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop">Shop now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-2"
        >
          <section className="rounded-3xl border bg-card p-6">
            <div className="text-sm font-semibold">Contact & shipping</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} />
              <Field label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
              <Field
                className="sm:col-span-2"
                label="Address"
                v={form.address}
                on={(v) => setForm({ ...form, address: v })}
              />
              <Field label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} />
              <Field label="ZIP" v={form.zip} on={(v) => setForm({ ...form, zip: v })} />
              <Field
                className="sm:col-span-2"
                label="Country"
                v={form.country}
                on={(v) => setForm({ ...form, country: v })}
              />
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Payment</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Secure (demo)
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Real payments via Stripe will be enabled in the next step. For now this places a test
              order so you can preview the full checkout flow.
            </p>
          </section>
        </motion.div>

        <aside className="h-fit space-y-3 rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
          <div className="text-sm font-semibold">Order summary</div>
          <div className="max-h-60 space-y-3 overflow-auto py-2">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3">
                <img src={it.product?.images?.[0]} className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1 text-sm">
                  <div className="line-clamp-1 font-medium">{it.product?.name}</div>
                  <div className="text-xs text-muted-foreground">× {it.quantity}</div>
                </div>
                <div className="text-sm font-semibold">
                  {formatPrice(Number(it.product?.price || 0) * it.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Promo code"
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <Button type="button" variant="outline" className="rounded-full" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {discount > 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" /> Discount applied
            </div>
          )}
          <div className="space-y-1 border-t pt-3 text-sm">
            <Row l="Subtotal" v={formatPrice(subtotal)} />
            {discount > 0 && <Row l="Discount" v={`− ${formatPrice(discount)}`} />}
            <Row l="Shipping" v={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row l="Tax" v={formatPrice(tax)} />
            <Row l="Total" v={formatPrice(total)} strong />
          </div>
          <Button type="submit" disabled={submitting} className="mt-3 w-full rounded-full" size="lg">
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            Try coupons <code>WELCOME10</code> or <code>VIP50</code>
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  v,
  on,
  type = "text",
  className = "",
}: {
  label: string;
  v: string;
  on: (s: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <input
        required
        type={type}
        value={v}
        onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{l}</span>
      <span>{v}</span>
    </div>
  );
}
