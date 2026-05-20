import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthShell, Input } from "./auth.login";

export const Route = createFileRoute("/auth/forgot")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your inbox for a reset link");
  };

  return (
    <AuthShell title="Reset your password" sub="We'll email you a secure link">
      <form onSubmit={submit} className="space-y-3">
        <Input label="Email" type="email" v={email} on={setEmail} />
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
