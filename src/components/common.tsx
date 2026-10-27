import { Mic, MicOff, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n, speechLang } from "@/lib/i18n";
import { useDictation } from "@/lib/speech";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass rounded-2xl p-4 md:p-6 ${className}`}>{children}</section>;
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold md:text-3xl">{children}</h1>
      {action}
    </div>
  );
}

export function Loading() {
  const { t } = useI18n();
  return <div role="status" className="flex items-center gap-2 p-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />{t.loading}</div>;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
      {t.errorLoad} {onRetry && <Button size="sm" variant="outline" className="ml-2" onClick={onRetry}>{t.retry}</Button>}
    </div>
  );
}

export function Empty({ children, image }: { children: ReactNode; image?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
      {image && <img src={image} alt="" width={120} height={120} loading="lazy" className="h-28 w-28 opacity-90" />}
      {children}
    </div>
  );
}

export function ConfirmDelete({ onConfirm, label }: { onConfirm: () => void; label?: string }) {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">{label ?? t.delete}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.delete}</AlertDialogTitle>
          <AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.delete}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MicButton({ onText }: { onText: (t: string) => void }) {
  const { t, lang } = useI18n();
  const d = useDictation(speechLang(lang), onText);
  if (!d.supported) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" variant={d.listening ? "default" : "outline"} size="sm" onClick={d.listening ? d.stop : d.start}
        aria-pressed={d.listening} title={t.micInfo}>
        {d.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        <span className="sr-only md:not-sr-only">{d.listening ? t.listening : t.voiceInput}</span>
      </Button>
      {d.error && <span className="text-xs text-destructive">{d.error}</span>}
    </span>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-destructive" role="alert">{msg}</p> : null;
}

export const fmtDate = (d: string, lang: string) =>
  new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString(lang === "en" ? "en-IN" : `${lang}-IN`, { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (d: string, lang: string) =>
  new Date(d).toLocaleString(lang === "en" ? "en-IN" : `${lang}-IN`, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });