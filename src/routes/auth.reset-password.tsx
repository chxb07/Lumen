import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthShell, Input } from "./auth.login";

export const Route = createFileRoute("/auth/reset-password")({ component: Reset });

function Reset() {
  const nav = useNavigate();
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Min 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={submit} className="space-y-3">
        <Input label="New password" type="password" v={password} on={setPassword} />
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
