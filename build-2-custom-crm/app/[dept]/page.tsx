import { listEmployees, listProjects } from "@/lib/db";
import { DEPARTMENT_PROFILES, getDepartmentProfile } from "@/lib/departments";
import { DepartmentUpdateForm } from "./form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return DEPARTMENT_PROFILES.map((p) => ({ dept: p.slug }));
}

export default async function DepartmentPage({ params }: PageProps<"/[dept]">) {
  const { dept } = await params;
  const profile = getDepartmentProfile(dept);
  if (!profile) notFound();

  const [allEmployees, projects] = await Promise.all([listEmployees(true), listProjects(true)]);
  const deptEmployees = allEmployees.filter((e) => e.department === profile.name);
  const otherDepartments = DEPARTMENT_PROFILES.filter((p) => p.slug !== profile.slug).map((p) => p.name);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">{profile.label} — Daily Update</h1>
      <p className="mb-6 text-sm text-gray-500">Takes under 90 seconds.</p>
      <DepartmentUpdateForm
        profile={profile}
        deptEmployees={deptEmployees}
        allEmployees={allEmployees}
        otherDepartments={otherDepartments}
        projects={projects}
      />
    </main>
  );
}
