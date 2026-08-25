import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLeadById } from "@/lib/leads";
import { listEmployees } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LeadEditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: PageProps<"/dashboard/pipeline/[id]">) {
  const { id } = await params;
  const [lead, staff] = await Promise.all([getLeadById(id), listEmployees(true)]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-4 text-muted-foreground">Lead not found.</p>
        <Link href="/dashboard/pipeline" className={buttonVariants({ variant: "outline" })}>
          Back to pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/pipeline" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to pipeline
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{lead.clinic_name}</h1>
          <Badge variant="outline">{lead.lead_id}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Captured by {lead.captured_by} on {lead.created_date}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">City: </span>
            {lead.city}
          </div>
          <div>
            <span className="text-muted-foreground">Contact: </span>
            {lead.contact_person}
          </div>
          <div>
            <span className="text-muted-foreground">Mobile: </span>
            {lead.mobile}
          </div>
          <div>
            <span className="text-muted-foreground">Source: </span>
            {lead.lead_source}
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Requirement: </span>
            {lead.requirement.join(", ")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status &amp; follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadEditForm lead={lead} staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
