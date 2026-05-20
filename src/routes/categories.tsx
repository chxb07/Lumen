import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/categories")({ component: Categories });

const COVERS: Record<string, string> = {
  apparel: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&q=80",
  home: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80",
};

function Categories() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return (data as Category[]) || [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Shop by category</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Curated collections of premium goods, organized by what you're looking for.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(data || []).map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to="/shop"
              search={{ category: c.slug } as any}
              className="hover-lift group relative block aspect-[4/3] overflow-hidden rounded-3xl"
            >
              <img
                src={COVERS[c.slug] || COVERS.apparel}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="font-display text-2xl font-bold">{c.name}</div>
                <div className="mt-1 text-sm text-white/80">{c.description}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
