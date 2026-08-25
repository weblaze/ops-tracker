import { supabaseAdmin } from "./supabase";

export type LeadInput = {
  capturedBy: string;
  clinicName: string;
  city: string;
  contactPerson: string;
  mobile: string;
  leadSource: string;
  requirement: string[];
  priority: "Hot" | "Warm" | "Cold";
  assignedTo: string;
  stage: string;
  nextFollowupDate: string;
  nextAction: string;
};

export type Lead = LeadInput & { id: string; lead_id: string; created_date: string };

export async function insertLead(input: LeadInput) {
  const supabase = supabaseAdmin();
  const { data: leadId, error: rpcError } = await supabase.rpc("next_lead_id");
  if (rpcError) throw rpcError;

  const { error } = await supabase.from("leads").insert({
    lead_id: leadId,
    captured_by: input.capturedBy,
    clinic_name: input.clinicName,
    city: input.city,
    contact_person: input.contactPerson,
    mobile: input.mobile,
    lead_source: input.leadSource,
    requirement: input.requirement,
    priority: input.priority,
    assigned_to: input.assignedTo,
    stage: input.stage,
    next_followup_date: input.nextFollowupDate,
    next_action: input.nextAction,
  });
  if (error) throw error;
  return leadId as string;
}

export async function getHotLeadsDue() {
  const supabase = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("priority", "Hot")
    .lte("next_followup_date", today)
    .order("next_followup_date");
  if (error) throw error;
  return data ?? [];
}

export async function getStageCounts() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("leads").select("stage");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.stage] = (counts[row.stage] ?? 0) + 1;
  }
  return counts;
}
