"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ChipMultiSelect, ChoiceGroup, Field } from "@/components/form-controls";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCES, PRIORITIES, REQUIREMENTS, STAGES } from "@/lib/constants";
import { submitLead, type LeadState } from "./actions";
import type { Employee } from "@/lib/db";

const initialState: LeadState = { ok: false };
const bigTrigger = "h-12 w-full text-base";

export function LeadGenForm({ staff }: { staff: Employee[] }) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [formKey, setFormKey] = useState(0);
  const [capturedBy, setCapturedBy] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [requirement, setRequirement] = useState<string[]>([]);
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [stage, setStage] = useState("New");

  if (state.ok) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="size-10 text-emerald-600" />
          <p className="text-lg font-medium text-emerald-900">Lead saved</p>
          <Badge variant="outline" className="bg-white">
            {state.leadId}
          </Badge>
          <Button
            onClick={() => {
              setCapturedBy("");
              setLeadSource("");
              setRequirement([]);
              setPriority("");
              setAssignedTo("");
              setStage("New");
              setFormKey((k) => k + 1);
            }}
            className="h-11"
          >
            Add another lead
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form key={formKey} action={formAction}>
      <Field label="Captured By" htmlFor="capturedBy">
        <Select value={capturedBy || null} onValueChange={(v) => setCapturedBy(v ?? "")}>
          <SelectTrigger id="capturedBy" className={bigTrigger}>
            <SelectValue placeholder="Select your name" />
          </SelectTrigger>
          <SelectContent>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="capturedBy" value={capturedBy} />
      </Field>

      <Field label="Clinic/Project Name" htmlFor="clinicName">
        <Input id="clinicName" name="clinicName" required className="h-12 text-base" />
      </Field>
      <Field label="City" htmlFor="city">
        <Input id="city" name="city" required className="h-12 text-base" />
      </Field>
      <Field label="Contact Person" htmlFor="contactPerson">
        <Input id="contactPerson" name="contactPerson" required className="h-12 text-base" />
      </Field>
      <Field label="Mobile" htmlFor="mobile">
        <Input id="mobile" name="mobile" type="tel" required className="h-12 text-base" />
      </Field>

      <Field label="Lead Source" htmlFor="leadSource">
        <Select value={leadSource || null} onValueChange={(v) => setLeadSource(v ?? "")}>
          <SelectTrigger id="leadSource" className={bigTrigger}>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="leadSource" value={leadSource} />
      </Field>

      <Field label="Requirement">
        <ChipMultiSelect options={REQUIREMENTS} values={requirement} onChange={setRequirement} />
        {requirement.map((r) => (
          <input key={r} type="hidden" name="requirement" value={r} />
        ))}
      </Field>

      <Field label="Priority">
        <ChoiceGroup options={PRIORITIES} value={priority} onChange={setPriority} />
        <input type="hidden" name="priority" value={priority} />
      </Field>

      <Field label="Assigned To" htmlFor="assignedTo">
        <Select value={assignedTo || null} onValueChange={(v) => setAssignedTo(v ?? "")}>
          <SelectTrigger id="assignedTo" className={bigTrigger}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="assignedTo" value={assignedTo} />
      </Field>

      <Field label="Stage" htmlFor="stage">
        <Select value={stage} onValueChange={(v) => setStage(v ?? "New")}>
          <SelectTrigger id="stage" className={bigTrigger}>
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
        <input type="hidden" name="stage" value={stage} />
      </Field>

      <Field label="Next Follow-up Date" htmlFor="nextFollowupDate">
        <Input id="nextFollowupDate" name="nextFollowupDate" type="date" required className="h-12 text-base" />
      </Field>

      <Field label="Next Action (1 line)" htmlFor="nextAction">
        <Input id="nextAction" name="nextAction" required maxLength={200} className="h-12 text-base" />
      </Field>

      {state.error && <p className="mb-4 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-13 w-full text-base">
        {pending ? "Submitting…" : "Save Lead"}
      </Button>
    </form>
  );
}
