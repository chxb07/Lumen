import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({ component: Contact });

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return toast.error("Please fill all fields correctly");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Message sent — we'll be in touch within 24h");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-bold">Let's talk.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions, partnerships, or feedback — we read every message and respond within 24h.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> hello@lumen.shop</li>
            <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Live chat in your dashboard</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Stockholm · New York</li>
          </ul>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-3xl border bg-card p-6">
          <Field label="Name" v={form.name} on={(v) => setForm({ ...form, name: v })} />
          <Field label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
          <label className="block">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Message</div>
            <textarea
              required rows={5} maxLength={1000} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, v, on, type = "text" }: { label: string; v: string; on: (s: string) => void; type?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <input
        required type={type} value={v} onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
