import Link from "next/link";
import { getSubmissionTracker, getTodayRedFlags, type RedFlag } from "@/lib/daily-updates";
import { getHotLeadsDue, getStageCounts } from "@/lib/leads";
import { listEmployees, listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

function rowColor(issueType: RedFlag["issueType"]) {
  if (issueType === "Blocked" || issueType === "Support-Urgent") return "bg-red-50";
  return "bg-yellow-50";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; project?: string }>;
}) {
  const { department, project } = await searchParams;
  const filters = { department: department || undefined, project: project || undefined };

  const [redFlags, tracker, hotLeads, stageCounts, employees, projects] = await Promise.all([
    getTodayRedFlags(filters),
    getSubmissionTracker(),
    getHotLeadsDue(),
    getStageCounts(),
    listEmployees(true),
    listProjects(true),
  ]);

  const departments = Array.from(new Set(employees.map((e) => e.department))).sort();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ops Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard/admin" className="text-blue-600 underline">
            Manage Employees/Projects
          </Link>
          <form action="/dashboard/logout" method="post">
            <button type="submit" className="text-gray-500 underline">
              Log out
            </button>
          </form>
        </div>
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1">
          <span className="text-gray-600">Department</span>
          <select name="department" defaultValue={department ?? ""} className="min-h-10 rounded border border-gray-300 px-2">
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-600">Project</span>
          <select name="project" defaultValue={project ?? ""} className="min-h-10 rounded border border-gray-300 px-2">
            <option value="">All</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="min-h-10 rounded bg-gray-900 px-4 text-white">
          Filter
        </button>
        <a
          href={`/dashboard/export?department=${department ?? ""}&project=${project ?? ""}`}
          className="min-h-10 rounded border border-gray-300 px-4 py-2 text-gray-700"
        >
          Export CSV
        </a>
      </form>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Today&rsquo;s Red Flags</h2>
        <p className="mb-3 text-sm text-gray-500">Anyone not listed here is clear (green) today.</p>
        {redFlags.length === 0 ? (
          <p className="rounded border border-gray-200 p-4 text-gray-500">No red flags today.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Project</th>
                  <th className="p-2">Person</th>
                  <th className="p-2">Dept</th>
                  <th className="p-2">Issue Type</th>
                  <th className="p-2">Detail</th>
                  <th className="p-2">Tagged To</th>
                </tr>
              </thead>
              <tbody>
                {redFlags.map((f, i) => (
                  <tr key={i} className={`${rowColor(f.issueType)} border-t border-gray-200`}>
                    <td className="p-2">{f.project}</td>
                    <td className="p-2">{f.person}</td>
                    <td className="p-2">{f.dept}</td>
                    <td className="p-2 font-medium">{f.issueType}</td>
                    <td className="p-2">{f.detail}</td>
                    <td className="p-2">{f.taggedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Submission Tracker</h2>
        <p className="mb-2 text-base">
          Submitted: <span className="font-semibold">{tracker.submitted}</span> of {tracker.total}
        </p>
        {tracker.missing.length > 0 && (
          <p className="text-sm text-gray-600">Missing: {tracker.missing.join(", ")}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Lead Pipeline Snapshot</h2>
        <p className="mb-2 text-sm font-medium text-gray-700">Hot leads — follow-up due today or overdue</p>
        {hotLeads.length === 0 ? (
          <p className="mb-6 rounded border border-gray-200 p-4 text-gray-500">No hot leads due.</p>
        ) : (
          <div className="mb-6 overflow-x-auto rounded border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Lead ID</th>
                  <th className="p-2">Clinic/Project</th>
                  <th className="p-2">Contact</th>
                  <th className="p-2">Mobile</th>
                  <th className="p-2">Stage</th>
                  <th className="p-2">Next Follow-up</th>
                  <th className="p-2">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((l) => (
                  <tr key={l.id} className="border-t border-gray-200">
                    <td className="p-2">{l.lead_id}</td>
                    <td className="p-2">{l.clinic_name}</td>
                    <td className="p-2">{l.contact_person}</td>
                    <td className="p-2">{l.mobile}</td>
                    <td className="p-2">{l.stage}</td>
                    <td className="p-2">{l.next_followup_date}</td>
                    <td className="p-2">{l.next_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mb-2 text-sm font-medium text-gray-700">Count by stage</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <span key={stage} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
              {stage}: {count}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
