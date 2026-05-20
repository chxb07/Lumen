import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/auth/login")({ component: Login });

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error("Invalid email or password");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    nav({ to: "/" });
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to your account">
      <Button variant="outline" type="button" onClick={google} className="w-full rounded-full">
        Continue with Google
      </Button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Email" type="email" v={email} on={setEmail} />
        <Input label="Password" type="password" v={password} on={setPassword} />
        <div className="text-right">
          <Link to="/auth/forgot" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-8 text-center font-display text-2xl font-bold gradient-text">Lumen</Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass soft-shadow rounded-3xl p-8"
        >
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
          <div className="mt-6">{children}</div>
        </motion.div>
        <Link to="/" className="mt-6 text-center text-xs text-muted-foreground hover:text-foreground">
          ← Back to store
        </Link>
      </div>
    </div>
  );
}

export function Input({
  label, v, on, type = "text",
}: { label: string; v: string; on: (s: string) => void; type?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <input
        required type={type} value={v} onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
