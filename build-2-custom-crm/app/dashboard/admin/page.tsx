import Link from "next/link";
import { listEmployees, listProjects } from "@/lib/db";
import {
  addEmployeeAction,
  addProjectAction,
  toggleEmployeeActiveAction,
  toggleProjectActiveAction,
  updateEmployeeAction,
  updateProjectAction,
} from "./actions";
import { EditableRow } from "./editable-row";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [employees, projects] = await Promise.all([listEmployees(), listProjects()]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Employees &amp; Projects</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">
          Back to dashboard
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Employees</h2>
        <div className="mb-4 rounded border border-gray-200">
          {employees.map((e) => (
            <EditableRow
              key={e.id}
              id={e.id}
              active={e.active}
              name={e.name}
              department={e.department}
              updateAction={updateEmployeeAction}
              toggleAction={toggleEmployeeActiveAction}
            />
          ))}
        </div>
        <form action={addEmployeeAction} className="flex flex-wrap gap-2">
          <input name="name" placeholder="Name" required className="min-h-10 flex-1 rounded border border-gray-300 px-2 text-sm" />
          <input
            name="department"
            placeholder="Department"
            required
            className="min-h-10 flex-1 rounded border border-gray-300 px-2 text-sm"
          />
          <button type="submit" className="min-h-10 rounded bg-gray-900 px-4 text-sm text-white">
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Projects</h2>
        <div className="mb-4 rounded border border-gray-200">
          {projects.map((p) => (
            <EditableRow
              key={p.id}
              id={p.id}
              active={p.active}
              name={p.name}
              updateAction={updateProjectAction}
              toggleAction={toggleProjectActiveAction}
            />
          ))}
        </div>
        <form action={addProjectAction} className="flex flex-wrap gap-2">
          <input name="name" placeholder="Project name" required className="min-h-10 flex-1 rounded border border-gray-300 px-2 text-sm" />
          <button type="submit" className="min-h-10 rounded bg-gray-900 px-4 text-sm text-white">
            Add
          </button>
        </form>
      </section>
    </main>
  );
}
