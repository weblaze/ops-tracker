"use server";

import { revalidatePath } from "next/cache";
import { updateLead, updateLeadStage, type LeadUpdateInput } from "@/lib/leads";

export async function updateLeadStageAction(id: string, stage: string) {
  await updateLeadStage(id, stage);
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

export async function updateLeadAction(id: string, fields: LeadUpdateInput) {
  await updateLead(id, fields);
  revalidatePath("/dashboard/pipeline");
  revalidatePath(`/dashboard/pipeline/${id}`);
  revalidatePath("/dashboard");
}
