import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, Heart, User, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashLayout });

function DashLayout() {
  const { user, signOut, loading } = useAuth();

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20">Loading…</div>;
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold">Sign in required</div>
        <Button asChild className="mt-6 rounded-full"><Link to="/auth/login">Sign in</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold">My account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {[
            ["/dashboard", "Overview", LayoutDashboard],
            ["/dashboard/orders", "Orders", Package],
            ["/wishlist", "Wishlist", Heart],
            ["/dashboard/profile", "Profile", User],
          ].map(([to, label, I]: any) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary"
              activeOptions={{ exact: to === "/dashboard" }}
              activeProps={{ className: "flex items-center gap-3 rounded-xl px-3 py-2 text-sm bg-secondary font-medium" }}
            >
              <I className="h-4 w-4" /> {label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
