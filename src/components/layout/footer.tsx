import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Github, Mail } from "lucide-react";
import shoppingIcon from "@/shopping.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <img src={shoppingIcon} alt="Lumen Logo" className="h-6 w-6 object-contain" />
            <div className="font-display text-xl font-bold gradient-text">Lumen</div>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Premium goods, designed without compromise. Crafted to last, priced to live with.
          </p>
          <div className="mt-6 flex gap-2">
            {[Instagram, Twitter, Github, Mail].map((I, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border bg-card transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            h: "Shop",
            links: [
              ["All", "/shop"],
              ["Categories", "/categories"],
              ["New arrivals", "/shop?sort=new"],
              ["Sale", "/shop?sort=sale"],
            ],
          },
          {
            h: "Account",
            links: [
              ["Sign in", "/auth/login"],
              ["Dashboard", "/dashboard"],
              ["Orders", "/dashboard/orders"],
              ["Wishlist", "/wishlist"],
            ],
          },
          {
            h: "Company",
            links: [
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Track order", "/track"],
              ["Privacy", "#"],
            ],
          },
        ].map((c) => (
          <div key={c.h}>
            <div className="mb-3 text-sm font-semibold">{c.h}</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div>© {new Date().getFullYear()} Lumen. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
