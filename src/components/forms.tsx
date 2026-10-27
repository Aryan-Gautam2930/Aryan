import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { BLOOD_GROUPS, SEXES, patientSchema, visitSchema } from "@/lib/validation";
import { FieldError, MicButton } from "@/components/common";

export type PatientValues = { full_name: string; sex: (typeof SEXES)[number]; age: string; date_of_birth: string; blood_group: string };
export type VisitValues = { visit_date: string; weight_kg: string; symptoms: string; advice: string; follow_up_notes: string };

export const today = () => new Date().toLocaleDateString("en-CA");
export const emptyPatient: PatientValues = { full_name: "", sex: "female", age: "", date_of_birth: "", blood_group: "" };
export const emptyVisit = (): VisitValues => ({ visit_date: today(), weight_kg: "", symptoms: "", advice: "", follow_up_notes: "" });

const selectCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";

function errs(r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) {
  const o: Record<string, string> = {};
  if (!r.success) r.error!.issues.forEach((i) => (o[String(i.path[0])] ??= i.message));
  return o;
}

export function PatientFields({ v, set, e }: { v: PatientValues; set: (p: Partial<PatientValues>) => void; e: Record<string, string> }) {
  const { t } = useI18n();
  const sexLabel = { female: t.female, male: t.male, other: t.other, prefer_not_to_say: t.preferNot };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="full_name">{t.fullName} *</Label>
        <Input id="full_name" value={v.full_name} onChange={(x) => set({ full_name: x.target.value })} aria-invalid={!!e.full_name} autoComplete="off" />
        <FieldError msg={e.full_name} />
      </div>
      <div>
        <Label htmlFor="sex">{t.sex} *</Label>
        <select id="sex" className={selectCls} value={v.sex} onChange={(x) => set({ sex: x.target.value as PatientValues["sex"] })}>
          {SEXES.map((s) => <option key={s} value={s}>{sexLabel[s]}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="age">{t.age}</Label>
        <Input id="age" inputMode="numeric" value={v.age} onChange={(x) => set({ age: x.target.value })} aria-invalid={!!e.age} />
        <FieldError msg={e.age} />
      </div>
      <div>
        <Label htmlFor="dob">{t.dob}</Label>
        <Input id="dob" type="date" max={today()} value={v.date_of_birth} onChange={(x) => set({ date_of_birth: x.target.value })} />
        <FieldError msg={e.date_of_birth} />
      </div>
      <div>
        <Label htmlFor="blood">{t.bloodGroup}</Label>
        <select id="blood" className={selectCls} value={v.blood_group} onChange={(x) => set({ blood_group: x.target.value })}>
          <option value="">{t.unknown}</option>
          {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
    </div>
  );
}

export function VisitFields({ v, set, e }: { v: VisitValues; set: (p: Partial<VisitValues>) => void; e: Record<string, string> }) {
  const { t } = useI18n();
  const append = (k: "symptoms" | "advice" | "follow_up_notes") => (txt: string) => set({ [k]: (v[k] ? v[k] + " " : "") + txt });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="visit_date">{t.visitDate} *</Label>
        <Input id="visit_date" type="date" max={today()} value={v.visit_date} onChange={(x) => set({ visit_date: x.target.value })} aria-invalid={!!e.visit_date} />
        <FieldError msg={e.visit_date} />
      </div>
      <div>
        <Label htmlFor="weight">{t.weight}</Label>
        <Input id="weight" inputMode="decimal" value={v.weight_kg} onChange={(x) => set({ weight_kg: x.target.value })} aria-invalid={!!e.weight_kg} />
        <FieldError msg={e.weight_kg} />
      </div>
      {(["symptoms", "advice", "follow_up_notes"] as const).map((k) => (
        <div key={k} className="sm:col-span-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <Label htmlFor={k}>{k === "symptoms" ? `${t.symptoms} *` : k === "advice" ? t.advice : t.followUp}</Label>
            <MicButton onText={append(k)} />
          </div>
          <Textarea id={k} rows={3} value={v[k]} onChange={(x) => set({ [k]: x.target.value })} aria-invalid={!!e[k]} />
          <FieldError msg={e[k]} />
        </div>
      ))}
    </div>
  );
}

export function usePatientForm(init: PatientValues) {
  const [v, setV] = useState(init);
  const [e, setE] = useState<Record<string, string>>({});
  const validate = () => { const r = patientSchema.safeParse(v); setE(errs(r)); return r.success; };
  return { v, set: (p: Partial<PatientValues>) => setV((o) => ({ ...o, ...p })), e, validate };
}
export function useVisitForm(init: VisitValues) {
  const [v, setV] = useState(init);
  const [e, setE] = useState<Record<string, string>>({});
  const validate = () => { const r = visitSchema.safeParse(v); setE(errs(r)); return r.success; };
  return { v, set: (p: Partial<VisitValues>) => setV((o) => ({ ...o, ...p })), e, validate };
}

export const patientPayload = (v: PatientValues) => ({
  full_name: v.full_name.trim(), sex: v.sex, age: v.age === "" ? null : Number(v.age),
  date_of_birth: v.date_of_birth || null, blood_group: v.blood_group || null,
});
export const visitPayload = (v: VisitValues) => ({
  visit_date: v.visit_date, weight_kg: v.weight_kg === "" ? null : Number(v.weight_kg),
  symptoms: v.symptoms.trim(), advice: v.advice.trim(), follow_up_notes: v.follow_up_notes.trim() || null,
});

export function SubmitRow({ busy, onCancel }: { busy: boolean; onCancel?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex justify-end gap-2 pt-2">
      {onCancel && <Button type="button" variant="outline" onClick={onCancel}>{t.cancel}</Button>}
      <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t.save}</Button>
    </div>
  );
}

export type FormSubmit = (e: FormEvent) => void;