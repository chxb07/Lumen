import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { CartItem, Product } from "@/lib/types";
import { toast } from "sonner";

type CartCtx = {
  items: (CartItem & { product: Product })[];
  count: number;
  subtotal: number;
  loading: boolean;
  add: (productId: string, qty?: number) => Promise<void>;
  update: (id: string, qty: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = React.createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<(CartItem & { product: Product })[]>([]);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("user_id", user.id);
    setItems((data as any) || []);
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    await refresh();
  };

  const update = async (id: string, qty: number) => {
    if (qty <= 0) {
      await remove(id);
      return;
    }
    const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    if (error) toast.error(error.message);
    await refresh();
  };

  const add = async (productId: string, qty = 1) => {
    if (!user) {
      toast.error("Sign in to add to cart");
      return;
    }
    const existing = items.find((i) => i.product_id === productId && !i.variant_id);
    if (existing) {
      await update(existing.id, existing.quantity + qty);
      return;
    }
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: qty });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Added to cart");
    await refresh();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const subtotal = items.reduce((a, b) => a + Number(b.product?.price || 0) * b.quantity, 0);

  return (
    <Ctx.Provider value={{ items, count, subtotal, loading, add, update, remove, clear, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => React.useContext(Ctx);
