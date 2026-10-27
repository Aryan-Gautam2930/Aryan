import { describe, expect, it } from "vitest";
import { patientSchema, signUpSchema, splitReminders, visitSchema } from "./validation";

describe("rules", () => {
  it("sign-up requires name, email and 8+ char password", () => {
    expect(signUpSchema.safeParse({ name: "", email: "a@b.co", password: "12345678" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "1234567" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "12345678" }).success).toBe(true);
  });
  it("patient age must be 0-130", () => {
    const base = { full_name: "Sita", sex: "female", date_of_birth: "", blood_group: "" };
    expect(patientSchema.safeParse({ ...base, age: "131" }).success).toBe(false);
    expect(patientSchema.safeParse({ ...base, age: "40" }).success).toBe(true);
  });
  it("visit requires symptoms", () => {
    expect(visitSchema.safeParse({ visit_date: "2026-01-01", weight_kg: "", symptoms: " ", advice: "", follow_up_notes: "" }).success).toBe(false);
  });
  it("splits reminders into upcoming, overdue and done", () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const r = splitReminders(
      [
        { due_at: "2026-05-02T10:00:00Z", completed: false },
        { due_at: "2026-04-30T10:00:00Z", completed: false },
        { due_at: "2026-05-03T10:00:00Z", completed: true },
      ],
      now,
    );
    expect([r.upcoming.length, r.overdue.length, r.done.length]).toEqual([1, 1, 1]);
  });
});