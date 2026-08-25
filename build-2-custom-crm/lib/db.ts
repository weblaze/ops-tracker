import { supabaseAdmin } from "./supabase";

export type Employee = { id: string; name: string; department: string; active: boolean };
export type Project = { id: string; name: string; active: boolean };

export async function listEmployees(activeOnly = false): Promise<Employee[]> {
  const supabase = supabaseAdmin();
  let query = supabase.from("employees").select("*").order("name");
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data as Employee[];
}

export async function listProjects(activeOnly = false): Promise<Project[]> {
  const supabase = supabaseAdmin();
  let query = supabase.from("projects").select("*").order("name");
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data as Project[];
}

export async function createEmployee(name: string, department: string) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("employees").insert({ name, department });
  if (error) throw error;
}

export async function updateEmployee(id: string, fields: Partial<Pick<Employee, "name" | "department" | "active">>) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("employees").update(fields).eq("id", id);
  if (error) throw error;
}

export async function createProject(name: string) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("projects").insert({ name });
  if (error) throw error;
}

export async function updateProject(id: string, fields: Partial<Pick<Project, "name" | "active">>) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("projects").update(fields).eq("id", id);
  if (error) throw error;
}
