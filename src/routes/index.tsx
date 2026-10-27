import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, ShieldCheck, Languages, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, LANGS } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import helper from "@/assets/chw-helper.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Record System for CHW — Patient visit log & reminders" },
      { name: "description", content: "A calm, simple patient visit log and follow-up reminder tool for community health workers, in English, Hindi and Marathi." },
      { property: "og:title", content: "Record System for CHW" },
      { property: "og:description", content: "Patient visit log and follow-up reminders for community health workers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/dashboard", replace: true }); });
  }, [navigate]);

  const features = [
    { icon: ClipboardList, text: t.patients },
    { icon: Bell, text: t.reminders },
    { icon: Languages, text: "English · हिन्दी · मराठी" },
    { icon: ShieldCheck, text: t.settings },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-6">
      <div className="flex justify-end">
        <label htmlFor="lang-l" className="sr-only">{t.language}</label>
        <select id="lang-l" value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="glass h-10 rounded-xl px-3 text-sm">
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>
      <main className="grid flex-1 items-center gap-8 py-8 md:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">CHW · ASHA · ANM</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{t.appName}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>{t.signUp}</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-card"><Link to="/auth" search={{ mode: "signin" }}>{t.signIn}</Link></Button>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-2">
            {features.map((f) => (
              <li key={f.text} className="glass flex items-center gap-2 rounded-xl p-3 text-sm"><f.icon className="h-4 w-4 text-primary" aria-hidden />{f.text}</li>
            ))}
          </ul>
        </div>
        <div className="glass relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem]">
          <img src={helper} alt="Friendly community health worker with a clipboard" width={816} height={816} className="h-full w-full object-contain p-4" />
        </div>
      </main>
      <p className="text-center text-xs text-muted-foreground">{t.disclaimer}</p>
    </div>
  );
}