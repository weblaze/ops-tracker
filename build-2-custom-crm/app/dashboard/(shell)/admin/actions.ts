"use server";

import { revalidatePath } from "next/cache";
import { createEmployee, createProject, updateEmployee, updateProject } from "@/lib/db";

export async function addEmployeeAction(name: string, department: string) {
  await createEmployee(name, department);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/history");
}

export async function updateEmployeeAction(id: string, name: string, department?: string) {
  await updateEmployee(id, { name, department });
  revalidatePath("/dashboard/admin");
}

export async function toggleEmployeeActiveAction(id: string, currentlyActive: boolean) {
  await updateEmployee(id, { active: !currentlyActive });
  revalidatePath("/dashboard/admin");
  revalidatePath("/daily-update");
  revalidatePath("/lead-gen");
}

export async function addProjectAction(name: string) {
  await createProject(name);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/history");
}

export async function updateProjectAction(id: string, name: string) {
  await updateProject(id, { name });
  revalidatePath("/dashboard/admin");
}

export async function toggleProjectActiveAction(id: string, currentlyActive: boolean) {
  await updateProject(id, { active: !currentlyActive });
  revalidatePath("/dashboard/admin");
  revalidatePath("/daily-update");
}
