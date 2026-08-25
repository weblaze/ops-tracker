import Link from "next/link";
import type { ReactNode } from "react";
import { listDailyUpdates } from "@/lib/daily-updates";
import { listLeads } from "@/lib/leads";
import { listEmployees, listProjects } from "@/lib/db";
import { STAGES, PRIORITIES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

type SearchParams = {
  du_from?: string;
  du_to?: string;
  du_dept?: string;
  du_project?: string;
  du_page?: string;
  lead_stage?: string;
  lead_priority?: string;
  lead_page?: string;
};

function statusBadge(row: { blocked: boolean; payment_pending: boolean; client_decision: boolean; support_status: string }) {
  if (row.blocked || row.support_status === "Yes-Urgent") return <Badge variant="destructive">Attention</Badge>;
  if (row.payment_pending || row.client_decision || row.support_status === "Yes-Can wait") {
    return <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
  }
  return <Badge variant="outline">Clear</Badge>;
}

function PagerLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  const className = buttonVariants({ variant: "outline", size: "sm", className: cn(disabled && "pointer-events-none opacity-50") });
  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Pager({ page, total, pageSize, buildHref }: { page: number; total: number; pageSize: number; buildHref: (page: number) => string }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 text-sm text-muted-foreground">
      <span>
        Page {page + 1} of {pageCount} &middot; {total} total
      </span>
      <div className="flex gap-2">
        <PagerLink href={buildHref(page - 1)} disabled={page <= 0}>
          Previous
        </PagerLink>
        <PagerLink href={buildHref(page + 1)} disabled={page + 1 >= pageCount}>
          Next
        </PagerLink>
      </div>
    </div>
  );
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const duPage = Number(sp.du_page ?? "0") || 0;
  const leadPage = Number(sp.lead_page ?? "0") || 0;

  const [updates, leads, employees, projects] = await Promise.all([
    listDailyUpdates({ from: sp.du_from, to: sp.du_to, department: sp.du_dept, project: sp.du_project }, duPage),
    listLeads({ stage: sp.lead_stage, priority: sp.lead_priority }, leadPage),
    listEmployees(),
    listProjects(),
  ]);

  const departments = Array.from(new Set(employees.map((e) => e.department))).sort();

  function duHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams({
      ...(sp.du_from && { du_from: sp.du_from }),
      ...(sp.du_to && { du_to: sp.du_to }),
      ...(sp.du_dept && { du_dept: sp.du_dept }),
      ...(sp.du_project && { du_project: sp.du_project }),
      du_page: String(duPage),
      ...overrides,
    } as Record<string, string>);
    return `/dashboard/history?${params.toString()}#updates`;
  }

  function leadHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams({
      ...(sp.lead_stage && { lead_stage: sp.lead_stage }),
      ...(sp.lead_priority && { lead_priority: sp.lead_priority }),
      lead_page: String(leadPage),
      ...overrides,
    } as Record<string, string>);
    return `/dashboard/history?${params.toString()}#leads`;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">Every past Daily Update and Lead — not just today.</p>
      </div>

      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates">Daily Updates</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" id="updates">
          <Card>
            <CardContent>
              <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" action="/dashboard/history">
                <input type="hidden" name="lead_stage" value={sp.lead_stage ?? ""} />
                <input type="hidden" name="lead_priority" value={sp.lead_priority ?? ""} />
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">From</span>
                  <input type="date" name="du_from" defaultValue={sp.du_from} className="h-9 rounded-md border px-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">To</span>
                  <input type="date" name="du_to" defaultValue={sp.du_to} className="h-9 rounded-md border px-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Department</span>
                  <select name="du_dept" defaultValue={sp.du_dept ?? ""} className="h-9 rounded-md border bg-background px-2 text-sm">
                    <option value="">All</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Project</span>
                  <select name="du_project" defaultValue={sp.du_project ?? ""} className="h-9 rounded-md border bg-background px-2 text-sm">
                    <option value="">All</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" size="sm">
                  Filter
                </Button>
              </form>

              {updates.rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No submissions match these filters.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Person</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Yesterday</TableHead>
                      <TableHead>Today</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updates.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.submitted_date}</TableCell>
                        <TableCell className="font-medium">{row.employee_name}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.project_name}</TableCell>
                        <TableCell>{row.yesterday_status}</TableCell>
                        <TableCell className="max-w-64 truncate">{row.today_plan}</TableCell>
                        <TableCell>{statusBadge(row)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Pager page={duPage} total={updates.total} pageSize={updates.pageSize} buildHref={(p) => duHref({ du_page: String(p) })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" id="leads">
          <Card>
            <CardContent>
              <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" action="/dashboard/history">
                <input type="hidden" name="du_from" value={sp.du_from ?? ""} />
                <input type="hidden" name="du_to" value={sp.du_to ?? ""} />
                <input type="hidden" name="du_dept" value={sp.du_dept ?? ""} />
                <input type="hidden" name="du_project" value={sp.du_project ?? ""} />
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Stage</span>
                  <select name="lead_stage" defaultValue={sp.lead_stage ?? ""} className="h-9 rounded-md border bg-background px-2 text-sm">
                    <option value="">All</option>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Priority</span>
                  <select name="lead_priority" defaultValue={sp.lead_priority ?? ""} className="h-9 rounded-md border bg-background px-2 text-sm">
                    <option value="">All</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" size="sm">
                  Filter
                </Button>
              </form>

              {leads.rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No leads match these filters.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead ID</TableHead>
                      <TableHead>Clinic/Project</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Next Follow-up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.rows.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Link href={`/dashboard/pipeline/${lead.id}`} className="font-medium hover:underline">
                            {lead.lead_id}
                          </Link>
                        </TableCell>
                        <TableCell>{lead.clinic_name}</TableCell>
                        <TableCell>{lead.priority}</TableCell>
                        <TableCell>{lead.stage}</TableCell>
                        <TableCell>{lead.assigned_to}</TableCell>
                        <TableCell>{lead.next_followup_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Pager page={leadPage} total={leads.total} pageSize={leads.pageSize} buildHref={(p) => leadHref({ lead_page: String(p) })} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
