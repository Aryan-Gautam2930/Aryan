import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { patientsQuery, remindersQuery, type Reminder } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { reminderSchema, splitReminders } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete, Empty, ErrorState, FieldError, GlassCard, Loading, PageTitle, fmtDateTime } from "@/components/common";
import { SubmitRow, today } from "@/components/forms";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({ meta: [{ title: "Reminders — Record System for CHW" }, { name: "description", content: "Follow-up reminders." }] }),
  component: Reminders,
});

function NotifPanel() {
  const { t } = useI18n();
  const [state, setState] = useState<string>("loading");
  useEffect(() => {
    if (typeof Notification === "undefined") setState("unsupported");
    else setState(Notification.permission === "granted" && localStorage.getItem("chw-notify") === "1" ? "on" : Notification.permission);
  }, []);
  const enable = async () => {
    const p = await Notification.requestPermission();
    if (p === "granted") { localStorage.setItem("chw-notify", "1"); setState("on"); } else setState(p);
  };
  return (
    <GlassCard className="text-sm">
      {state === "unsupported" ? <p>{t.notifUnsupported}</p> : state === "denied" ? <p>{t.notifDenied}</p> : state === "on" ? <p>{t.notifOn}</p> : <Button variant="outline" onClick={enable}>{t.enableNotifications}</Button>}
      <p className="mt-2 text-muted-foreground">{t.notifNote}</p>
    </GlassCard>
  );
}

function Reminders() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery(remindersQuery());
  const [edit, setEdit] = useState<Reminder | "new" | null>(null);
  const toggle = async (r: Reminder) => {
    const { error } = await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["reminders"] });
  };
  const del = async (id: string) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t.deleted); qc.invalidateQueries({ queryKey: ["reminders"] }); }
  };
  const s = data ? splitReminders(data) : null;
  const Row = ({ r, overdue }: { r: (typeof data & object)[number]; overdue?: boolean }) => (
    <li className="flex flex-wrap items-start justify-between gap-2 rounded-xl border bg-card p-3">
      <div className="min-w-0">
        <p className={`font-medium ${r.completed ? "line-through opacity-60" : ""}`}>{r.title} {overdue && <span className="ml-1 rounded bg-destructive/15 px-1.5 text-xs text-destructive">{t.overdue}</span>}</p>
        <p className="text-xs text-muted-foreground">{fmtDateTime(r.due_at, lang)}{r.patients ? ` · ${r.patients.full_name}` : ""}</p>
        {r.notes && <p className="mt-1 text-sm">{r.notes}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={r.completed ? "outline" : "default"} onClick={() => toggle(r)}>{r.completed ? t.markUndone : t.markDone}</Button>
        <Button size="sm" variant="outline" onClick={() => setEdit(r)}>{t.edit}</Button>
        <ConfirmDelete onConfirm={() => del(r.id)} />
      </div>
    </li>
  );
  return (
    <div className="space-y-4">
      <PageTitle action={<Button onClick={() => setEdit("new")}><Plus className="h-4 w-4" />{t.newReminder}</Button>}>{t.reminders}</PageTitle>
      <NotifPanel />
      {isLoading ? <Loading /> : isError || !s ? <ErrorState onRetry={() => refetch()} /> : (
        <>
          <GlassCard><h2 className="mb-3 text-lg font-semibold">{t.upcoming}</h2>
            {!s.upcoming.length && !s.overdue.length ? <Empty>{t.noReminders}</Empty> : <ul className="space-y-2">{s.overdue.map((r) => <Row key={r.id} r={r} overdue />)}{s.upcoming.map((r) => <Row key={r.id} r={r} />)}</ul>}
          </GlassCard>
          <GlassCard><h2 className="mb-3 text-lg font-semibold">{t.past}</h2>
            {!s.done.length ? <Empty>{t.noReminders}</Empty> : <ul className="space-y-2">{s.done.map((r) => <Row key={r.id} r={r} />)}</ul>}
          </GlassCard>
        </>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit === "new" ? t.newReminder : t.edit}</DialogTitle></DialogHeader>
          {edit && <ReminderForm r={edit === "new" ? null : edit} onDone={() => setEdit(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReminderForm({ r, onDone }: { r: Reminder | null; onDone: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const patients = useQuery(patientsQuery());
  const d = r ? new Date(r.due_at) : null;
  const [v, setV] = useState({
    title: r?.title ?? "", notes: r?.notes ?? "", patient_id: r?.patient_id ?? "",
    date: d ? d.toLocaleDateString("en-CA") : today(),
    time: d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "09:00",
  });
  const [e, setE] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const res = reminderSchema.safeParse(v);
    if (!res.success) { const o: Record<string, string> = {}; res.error.issues.forEach((i) => (o[String(i.path[0])] ??= i.message)); setE(o); return; }
    setE({}); setBusy(true);
    const payload = { title: v.title.trim(), notes: v.notes.trim() || null, patient_id: v.patient_id || null, due_at: new Date(`${v.date}T${v.time}`).toISOString() };
    const { error } = r ? await supabase.from("reminders").update(payload).eq("id", r.id) : await supabase.from("reminders").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved); qc.invalidateQueries({ queryKey: ["reminders"] }); onDone();
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label htmlFor="rt">{t.title} *</Label><Input id="rt" value={v.title} onChange={(x) => setV({ ...v, title: x.target.value })} /><FieldError msg={e.title} /></div>
      <div><Label htmlFor="rd">{t.date} *</Label><Input id="rd" type="date" value={v.date} onChange={(x) => setV({ ...v, date: x.target.value })} /><FieldError msg={e.date} /></div>
      <div><Label htmlFor="rtm">{t.time} *</Label><Input id="rtm" type="time" value={v.time} onChange={(x) => setV({ ...v, time: x.target.value })} /><FieldError msg={e.time} /></div>
      <div className="sm:col-span-2"><Label htmlFor="rp">{t.patientOptional}</Label>
        <select id="rp" className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" value={v.patient_id} onChange={(x) => setV({ ...v, patient_id: x.target.value })}>
          <option value="">{t.none}</option>
          {patients.data?.map((p) => <option key={p.id} value={p.id}>{p.full_name}{p.age != null ? ` (${p.age})` : ""}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><Label htmlFor="rn">{t.notes}</Label><Textarea id="rn" rows={3} value={v.notes} onChange={(x) => setV({ ...v, notes: x.target.value })} /></div>
      <div className="sm:col-span-2"><SubmitRow busy={busy} onCancel={onDone} /></div>
    </form>
  );
}