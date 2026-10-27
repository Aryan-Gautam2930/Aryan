import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Search } from "lucide-react";
import { z } from "zod";
import { patientsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, ErrorState, GlassCard, Loading, PageTitle, fmtDate } from "@/components/common";
import helper from "@/assets/chw-helper.png";

export const Route = createFileRoute("/_authenticated/patients/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [{ title: "Patients — Record System for CHW" }, { name: "description", content: "Search and manage patient records." }] }),
  component: Patients,
});

function Patients() {
  const { t, lang } = useI18n();
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/patients/" });
  const { data, isLoading, isError, refetch } = useQuery(patientsQuery());
  const needle = q.trim().toLowerCase();
  const list = (data ?? []).filter((p) => !needle || p.full_name.toLowerCase().includes(needle));
  const sexLabel = { female: t.female, male: t.male, other: t.other, prefer_not_to_say: t.preferNot } as Record<string, string>;

  return (
    <div>
      <PageTitle action={<Button asChild><Link to="/patients/new"><Plus className="h-4 w-4" />{t.addPatient}</Link></Button>}>{t.patients}</PageTitle>
      <GlassCard>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="psearch" className="sr-only">{t.searchPlaceholder}</label>
          <Input id="psearch" value={q} placeholder={t.searchPlaceholder} className="h-11 bg-card pl-9"
            onChange={(e) => navigate({ search: { q: e.target.value || undefined }, replace: true })} />
        </div>
        {isLoading ? <Loading /> : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? (
          <Empty image={helper}><p>{t.noPatients}</p><Button asChild><Link to="/patients/new">{t.addPatient}</Link></Button></Empty>
        ) : !list.length ? <Empty>{t.noResults}</Empty> : (
          <ul className="divide-y">
            {list.map((p) => (
              <li key={p.id}>
                <Link to="/patients/$id" params={{ id: p.id }} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-card">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-semibold text-primary-foreground">{p.full_name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sexLabel[p.sex]}{p.age != null ? ` · ${p.age}` : ""}{p.blood_group ? ` · ${p.blood_group}` : ""} · {p.visits.length} {t.visits}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">{p.lastVisit ? `${t.lastVisit}: ${fmtDate(p.lastVisit, lang)}` : ""}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}