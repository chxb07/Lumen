import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/wishlist")({ component: Wishlist });

function Wishlist() {
  const { items, remove } = useWishlist();
  const { add } = useCart();
  const { user } = useAuth();

  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold">Sign in to see your wishlist</div>
        <Button asChild className="mt-6 rounded-full"><Link to="/auth/login">Sign in</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-4xl font-bold">Wishlist</h1>
        <div className="text-sm text-muted-foreground">{items.length} items</div>
      </div>

      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 font-display text-2xl font-semibold">Nothing saved yet</div>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart icon on any product.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/shop">Browse products</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="hover-lift overflow-hidden rounded-3xl border bg-card"
            >
              <Link to="/product/$slug" params={{ slug: it.product?.slug || "" }}>
                <img
                  src={it.product?.images?.[0]}
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.product?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(Number(it.product?.price || 0))}
                    </div>
                  </div>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={() => add(it.product_id)}
                  className="mt-4 w-full rounded-full"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
