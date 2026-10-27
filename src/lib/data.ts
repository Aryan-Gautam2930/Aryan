import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type PatientWithVisits = Patient & { visits: Pick<Visit, "id" | "visit_date">[] };

// RLS scopes every query to the signed-in user's own rows.
export const patientsQuery = () =>
  queryOptions({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*, visits(id, visit_date)").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as PatientWithVisits[]).map((p) => ({
        ...p,
        lastVisit: p.visits.reduce<string | null>((m, v) => (!m || v.visit_date > m ? v.visit_date : m), null),
      })).sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
    },
  });

export const patientQuery = (id: string) =>
  queryOptions({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      const { data: visits, error: e2 } = await supabase
        .from("visits").select("*").eq("patient_id", id)
        .order("visit_date", { ascending: false }).order("created_at", { ascending: false });
      if (e2) throw e2;
      return { patient: data, visits: visits ?? [] };
    },
  });

export const recentVisitsQuery = () =>
  queryOptions({
    queryKey: ["recent-visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits").select("*, patients(full_name)")
        .order("visit_date", { ascending: false }).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as (Visit & { patients: { full_name: string } | null })[];
    },
  });

export const remindersQuery = () =>
  queryOptions({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reminders").select("*, patients(full_name)").order("due_at");
      if (error) throw error;
      return data as (Reminder & { patients: { full_name: string } | null })[];
    },
  });

export const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return { email: u.user.email ?? "", id: u.user.id, full_name: data?.full_name ?? (u.user.user_metadata?.full_name as string) ?? "", preferred_language: data?.preferred_language ?? "en" };
    },
  });