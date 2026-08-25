"use server";

import { insertLead } from "@/lib/leads";

export type LeadState = { ok: boolean; error?: string; leadId?: string };

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const capturedBy = str(formData, "capturedBy");
  const clinicName = str(formData, "clinicName");
  const city = str(formData, "city");
  const contactPerson = str(formData, "contactPerson");
  const mobile = str(formData, "mobile");
  const leadSource = str(formData, "leadSource");
  const requirement = formData.getAll("requirement").map(String);
  const priority = str(formData, "priority") as "Hot" | "Warm" | "Cold" | "";
  const assignedTo = str(formData, "assignedTo");
  const stage = str(formData, "stage");
  const nextFollowupDate = str(formData, "nextFollowupDate");
  const nextAction = str(formData, "nextAction");

  if (
    !capturedBy ||
    !clinicName ||
    !city ||
    !contactPerson ||
    !mobile ||
    !leadSource ||
    !requirement.length ||
    !priority ||
    !assignedTo ||
    !stage ||
    !nextFollowupDate ||
    !nextAction
  ) {
    return { ok: false, error: "Please fill in every field." };
  }

  try {
    const leadId = await insertLead({
      capturedBy,
      clinicName,
      city,
      contactPerson,
      mobile,
      leadSource,
      requirement,
      priority,
      assignedTo,
      stage,
      nextFollowupDate,
      nextAction,
    });
    return { ok: true, leadId };
  } catch {
    return { ok: false, error: "Something went wrong saving that — please try again." };
  }
}
