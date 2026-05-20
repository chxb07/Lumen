import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Check } from "lucide-react";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";
import { formatPrice, formatDate, optimizeUnsplashUrl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = useParams({ from: "/product/$slug" });
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const { user } = useAuth();
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);
  const [tab, setTab] = React.useState<"desc" | "shipping" | "reviews">("desc");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      return data as (Product & { category: any }) | null;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id)
        .limit(4);
      return (data as Product[]) || [];
    },
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profile:profiles(full_name, avatar_url)")
        .eq("product_id", product!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-20">Loading…</div>;
  if (!product)
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="font-display text-3xl font-semibold">Not found</div>
        <Link to="/shop" className="mt-4 inline-block text-primary underline">
          Back to shop
        </Link>
      </div>
    );

  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const isWished = ids.has(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> ·{" "}
        <Link to="/shop" className="hover:text-foreground">Shop</Link> · {product.name}
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <motion.div
            key={imgIdx}
            initial={{ opacity: 0.5, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border bg-secondary"
          >
            <img
              src={optimizeUnsplashUrl(product.images[imgIdx] || product.images[0], 800)}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`overflow-hidden rounded-xl border-2 ${
                    i === imgIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={optimizeUnsplashUrl(src, 150)}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.tags?.includes("new") && (
            <span className="inline-block rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase text-background">
              New
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {Number(product.rating).toFixed(1)}
            </div>
            <span>·</span>
            <span>{product.review_count} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <div className="font-display text-3xl font-bold">{formatPrice(product.price)}</div>
            {onSale && (
              <div className="text-lg text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </div>
            )}
            {onSale && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                Save {Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}%
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 text-lg">
                −
              </button>
              <div className="min-w-[2ch] px-2 text-center font-medium">{qty}</div>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 text-lg">
                +
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full"
              onClick={() => add(product.id, qty)}
              disabled={product.stock <= 0}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {product.stock <= 0 ? "Sold out" : "Add to cart"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => toggle(product.id)}
            >
              <Heart className={`h-4 w-4 ${isWished ? "fill-destructive text-destructive" : ""}`} />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            {[
              [Truck, "Free shipping $75+"],
              [Shield, "Secure checkout"],
              [RotateCcw, "30-day returns"],
            ].map(([I, t]: any, i) => (
              <div key={i} className="rounded-2xl border bg-card p-3">
                <I className="mb-1 h-4 w-4 text-primary" />
                <div>{t}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-b">
            {(["desc", "shipping", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  tab === t ? "border-b-2 border-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "desc" ? "Description" : t}
              </button>
            ))}
          </div>
          <div className="prose prose-sm mt-4 max-w-none text-sm text-muted-foreground">
            {tab === "desc" && <p>{product.description}</p>}
            {tab === "shipping" && (
              <ul className="space-y-2">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Free shipping on orders over $75</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Ships within 1–2 business days</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 30-day hassle-free returns</li>
              </ul>
            )}
            {tab === "reviews" && (
              <ReviewSection
                productId={product.id}
                reviews={reviews || []}
                refetch={refetchReviews}
                canReview={!!user}
              />
            )}
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewSection({
  productId,
  reviews,
  refetch,
  canReview,
}: {
  productId: string;
  reviews: any[];
  refetch: () => void;
  canReview: boolean;
}) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const { user } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { product_id: productId, user_id: user.id, rating, comment },
      { onConflict: "product_id,user_id" }
    );
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Review posted");
      setComment("");
      refetch();
    }
  };

  return (
    <div>
      {canReview ? (
        <form onSubmit={submit} className="mb-6 rounded-2xl border bg-card p-4">
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star
                  className={`h-5 w-5 ${
                    n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your experience…"
            className="w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" disabled={submitting} className="mt-2 rounded-full">
            {submitting ? "Posting…" : "Post review"}
          </Button>
        </form>
      ) : (
        <div className="mb-6 rounded-xl border bg-card p-3 text-xs text-muted-foreground">
          <Link to="/auth/login" className="text-primary underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </div>
      )}
      <div className="space-y-3">
        {reviews.length === 0 && <p>No reviews yet. Be the first!</p>}
        {reviews.map((r: any) => (
          <div key={r.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                {r.profile?.full_name || "Customer"}
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
            </div>
            <div className="mt-1 flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
