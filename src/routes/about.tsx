import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Heart, Leaf } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">About</div>
        <h1 className="mt-2 font-display text-5xl font-bold">Premium goods, designed without compromise.</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Lumen is a modern marketplace built around one idea: well-made things, sold simply. We
          partner with independent makers and iconic brands to bring you essentials that last —
          shipped fast, priced fair.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          { I: Sparkles, t: "Curated", d: "Every product hand-picked for craft and longevity." },
          { I: Heart, t: "Human", d: "Real people behind support, packing, and follow-up." },
          { I: Leaf, t: "Conscious", d: "Carbon-aware shipping and responsible sourcing." },
        ].map((c) => (
          <div key={c.t} className="rounded-3xl border bg-card p-6">
            <c.I className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-xl font-semibold">{c.t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border bg-card p-8">
        <h2 className="font-display text-2xl font-bold">Our promise</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          If something doesn't feel right, we make it right. 30-day returns. Lifetime support on
          everything we sell. No fine print, no run-around — just a relationship that lasts as
          long as the goods do.
        </p>
      </div>
    </div>
  );
}
