import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { GlassCard, PageTitle } from "@/components/common";
import { PatientFields, SubmitRow, VisitFields, emptyPatient, emptyVisit, patientPayload, usePatientForm, useVisitForm, visitPayload } from "@/components/forms";

export const Route = createFileRoute("/_authenticated/patients/new")({
  head: () => ({ meta: [{ title: "Add patient — Record System for CHW" }, { name: "description", content: "Add a new patient and first visit." }] }),
  component: NewPatient,
});

function NewPatient() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const p = usePatientForm(emptyPatient);
  const v = useVisitForm(emptyVisit());
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok1 = p.validate(); const ok2 = v.validate();
    if (!ok1 || !ok2) return;
    setBusy(true);
    const { data, error } = await supabase.from("patients").insert(patientPayload(p.v)).select("id").single();
    if (error || !data) { setBusy(false); toast.error(error?.message ?? "Error"); return; }
    const { error: e2 } = await supabase.from("visits").insert({ ...visitPayload(v.v), patient_id: data.id });
    setBusy(false);
    if (e2) toast.error(e2.message); else toast.success(t.saved);
    qc.invalidateQueries();
    navigate({ to: "/patients/$id", params: { id: data.id } });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <PageTitle>{t.addPatient}</PageTitle>
      <GlassCard><PatientFields v={p.v} set={p.set} e={p.e} /></GlassCard>
      <GlassCard><h2 className="mb-3 text-lg font-semibold">{t.addVisit}</h2><VisitFields v={v.v} set={v.set} e={v.e} /></GlassCard>
      <SubmitRow busy={busy} onCancel={() => navigate({ to: "/patients" })} />
    </form>
  );
}