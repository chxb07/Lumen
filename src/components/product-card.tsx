import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const isWished = ids.has(product.id);
  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.2, 0.8, 0.2, 1] }}
      className="group hover-lift relative overflow-hidden rounded-3xl border bg-card"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.images[0] || "https://placehold.co/600x750"}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {product.tags?.includes("new") && (
              <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
                New
              </span>
            )}
            {onSale && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                Sale
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWished ? "fill-destructive text-destructive" : ""}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              add(product.id, 1);
            }}
            className="absolute bottom-3 left-3 right-3 flex translate-y-12 items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-sm font-medium text-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{product.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(product.rating).toFixed(1)} · {product.review_count}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{formatPrice(product.price)}</div>
              {onSale && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(Number(product.compare_at_price))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
