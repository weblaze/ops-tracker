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

export type LeadRow = {
  id: string;
  lead_id: string;
  created_date: string;
  captured_by: string;
  clinic_name: string;
  city: string;
  contact_person: string;
  mobile: string;
  lead_source: string;
  requirement: string[];
  priority: "Hot" | "Warm" | "Cold";
  assigned_to: string;
  stage: string;
  next_followup_date: string;
  next_action: string;
  updated_at: string;
};

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

/** Unpaginated — the Kanban board needs every lead in hand to render its columns. */
export async function listAllLeadsForBoard(): Promise<LeadRow[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").order("created_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

export async function getLeadById(id: string): Promise<LeadRow | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as LeadRow | null;
}

export type LeadUpdateInput = Partial<{
  priority: "Hot" | "Warm" | "Cold";
  assignedTo: string;
  stage: string;
  nextFollowupDate: string;
  nextAction: string;
}>;

export async function updateLead(id: string, fields: LeadUpdateInput) {
  const supabase = supabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.priority !== undefined) update.priority = fields.priority;
  if (fields.assignedTo !== undefined) update.assigned_to = fields.assignedTo;
  if (fields.stage !== undefined) update.stage = fields.stage;
  if (fields.nextFollowupDate !== undefined) update.next_followup_date = fields.nextFollowupDate;
  if (fields.nextAction !== undefined) update.next_action = fields.nextAction;

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) throw error;
}

export async function updateLeadStage(id: string, stage: string) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("leads").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export type LeadHistoryFilters = { stage?: string; priority?: string };

export async function listLeads(filters: LeadHistoryFilters, page: number, pageSize = 50) {
  const supabase = supabaseAdmin();
  let query = supabase.from("leads").select("*", { count: "exact" }).order("created_date", { ascending: false });
  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.priority) query = query.eq("priority", filters.priority);

  const from = page * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data ?? []) as LeadRow[], total: count ?? 0, page, pageSize };
}
