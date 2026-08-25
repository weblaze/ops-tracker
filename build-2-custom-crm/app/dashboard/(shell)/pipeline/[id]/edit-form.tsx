"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field } from "@/components/form-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRIORITIES, STAGES } from "@/lib/constants";
import type { LeadRow } from "@/lib/leads";
import type { Employee } from "@/lib/db";
import { updateLeadAction } from "../actions";

export function LeadEditForm({ lead, staff }: { lead: LeadRow; staff: Employee[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState(lead.priority);
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to);
  const [stage, setStage] = useState(lead.stage);
  const [nextFollowupDate, setNextFollowupDate] = useState(lead.next_followup_date);
  const [nextAction, setNextAction] = useState(lead.next_action);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateLeadAction(lead.id, {
          priority,
          assignedTo,
          stage,
          nextFollowupDate,
          nextAction,
        });
        toast.success("Lead updated");
        router.refresh();
      } catch {
        toast.error("Couldn't save — try again.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <Field label="Stage" htmlFor="stage">
        <Select value={stage} onValueChange={(v) => setStage(v ?? stage)}>
          <SelectTrigger id="stage" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Priority" htmlFor="priority">
        <Select value={priority} onValueChange={(v) => setPriority((v as LeadRow["priority"]) ?? priority)}>
          <SelectTrigger id="priority" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Assigned To" htmlFor="assignedTo">
        <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v ?? assignedTo)}>
          <SelectTrigger id="assignedTo" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Next Follow-up Date" htmlFor="nextFollowupDate">
        <Input
          id="nextFollowupDate"
          type="date"
          value={nextFollowupDate}
          onChange={(e) => setNextFollowupDate(e.target.value)}
        />
      </Field>

      <Field label="Next Action" htmlFor="nextAction">
        <Input id="nextAction" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      </Field>

      <Button onClick={handleSave} disabled={isPending} className="mt-2">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
