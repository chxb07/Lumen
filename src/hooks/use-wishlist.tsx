import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { Product, WishlistItem } from "@/lib/types";
import { toast } from "sonner";

type WishCtx = {
  items: (WishlistItem & { product: Product })[];
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = React.createContext<WishCtx>({} as WishCtx);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<(WishlistItem & { product: Product })[]>([]);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data } = await supabase
      .from("wishlist_items")
      .select("*, product:products(*)")
      .eq("user_id", user.id);
    setItems((data as any) || []);
  }, [user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (productId: string) => {
    if (!user) {
      toast.error("Sign in to save items");
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase.from("wishlist_items").delete().eq("id", existing.id);
      toast.success("Removed from wishlist");
    } else {
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Saved to wishlist");
    }
    await refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("wishlist_items").delete().eq("id", id);
    await refresh();
  };

  const ids = new Set(items.map((i) => i.product_id));
  return <Ctx.Provider value={{ items, ids, toggle, remove, refresh }}>{children}</Ctx.Provider>;
}

export const useWishlist = () => React.useContext(Ctx);
