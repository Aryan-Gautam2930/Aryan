import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { remindersQuery } from "@/lib/data";

/** In-app reminder alerts. Only runs while the app is open; no background push. */
export function ReminderWatcher() {
  const { data } = useQuery(remindersQuery());
  const fired = useRef(new Set<string>());
  useEffect(() => {
    if (!data) return;
    const tick = () => {
      const now = Date.now();
      for (const r of data) {
        const due = new Date(r.due_at).getTime();
        if (r.completed || fired.current.has(r.id)) continue;
        if (due <= now && now - due < 60 * 60 * 1000) {
          fired.current.add(r.id);
          toast(`⏰ ${r.title}`, { description: r.patients?.full_name ?? undefined, duration: 15000 });
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && localStorage.getItem("chw-notify") === "1") {
            try { new Notification(r.title, { body: r.patients?.full_name ?? "Reminder" }); } catch { /* ignore */ }
          }
        }
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [data]);
  return null;
}