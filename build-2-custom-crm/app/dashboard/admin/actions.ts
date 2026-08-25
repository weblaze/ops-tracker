"use server";

import { revalidatePath } from "next/cache";
import { createEmployee, createProject, updateEmployee, updateProject } from "@/lib/db";

export async function addEmployeeAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  if (!name || !department) return;
  await createEmployee(name, department);
  revalidatePath("/dashboard/admin");
}

export async function updateEmployeeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  if (!id || !name || !department) return;
  await updateEmployee(id, { name, department });
  revalidatePath("/dashboard/admin");
}

export async function toggleEmployeeActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await updateEmployee(id, { active: !active });
  revalidatePath("/dashboard/admin");
}

export async function addProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createProject(name);
  revalidatePath("/dashboard/admin");
}

export async function updateProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  await updateProject(id, { name });
  revalidatePath("/dashboard/admin");
}

export async function toggleProjectActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await updateProject(id, { active: !active });
  revalidatePath("/dashboard/admin");
}
