import { supabaseAdmin } from "./supabase";

export type DailyUpdateInput = {
  employeeId: string;
  employeeName: string;
  department: string;
  projectId: string;
  projectName: string;
  yesterdayStatus: "Completed" | "Partial" | "Not Started";
  yesterdayDetail: string | null;
  todayPlan: string;
  blocked: boolean;
  blockedReason: string | null;
  blockedTagDepartment: string | null;
  paymentPending: boolean;
  paymentNote: string | null;
  clientDecision: boolean;
  clientNote: string | null;
  supportStatus: "No" | "Yes-Urgent" | "Yes-Can wait";
  supportWho: string | null;
  supportDetail: string | null;
};

export async function insertDailyUpdate(input: DailyUpdateInput) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("daily_updates").insert({
    employee_id: input.employeeId,
    employee_name: input.employeeName,
    department: input.department,
    project_id: input.projectId,
    project_name: input.projectName,
    yesterday_status: input.yesterdayStatus,
    yesterday_detail: input.yesterdayDetail,
    today_plan: input.todayPlan,
    blocked: input.blocked,
    blocked_reason: input.blockedReason,
    blocked_tag_department: input.blockedTagDepartment,
    payment_pending: input.paymentPending,
    payment_note: input.paymentNote,
    client_decision: input.clientDecision,
    client_note: input.clientNote,
    support_status: input.supportStatus,
    support_who: input.supportWho,
    support_detail: input.supportDetail,
  });
  if (error) throw error;
}

export type RedFlag = {
  project: string;
  person: string;
  dept: string;
  issueType: "Blocked" | "Payment" | "Client Decision" | "Support-Urgent" | "Support-CanWait";
  detail: string;
  taggedTo: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Live per-request derivation of the "one row per flagged condition" view —
 * a single indexed query plus a JS unpivot, rather than a stored helper
 * table (the Google Sheets build needs the latter because plain Sheets
 * formulas can't unpivot; Postgres/JS can do it live on every request).
 */
export async function getTodayRedFlags(filters?: { department?: string; project?: string }): Promise<RedFlag[]> {
  const supabase = supabaseAdmin();
  let query = supabase.from("daily_updates").select("*").eq("submitted_date", todayISO());
  if (filters?.department) query = query.eq("department", filters.department);
  if (filters?.project) query = query.eq("project_name", filters.project);
  const { data, error } = await query;
  if (error) throw error;

  const flags: RedFlag[] = [];
  for (const row of data ?? []) {
    if (row.blocked) {
      flags.push({
        project: row.project_name,
        person: row.employee_name,
        dept: row.department,
        issueType: "Blocked",
        detail: `Reason: ${row.blocked_reason}${row.blocked_reason === "Other Dept" ? ` (${row.blocked_tag_department})` : ""}`,
        taggedTo: row.blocked_reason === "Other Dept" ? row.blocked_tag_department ?? "" : "",
      });
    }
    if (row.payment_pending) {
      flags.push({ project: row.project_name, person: row.employee_name, dept: row.department, issueType: "Payment", detail: row.payment_note ?? "", taggedTo: "" });
    }
    if (row.client_decision) {
      flags.push({ project: row.project_name, person: row.employee_name, dept: row.department, issueType: "Client Decision", detail: row.client_note ?? "", taggedTo: "" });
    }
    if (row.support_status !== "No") {
      flags.push({
        project: row.project_name,
        person: row.employee_name,
        dept: row.department,
        issueType: row.support_status === "Yes-Urgent" ? "Support-Urgent" : "Support-CanWait",
        detail: row.support_detail ?? "",
        taggedTo: row.support_who ?? "",
      });
    }
  }
  return flags;
}

export async function getSubmissionTracker() {
  const supabase = supabaseAdmin();
  const today = todayISO();
  const [{ data: employees, error: e1 }, { data: updates, error: e2 }] = await Promise.all([
    supabase.from("employees").select("id,name").eq("active", true),
    supabase.from("daily_updates").select("employee_id").eq("submitted_date", today),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const submittedIds = new Set((updates ?? []).map((u) => u.employee_id));
  const missing = (employees ?? []).filter((e) => !submittedIds.has(e.id)).map((e) => e.name);
  const total = employees?.length ?? 0;
  return { submitted: total - missing.length, total, missing };
}
