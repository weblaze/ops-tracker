import { CheckCircle2 } from "lucide-react";
import { getProjectStatusBoard, type ProjectStatus, type ProjectStatusEntry } from "@/lib/daily-updates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LANES: { status: ProjectStatus; label: string; dot: string }[] = [
  { status: "blocked", label: "Blocked / Urgent", dot: "bg-red-500" },
  { status: "attention", label: "Needs Attention", dot: "bg-amber-500" },
  { status: "clear", label: "Clear", dot: "bg-emerald-500" },
];

function ProjectCard({ entry }: { entry: ProjectStatusEntry }) {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{entry.project}</span>
        {entry.flags.length > 0 && <Badge variant="outline">{entry.flags.length}</Badge>}
      </div>
      {entry.flags.length === 0 ? (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-500" /> No flags today
        </p>
      ) : (
        <ul className="space-y-1">
          {entry.flags.map((f, i) => (
            <li key={i} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{f.issueType}</span> — {f.person}: {f.detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ProjectsPage() {
  const board = await getProjectStatusBoard();
  const byStatus = (status: ProjectStatus) => board.filter((e) => e.status === status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Today&rsquo;s status per active project, derived from red flags.</p>
      </div>

      {board.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active projects yet — add some in Admin.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {LANES.map((lane) => {
            const entries = byStatus(lane.status);
            return (
              <div key={lane.status} className="flex flex-col rounded-lg border bg-muted/30 p-2">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={cn("size-2 rounded-full", lane.dot)} />
                  <h2 className="text-sm font-medium">{lane.label}</h2>
                  <Badge variant="outline" className="ml-auto">
                    {entries.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {entries.length === 0 ? (
                    <p className="px-1 text-xs text-muted-foreground">Nothing here.</p>
                  ) : (
                    entries.map((entry) => <ProjectCard key={entry.project} entry={entry} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
