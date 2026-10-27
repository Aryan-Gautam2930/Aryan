import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { LANGS, speechLang, useI18n } from "@/lib/i18n";
import { useSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { GlassCard, PageTitle } from "@/components/common";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help & Language — Record System for CHW" }, { name: "description", content: "How to use the app, with read-aloud guidance." }] }),
  component: Help,
});

function Help() {
  const { t, lang, setLang } = useI18n();
  const sp = useSpeech(speechLang(lang));
  return (
    <div className="space-y-4">
      <PageTitle>{t.help}</PageTitle>
      <GlassCard>
        <h2 className="mb-2 text-lg font-semibold">{t.language}</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.language}>
          {LANGS.map((l) => <Button key={l.code} role="radio" aria-checked={lang === l.code} variant={lang === l.code ? "default" : "outline"} onClick={() => { sp.stop(); setLang(l.code); }}>{l.label}</Button>)}
        </div>
        {!sp.supported ? <p className="mt-3 text-sm text-muted-foreground">{t.speechUnsupported}</p> : !sp.voiceAvailable && <p className="mt-3 text-sm text-muted-foreground">{t.voiceMissing}</p>}
        {sp.supported && sp.state !== "idle" && (
          <div className="mt-3 flex gap-2">
            {sp.state === "speaking" ? <Button variant="outline" size="sm" onClick={sp.pause}><Pause className="h-4 w-4" />{t.pause}</Button> : <Button variant="outline" size="sm" onClick={sp.resume}><Play className="h-4 w-4" />{t.resume}</Button>}
            <Button variant="outline" size="sm" onClick={sp.stop}><Square className="h-4 w-4" />{t.stop}</Button>
          </div>
        )}
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        {t.helpTopics.map((h) => (
          <GlassCard key={h.t}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{h.t}</h3>
              {sp.supported && <Button size="sm" variant="outline" onClick={() => sp.speak(`${h.t}. ${h.b}`)}><Volume2 className="h-4 w-4" />{t.speak}</Button>}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{h.b}</p>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="border-warning">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{t.disclaimer}</p>
          {sp.supported && <Button size="sm" variant="outline" onClick={() => sp.speak(t.disclaimer)}><Volume2 className="h-4 w-4" />{t.speak}</Button>}
        </div>
      </GlassCard>
    </div>
  );
}