import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard, Loading, PageTitle } from "@/components/common";
import { SubmitRow } from "@/components/forms";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile & Settings — Record System for CHW" }, { name: "description", content: "Your profile and preferences." }] }),
  component: Settings,
});

function Settings() {
  const { t, setLang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(profileQuery());
  const [name, setName] = useState("");
  const [pl, setPl] = useState<Lang>("en");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) { setName(data.full_name); setPl(data.preferred_language as Lang); } }, [data]);
  if (isLoading || !data) return <Loading />;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length > 100) return toast.error("Name is required");
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: data.id, full_name: name.trim(), preferred_language: pl });
    setBusy(false);
    if (error) return toast.error(error.message);
    setLang(pl); toast.success(t.profileSaved); qc.invalidateQueries({ queryKey: ["profile"] });
  };
  return (
    <div className="space-y-4">
      <PageTitle>{t.settings}</PageTitle>
      <GlassCard>
        <form onSubmit={submit} className="grid max-w-md gap-4">
          <div><Label htmlFor="sn">{t.name}</Label><Input id="sn" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label htmlFor="se">{t.email}</Label><Input id="se" value={data.email} disabled /></div>
          <div><Label htmlFor="sl">{t.preferredLanguage}</Label>
            <select id="sl" className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" value={pl} onChange={(e) => setPl(e.target.value as Lang)}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <SubmitRow busy={busy} />
        </form>
      </GlassCard>
      <GlassCard className="text-sm text-muted-foreground">{t.helpTopics[3].b}</GlassCard>
    </div>
  );
}