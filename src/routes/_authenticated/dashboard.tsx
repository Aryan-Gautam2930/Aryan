import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarDays, Plus, Users } from "lucide-react";
import { patientsQuery, profileQuery, recentVisitsQuery, remindersQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { splitReminders } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { ErrorState, Empty, GlassCard, Loading, fmtDate, fmtDateTime } from "@/components/common";
import helper from "@/assets/chw-helper.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Record System for CHW" }, { name: "description", content: "Overview of patients, visits and reminders." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const profile = useQuery(profileQuery());
  const patients = useQuery(patientsQuery());
  const visits = useQuery(recentVisitsQuery());
  const reminders = useQuery(remindersQuery());

  const monthStart = new Date(); monthStart.setDate(1);
  const monthKey = monthStart.toLocaleDateString("en-CA").slice(0, 7);
  const visitsThisMonth = visits.data?.filter((v) => v.visit_date.startsWith(monthKey)).length;
  const upcoming = reminders.data ? splitReminders(reminders.data).upcoming : [];

  const stats = [
    { label: t.totalPatients, value: patients.data?.length, icon: Users, to: "/patients" as const },
    { label: t.visitsMonth, value: visitsThisMonth, icon: CalendarDays, to: "/patients" as const },
    { label: t.upcomingReminders, value: reminders.data ? upcoming.length : undefined, icon: Bell, to: "/reminders" as const },
  ];

  if (patients.isError || visits.isError) return <ErrorState onRetry={() => { patients.refetch(); visits.refetch(); }} />;

  return (
    <div className="space-y-5">
      <GlassCard className="flex items-center gap-4 overflow-hidden">
        <img src={helper} alt="" width={96} height={96} className="hidden h-24 w-24 rounded-full bg-accent object-cover object-top sm:block" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold md:text-3xl">{t.dashboard}{profile.data?.full_name ? ` · ${profile.data.full_name}` : ""}</h1>
          <p className="text-sm text-muted-foreground">{t.tagline}</p>
        </div>
        <Button asChild><Link to="/patients/new"><Plus className="h-4 w-4" />{t.addPatient}</Link></Button>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="glass group rounded-2xl p-4 transition hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="rounded-full bg-accent p-2 text-accent-foreground"><s.icon className="h-4 w-4" aria-hidden /></span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{t.recentVisits}</h2><Link to="/patients" className="text-sm text-primary">{t.viewAll}</Link></div>
          {visits.isLoading ? <Loading /> : !visits.data?.length ? <Empty image={helper}>{t.noVisits}</Empty> : (
            <ul className="divide-y">
              {visits.data.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <Link to="/patients/$id" params={{ id: v.patient_id }} className="flex items-start justify-between gap-3 rounded-lg px-1 py-3 hover:bg-card">
                    <div className="min-w-0"><p className="font-medium">{v.patients?.full_name}</p><p className="truncate text-sm text-muted-foreground">{v.symptoms}</p></div>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(v.visit_date, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
        <GlassCard>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{t.upcomingReminders}</h2><Link to="/reminders" className="text-sm text-primary">{t.viewAll}</Link></div>
          {reminders.isLoading ? <Loading /> : !upcoming.length ? <Empty>{t.noReminders}</Empty> : (
            <ul className="divide-y">
              {upcoming.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                  <div><p className="font-medium">{r.title}</p>{r.patients && <p className="text-sm text-muted-foreground">{r.patients.full_name}</p>}</div>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(r.due_at, lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
      <p className="text-center text-xs text-muted-foreground">{t.disclaimer}</p>
    </div>
  );
}