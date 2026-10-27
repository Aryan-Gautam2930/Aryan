import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { patientQuery, type Patient, type Visit } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete, Empty, ErrorState, GlassCard, Loading, fmtDate } from "@/components/common";
import { PatientFields, SubmitRow, VisitFields, emptyVisit, patientPayload, usePatientForm, useVisitForm, visitPayload, type PatientValues } from "@/components/forms";

export const Route = createFileRoute("/_authenticated/patients/$id")({
  head: () => ({ meta: [{ title: "Patient record — Record System for CHW" }, { name: "description", content: "Patient details and visit history." }] }),
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery(patientQuery(id));
  const [editP, setEditP] = useState(false);
  const [visitEdit, setVisitEdit] = useState<Visit | "new" | null>(null);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data?.patient) return <Empty>{t.noResults} <Link to="/patients" className="text-primary">{t.patients}</Link></Empty>;
  const p = data.patient;
  const sexLabel = { female: t.female, male: t.male, other: t.other, prefer_not_to_say: t.preferNot } as Record<string, string>;

  const delPatient = async () => {
    const { error } = await supabase.from("patients").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(t.deleted); qc.invalidateQueries(); navigate({ to: "/patients" });
  };
  const delVisit = async (vid: string) => {
    const { error } = await supabase.from("visits").delete().eq("id", vid);
    if (error) return toast.error(error.message);
    toast.success(t.deleted); qc.invalidateQueries();
  };

  const facts = [
    [t.sex, sexLabel[p.sex]], [t.age, p.age ?? "—"], [t.dob, p.date_of_birth ? fmtDate(p.date_of_birth, lang) : "—"], [t.bloodGroup, p.blood_group ?? t.unknown],
  ];

  return (
    <div className="space-y-4">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" />{t.patients}</Link>
      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold md:text-3xl">{p.full_name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditP(true)}><Pencil className="h-4 w-4" />{t.edit}</Button>
            <ConfirmDelete onConfirm={delPatient} />
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(([k, v]) => (<div key={String(k)} className="rounded-xl bg-card p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>))}
        </dl>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.visitHistory} ({data.visits.length})</h2>
          <Button size="sm" onClick={() => setVisitEdit("new")}><Plus className="h-4 w-4" />{t.addVisit}</Button>
        </div>
        {!data.visits.length ? <Empty>{t.noVisits}</Empty> : (
          <ol className="space-y-3">
            {data.visits.map((v) => (
              <li key={v.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{fmtDate(v.visit_date, lang)}{v.weight_kg != null && <span className="ml-2 text-sm font-normal text-muted-foreground">{v.weight_kg} kg</span>}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setVisitEdit(v)}>{t.edit}</Button>
                    <ConfirmDelete onConfirm={() => delVisit(v.id)} />
                  </div>
                </div>
                <dl className="mt-2 space-y-2 text-sm">
                  <div><dt className="text-xs text-muted-foreground">{t.symptoms}</dt><dd className="whitespace-pre-wrap">{v.symptoms}</dd></div>
                  {v.advice && <div><dt className="text-xs text-muted-foreground">{t.advice}</dt><dd className="whitespace-pre-wrap">{v.advice}</dd></div>}
                  {v.follow_up_notes && <div><dt className="text-xs text-muted-foreground">{t.followUp}</dt><dd className="whitespace-pre-wrap">{v.follow_up_notes}</dd></div>}
                </dl>
              </li>
            ))}
          </ol>
        )}
      </GlassCard>

      <Dialog open={editP} onOpenChange={setEditP}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t.editPatient}</DialogTitle></DialogHeader>
          {editP && <EditPatient p={p} onDone={() => setEditP(false)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!visitEdit} onOpenChange={(o) => !o && setVisitEdit(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{visitEdit === "new" ? t.addVisit : t.edit}</DialogTitle></DialogHeader>
          {visitEdit && <VisitEditor patientId={p.id} visit={visitEdit === "new" ? null : visitEdit} onDone={() => setVisitEdit(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditPatient({ p, onDone }: { p: Patient; onDone: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const f = usePatientForm({ full_name: p.full_name, sex: p.sex as PatientValues["sex"], age: p.age?.toString() ?? "", date_of_birth: p.date_of_birth ?? "", blood_group: p.blood_group ?? "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!f.validate()) return;
    setBusy(true);
    const { error } = await supabase.from("patients").update(patientPayload(f.v)).eq("id", p.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved); qc.invalidateQueries(); onDone();
  };
  return <form onSubmit={submit} noValidate><PatientFields v={f.v} set={f.set} e={f.e} /><SubmitRow busy={busy} onCancel={onDone} /></form>;
}

function VisitEditor({ patientId, visit, onDone }: { patientId: string; visit: Visit | null; onDone: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const f = useVisitForm(visit ? { visit_date: visit.visit_date, weight_kg: visit.weight_kg?.toString() ?? "", symptoms: visit.symptoms, advice: visit.advice, follow_up_notes: visit.follow_up_notes ?? "" } : emptyVisit());
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!f.validate()) return;
    setBusy(true);
    const { error } = visit
      ? await supabase.from("visits").update(visitPayload(f.v)).eq("id", visit.id)
      : await supabase.from("visits").insert({ ...visitPayload(f.v), patient_id: patientId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved); qc.invalidateQueries(); onDone();
  };
  return <form onSubmit={submit} noValidate><VisitFields v={f.v} set={f.set} e={f.e} /><SubmitRow busy={busy} onCancel={onDone} /></form>;
}