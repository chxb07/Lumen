import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({ component: Cart });

function Cart() {
  const { items, update, remove, subtotal, count } = useCart();
  const { user } = useAuth();
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 9;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold">Sign in to view your cart</div>
        <p className="mt-2 text-sm text-muted-foreground">Save items and check out faster.</p>
        <Button asChild className="mt-6 rounded-full" size="lg">
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="mt-6 font-display text-3xl font-bold">Your cart is empty</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Start exploring to add items to your bag.
        </p>
        <Button asChild className="mt-6 rounded-full" size="lg">
          <Link to="/shop">Shop now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Shopping cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex gap-4 rounded-3xl border bg-card p-4"
              >
                <img
                  src={it.product?.images?.[0]}
                  alt={it.product?.name}
                  className="h-28 w-28 rounded-2xl object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/product/$slug"
                      params={{ slug: it.product?.slug || "" }}
                      className="font-medium hover:underline"
                    >
                      {it.product?.name}
                    </Link>
                    <button
                      onClick={() => remove(it.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(Number(it.product?.price || 0))}
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="inline-flex items-center rounded-full border">
                      <button
                        className="px-3 py-1.5"
                        onClick={() => update(it.id, it.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <div className="min-w-[2ch] px-2 text-center text-sm font-medium">
                        {it.quantity}
                      </div>
                      <button
                        className="px-3 py-1.5"
                        onClick={() => update(it.id, it.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-semibold">
                      {formatPrice(Number(it.product?.price || 0) * it.quantity)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
          <div className="text-sm font-semibold">Order summary</div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Tax (est.)" value={formatPrice(tax)} />
            <div className="my-2 border-t" />
            <Row label="Total" value={formatPrice(total)} strong />
          </dl>
          <Button asChild size="lg" className="mt-6 w-full rounded-full">
            <Link to="/checkout">
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free shipping on orders over $75.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold" : ""}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
