import { useEffect, useRef, useState } from "react";

export function useSpeech(lang: string) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [state, setState] = useState<"idle" | "speaking" | "paused">("idle");
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  useEffect(() => {
    if (!supported) return;
    const check = () => {
      const voices = speechSynthesis.getVoices();
      const prefix = lang.split("-")[0];
      setVoiceAvailable(voices.length === 0 || voices.some((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix)));
    };
    check();
    speechSynthesis.addEventListener("voiceschanged", check);
    return () => speechSynthesis.removeEventListener("voiceschanged", check);
  }, [lang, supported]);

  useEffect(() => () => { if (supported) speechSynthesis.cancel(); }, [supported]);

  const speak = (text: string) => {
    if (!supported) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace("_", "-") === lang) ??
      speechSynthesis.getVoices().find((x) => x.lang.startsWith(lang.split("-")[0]));
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    speechSynthesis.speak(u);
    setState("speaking");
  };
  const pause = () => { speechSynthesis.pause(); setState("paused"); };
  const resume = () => { speechSynthesis.resume(); setState("speaking"); };
  const stop = () => { speechSynthesis.cancel(); setState("idle"); };
  return { supported, state, voiceAvailable, speak, pause, resume, stop };
}

type Rec = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: (e: { error: string }) => void; onend: () => void };

export function useDictation(lang: string, onText: (t: string) => void) {
  const Ctor = typeof window !== "undefined" ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Rec) | undefined : undefined;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<Rec | null>(null);
  const start = () => {
    if (!Ctor) return;
    setError(null);
    const r = new Ctor();
    r.lang = lang; r.interimResults = false; r.continuous = false;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((x) => x[0].transcript).join(" ");
      onText(text);
    };
    r.onerror = (e) => setError(e.error === "not-allowed" ? "Microphone permission denied" : e.error);
    r.onend = () => setListening(false);
    ref.current = r;
    r.start();
    setListening(true);
  };
  const stop = () => { ref.current?.stop(); setListening(false); };
  return { supported: !!Ctor, listening, error, start, stop };
}