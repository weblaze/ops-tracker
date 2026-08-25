import { listEmployees, listProjects } from "@/lib/db";
import { DailyUpdateForm } from "./form";

// Employees/Projects are managed live from /dashboard/admin — never
// statically cache this route or new entries wouldn't show up.
export const dynamic = "force-dynamic";

export default async function DailyUpdatePage() {
  const [employees, projects] = await Promise.all([listEmployees(true), listProjects(true)]);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Daily Update</h1>
      <p className="mb-6 text-sm text-gray-500">Takes under 90 seconds.</p>
      <DailyUpdateForm employees={employees} projects={projects} />
    </main>
  );
}
