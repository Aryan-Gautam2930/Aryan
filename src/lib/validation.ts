import { z } from "zod";

export const SEXES = ["female", "male", "other", "prefer_not_to_say"] as const;
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Invalid date")
  .refine((v) => v === "" || new Date(v) <= new Date(), "Date cannot be in the future");

export const patientSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(120, "Max 120 characters"),
  sex: z.enum(SEXES),
  age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 130), "Age must be 0–130"),
  date_of_birth: optionalDate,
  blood_group: z.string().refine((v) => v === "" || (BLOOD_GROUPS as readonly string[]).includes(v)),
});

export const visitSchema = z.object({
  visit_date: z.string().min(1, "Visit date is required").pipe(optionalDate),
  weight_kg: z
    .string()
    .trim()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) < 500), "Weight must be 0–500 kg"),
  symptoms: z.string().trim().min(1, "Please describe the health issue").max(2000),
  advice: z.string().trim().max(2000),
  follow_up_notes: z.string().trim().max(2000),
});

export const reminderSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  date: z.string().min(1, "Date is required"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time is required"),
  patient_id: z.string(),
  notes: z.string().trim().max(1000),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type ReminderLike = { due_at: string; completed: boolean };
export function splitReminders<T extends ReminderLike>(list: T[], now = new Date()) {
  const upcoming = list.filter((r) => !r.completed && new Date(r.due_at) >= now).sort((a, b) => +new Date(a.due_at) - +new Date(b.due_at));
  const overdue = list.filter((r) => !r.completed && new Date(r.due_at) < now);
  const done = list.filter((r) => r.completed);
  return { upcoming, overdue, done };
}