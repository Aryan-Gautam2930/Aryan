import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common";
import helper from "@/assets/chw-helper.png";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Record System for CHW" },
      { name: "description", content: "Sign in or create your Record System for CHW account." },
      { property: "og:title", content: "Sign in — Record System for CHW" },
      { property: "og:description", content: "Sign in or create your account to manage patient visits." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const isUp = mode === "signup";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = (isUp ? signUpSchema : signInSchema).safeParse(f);
    if (!r.success) {
      const o: Record<string, string> = {};
      r.error.issues.forEach((i) => (o[String(i.path[0])] ??= i.message));
      setErrs(o);
      return;
    }
    setErrs({});
    setBusy(true);
    try {
      if (isUp) {
        const { data, error } = await supabase.auth.signUp({
          email: f.email.trim(), password: f.password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: f.name.trim() } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setMsg({ kind: "info", text: t.checkEmail });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="glass w-full max-w-md rounded-3xl p-6 md:p-8">
        <Link to="/" className="mb-4 flex items-center gap-3">
          <img src={helper} alt="" width={56} height={56} className="h-14 w-14 rounded-full bg-accent object-cover object-top" />
          <span className="font-display text-xl font-semibold">{t.appName}</span>
        </Link>
        <h1 className="text-2xl font-semibold">{isUp ? t.signUp : t.signIn}</h1>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {isUp && (
            <div>
              <Label htmlFor="name">{t.name}</Label>
              <Input id="name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!errs.name} />
              <FieldError msg={errs.name} />
            </div>
          )}
          <div>
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!errs.email} />
            <FieldError msg={errs.email} />
          </div>
          <div>
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" autoComplete={isUp ? "new-password" : "current-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} aria-invalid={!!errs.password} />
            <FieldError msg={errs.password} />
          </div>
          {msg && (
            <p role={msg.kind === "error" ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${msg.kind === "error" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>{msg.text}</p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{isUp ? t.signUp : t.signIn}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isUp ? t.haveAccount : t.noAccount}{" "}
          <Link to="/auth" search={{ mode: isUp ? "signin" : "signup" }} className="font-semibold text-primary underline-offset-4 hover:underline">
            {isUp ? t.signIn : t.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}