import { listEmployees, listProjects } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addEmployeeAction,
  addProjectAction,
  toggleEmployeeActiveAction,
  toggleProjectActiveAction,
  updateEmployeeAction,
  updateProjectAction,
} from "./actions";
import { EditableRow } from "./editable-row";
import { AddEmployeeForm, AddProjectForm } from "./add-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [employees, projects] = await Promise.all([listEmployees(), listProjects()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage Employees &amp; Projects</h1>
        <p className="text-sm text-muted-foreground">Changes here reach the entry forms immediately.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            {employees.map((e) => (
              <EditableRow
                key={e.id}
                id={e.id}
                active={e.active}
                name={e.name}
                department={e.department}
                onUpdate={updateEmployeeAction}
                onToggleActive={toggleEmployeeActiveAction}
              />
            ))}
          </div>
          <AddEmployeeForm onAdd={addEmployeeAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            {projects.map((p) => (
              <EditableRow
                key={p.id}
                id={p.id}
                active={p.active}
                name={p.name}
                onUpdate={updateProjectAction}
                onToggleActive={toggleProjectActiveAction}
              />
            ))}
          </div>
          <AddProjectForm onAdd={addProjectAction} />
        </CardContent>
      </Card>
    </div>
  );
}
