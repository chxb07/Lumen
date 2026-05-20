import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";

const search = z.object({
  category: z.string().optional(),
  sort: z.enum(["new", "price-asc", "price-desc", "rating", "sale"]).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  component: Shop,
});

function Shop() {
  const params = Route.useSearch();
  const nav = useNavigate({ from: "/shop" });
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<[number, number]>([params.min ?? 0, params.max ?? 600]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return (data as Category[]) || [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop", params],
    queryFn: async () => {
      let q = supabase.from("products").select("*, category:categories(slug)").eq("is_active", true);

      if (params.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", params.category)
          .maybeSingle();
        if (cat) q = q.eq("category_id", (cat as any).id);
      }
      if (params.min != null) q = q.gte("price", params.min);
      if (params.max != null) q = q.lte("price", params.max);
      if (params.q) q = q.ilike("name", `%${params.q}%`);
      if (params.sort === "sale") q = q.not("compare_at_price", "is", null);

      switch (params.sort) {
        case "new":
          q = q.order("created_at", { ascending: false });
          break;
        case "price-asc":
          q = q.order("price", { ascending: true });
          break;
        case "price-desc":
          q = q.order("price", { ascending: false });
          break;
        case "rating":
          q = q.order("rating", { ascending: false });
          break;
        default:
          q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }
      const { data } = await q;
      return (data as Product[]) || [];
    },
  });

  const setParam = (next: Partial<typeof params>) =>
    nav({ search: { ...params, ...next } as any });

  const activeCat = categories?.find((c) => c.slug === params.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <div className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> · Shop
          {activeCat && <> · {activeCat.name}</>}
        </div>
        <h1 className="font-display text-4xl font-bold">
          {activeCat?.name ? activeCat.name : params.q ? `"${params.q}"` : "All products"}
        </h1>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam({ category: undefined })}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
              !params.category ? "bg-foreground text-background" : "hover:bg-secondary"
            }`}
          >
            All
          </button>
          {(categories || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setParam({ category: c.slug })}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
                params.category === c.slug ? "bg-foreground text-background" : "hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="rounded-full">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
          </Button>
          <select
            value={params.sort || ""}
            onChange={(e) => setParam({ sort: (e.target.value || undefined) as any })}
            className="rounded-full border bg-background px-4 py-1.5 text-xs font-medium"
          >
            <option value="">Sort: Featured</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top rated</option>
            <option value="sale">On sale</option>
          </select>
        </div>
      </div>

      {open && (
        <div className="mt-4 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Price range</div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={range}
              onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
              onValueCommit={(v) => setParam({ min: v[0], max: v[1] })}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>${range[0]}</span>
              <span>${range[1]}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : (products || []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {!isLoading && products && products.length === 0 && (
        <div className="mt-20 text-center">
          <div className="font-display text-2xl font-semibold">No products match</div>
          <p className="mt-2 text-sm text-muted-foreground">Try removing some filters.</p>
        </div>
      )}
    </div>
  );
}
