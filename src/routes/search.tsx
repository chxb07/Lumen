import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import * as React from "react";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  component: Search,
});

function Search() {
  const { q } = Route.useSearch();
  const [v, setV] = React.useState(q || "");
  React.useEffect(() => setV(q || ""), [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    enabled: !!q,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .eq("is_active", true)
        .limit(40);
      return (data as Product[]) || [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Search</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v.trim()) window.location.href = `/search?q=${encodeURIComponent(v)}`;
        }}
        className="mt-6"
      >
        <div className="relative max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </form>

      {q ? (
        <>
          <div className="mt-6 text-sm text-muted-foreground">
            {isLoading ? "Searching…" : `${data?.length || 0} results for "${q}"`}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (data || []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          {!isLoading && data && data.length === 0 && (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              No results. <Link to="/shop" className="text-primary underline">Browse all products</Link>.
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Type to search the catalog.</p>
      )}
    </div>
  );
}
