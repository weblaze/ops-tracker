import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Flame } from "lucide-react";
import { getSubmissionTracker, getTodayRedFlags, type RedFlag } from "@/lib/daily-updates";
import { getHotLeadsDue } from "@/lib/leads";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function issueBadge(issueType: RedFlag["issueType"]) {
  if (issueType === "Blocked" || issueType === "Support-Urgent") {
    return <Badge variant="destructive">{issueType}</Badge>;
  }
  return <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">{issueType}</Badge>;
}

export default async function OverviewPage() {
  const [redFlags, tracker, hotLeads] = await Promise.all([getTodayRedFlags(), getSubmissionTracker(), getHotLeadsDue()]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Today at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted today</CardTitle>
            <ClipboardCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {tracker.submitted} <span className="text-base font-normal text-muted-foreground">/ {tracker.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open red flags</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{redFlags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hot leads due</CardTitle>
            <Flame className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{hotLeads.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&rsquo;s Red Flags</CardTitle>
          <p className="text-sm text-muted-foreground">Anyone not listed here is clear today.</p>
          <CardAction>
            <a href="/dashboard/export" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Export CSV
            </a>
          </CardAction>
        </CardHeader>
        <CardContent>
          {redFlags.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <p>Nothing flagged today.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Tagged To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redFlags.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{f.project}</TableCell>
                    <TableCell>{f.person}</TableCell>
                    <TableCell>{f.dept}</TableCell>
                    <TableCell>{issueBadge(f.issueType)}</TableCell>
                    <TableCell className="max-w-64 truncate whitespace-normal">{f.detail}</TableCell>
                    <TableCell>{f.taggedTo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {tracker.missing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tracker.missing.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Link href="/dashboard/pipeline" className={buttonVariants({ variant: "outline" })}>
          View pipeline
        </Link>
      </div>
    </div>
  );
}
