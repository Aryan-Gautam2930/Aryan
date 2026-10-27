import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, HelpCircle, LayoutDashboard, LogOut, Search, UserCog, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LANGS, useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReminderWatcher } from "@/components/ReminderWatcher";
import logo from "@/assets/chw-helper.png";

export function AppShell() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");

  const nav = [
    { to: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { to: "/patients", label: t.patients, icon: Users },
    { to: "/reminders", label: t.reminders, icon: Bell },
    { to: "/help", label: t.help, icon: HelpCircle },
    { to: "/settings", label: t.settings, icon: UserCog },
  ] as const;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/patients", search: { q: q.trim() || undefined } });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:p-2">Skip to content</a>
      <header className="sticky top-0 z-30 px-3 pt-3 md:px-6">
        <div className="glass mx-auto flex max-w-6xl flex-wrap items-center gap-3 rounded-2xl px-3 py-2 md:flex-nowrap md:px-4">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2 rounded-lg">
            <img src={logo} alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-accent object-cover object-top" />
            <span className="font-display text-base font-semibold leading-tight md:text-lg">{t.appName}</span>
          </Link>
          <form onSubmit={onSearch} role="search" className="order-3 flex w-full items-center gap-2 md:order-none md:ml-4 md:flex-1">
            <label htmlFor="global-search" className="sr-only">{t.searchPlaceholder}</label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="global-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} className="h-10 rounded-xl bg-card pl-9" />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-1">
            <label htmlFor="lang" className="sr-only">{t.language}</label>
            <select id="lang" value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="h-10 rounded-xl border bg-card px-2 text-sm">
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label={t.signOut} title={t.signOut}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
        <nav aria-label="Main" className="mx-auto mt-2 hidden max-w-6xl gap-1 md:flex">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/80 hover:bg-card"}`}>
                <n.icon className="h-4 w-4" aria-hidden />{n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-3 py-5 md:px-6">
        <Outlet />
      </main>
      <ReminderWatcher />

      <nav aria-label="Main" className="glass fixed inset-x-2 bottom-2 z-30 grid grid-cols-5 rounded-2xl p-1 md:hidden" style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}>
        {nav.map((n) => {
          const active = path.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium leading-tight ${active ? "bg-primary text-primary-foreground" : "text-foreground/80"}`}>
              <n.icon className="h-5 w-5" aria-hidden />
              <span className="line-clamp-1 text-center">{n.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}