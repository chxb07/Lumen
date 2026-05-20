import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthShell, Input } from "./auth.login";

export const Route = createFileRoute("/auth/register")({ component: Register });

const schema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function Register() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return toast.error("Please fill all fields correctly");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: p.data.email,
      password: p.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: p.data.full_name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your inbox to verify your email");
    nav({ to: "/auth/login" });
  };

  return (
    <AuthShell title="Create your account" sub="Join Lumen in less than a minute">
      <form onSubmit={submit} className="space-y-3">
        <Input label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} />
        <Input label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
        <Input label="Password" type="password" v={form.password} on={(v) => setForm({ ...form, password: v })} />
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
