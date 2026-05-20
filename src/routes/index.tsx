import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Truck, Headphones, Star, Flame, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { toast } from "sonner";
import { optimizeUnsplashUrl } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(8);
      return (data as Product[]) || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return (data as Category[]) || [];
    },
  });

  const { data: sale } = useQuery({
    queryKey: ["sale"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .not("compare_at_price", "is", null)
        .eq("is_active", true)
        .limit(4);
      return (data as Product[]) || [];
    },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              New season collection just dropped
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Modern goods,<br />
              <span className="gradient-text">crafted to last.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              Discover thoughtfully designed essentials from independent makers and iconic brands —
              shipped fast, priced fair.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/categories">Browse categories</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-muted-foreground">
              {([
                { I: Shield, t: "Secure checkout" },
                { I: Truck, t: "Free shipping over $75" },
                { I: Headphones, t: "24/7 support" },
              ] as const).map(({ I, t }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <I className="h-4 w-4 text-primary" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border bg-card soft-shadow">
              <img
                src={optimizeUnsplashUrl("https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80", 800)}
                alt="Hero"
                className="h-full w-full object-cover"
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-6 left-6 glass rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 · Trusted by 50k+
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                className="absolute right-6 top-6 glass rounded-2xl px-4 py-3"
              >
                <div className="text-[10px] uppercase text-muted-foreground">Free shipping</div>
                <div className="text-sm font-semibold">Over $75</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">Explore</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Trending categories</h2>
          </div>
          <Link to="/categories" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {(categories || []).slice(0, 5).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/shop"
                search={{ category: c.slug } as any}
                className="hover-lift group block aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-accent/15 p-6"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="font-display text-xl font-bold">{c.name}</div>
                  <div className="self-end text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    Shop →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">Bestsellers</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Featured products</h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">
            All products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (featured || []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-fuchsia-600 to-accent p-8 text-primary-foreground md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                <Flame className="h-3 w-3" /> Flash Sale
              </div>
              <h3 className="mt-3 font-display text-3xl font-bold md:text-5xl">Up to 30% off</h3>
              <p className="mt-3 max-w-md text-white/80">
                Limited drop — selected pieces are marked down through the weekend.
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-6 rounded-full">
                <Link to="/shop">Shop the sale</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(sale || []).slice(0, 4).map((p) => (
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  key={p.id}
                  className="group overflow-hidden rounded-2xl bg-white/10 backdrop-blur"
                >
                  <img
                    src={optimizeUnsplashUrl(p.images[0], 400)}
                    alt={p.name}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Loved by thousands</div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">What our customers say</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              q: "Genuinely the best ecommerce experience I've had in years. Fast, beautiful, and the products feel premium.",
              n: "Maya R.",
              r: "Verified buyer",
            },
            {
              q: "I order from Lumen monthly. Quality is unreal, and shipping is always on point.",
              n: "Theo K.",
              r: "Verified buyer",
            },
            {
              q: "Their attention to detail — packaging, follow-up emails, returns — it's at another level.",
              n: "Priya S.",
              r: "Verified buyer",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass soft-shadow rounded-3xl p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.q}"</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t.n}</span> · {t.r}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BRAND PARTNERS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card/60 p-8">
          <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by the brands you love
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {["AETHER", "HALO", "LUMEN", "ATLAS", "VISTA", "ORBIT"].map((b) => (
              <div key={b} className="font-display text-lg font-bold tracking-widest">
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = React.useState("");
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass soft-shadow grid gap-6 rounded-3xl p-8 md:grid-cols-2 md:items-center md:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Mail className="h-3 w-3" /> Newsletter
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold">Join the inner circle</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Early drops, exclusive deals, and zero spam. Unsubscribe anytime.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) {
              toast.error("Enter a valid email");
              return;
            }
            toast.success("Welcome aboard ✨");
            setEmail("");
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="flex-1 rounded-full border border-input bg-background px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" className="rounded-full">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
