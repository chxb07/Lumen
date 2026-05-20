import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setName(data.full_name || "");
        setPhone(data.phone || "");
      }
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim().slice(0, 100), phone: phone.trim().slice(0, 30) })
      .eq("id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <form onSubmit={save} className="max-w-md space-y-4 rounded-3xl border bg-card p-6">
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">Full name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">Phone</div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">Email</div>
        <input disabled value={user?.email || ""} className="w-full rounded-xl border bg-secondary px-3 py-2.5 text-sm text-muted-foreground" />
      </div>
      <Button type="submit" disabled={loading} className="rounded-full">
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
