"use server";

import { insertDailyUpdate } from "@/lib/daily-updates";

export type DailyUpdateState = { ok: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitDailyUpdate(_prev: DailyUpdateState, formData: FormData): Promise<DailyUpdateState> {
  const employeeId = str(formData, "employeeId");
  const employeeName = str(formData, "employeeName");
  const department = str(formData, "department");
  const projectId = str(formData, "projectId");
  const projectName = str(formData, "projectName");
  const yesterdayStatus = str(formData, "yesterdayStatus") as "Completed" | "Partial" | "Not Started" | "";
  const todayPlan = str(formData, "todayPlan");
  const blocked = str(formData, "blocked") === "Yes";
  const paymentPending = str(formData, "paymentPending") === "Yes";
  const clientDecision = str(formData, "clientDecision") === "Yes";
  const supportStatus = str(formData, "supportStatus") as "No" | "Yes-Urgent" | "Yes-Can wait" | "";

  if (!employeeId || !projectId || !yesterdayStatus || !todayPlan || !supportStatus) {
    return { ok: false, error: "Please fill in every field." };
  }

  const blockedReason = blocked ? str(formData, "blockedReason") : null;
  const isOtherDept = blocked && blockedReason === "Other Dept";

  try {
    await insertDailyUpdate({
      employeeId,
      employeeName,
      department,
      projectId,
      projectName,
      yesterdayStatus,
      yesterdayDetail: yesterdayStatus === "Completed" ? null : str(formData, "yesterdayDetail") || null,
      todayPlan,
      blocked,
      blockedReason,
      blockedTagDepartment: isOtherDept ? str(formData, "blockedTagDepartment") || null : null,
      paymentPending,
      paymentNote: paymentPending ? str(formData, "paymentNote") || null : null,
      clientDecision,
      clientNote: clientDecision ? str(formData, "clientNote") || null : null,
      supportStatus,
      supportWho: supportStatus !== "No" ? str(formData, "supportWho") || null : null,
      supportDetail: supportStatus !== "No" ? str(formData, "supportDetail") || null : null,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong saving that — please try again." };
  }
}
