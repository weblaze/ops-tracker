"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Field, ChoiceGroup, ChipMultiSelect } from "@/components/form-controls";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BLOCKED_REASONS, SUPPORT_STATUS, SUPPORT_WHO, YESTERDAY_STATUS } from "@/lib/constants";
import { submitDailyUpdate, type DailyUpdateState } from "./actions";
import type { Employee, Project } from "@/lib/db";

const initialState: DailyUpdateState = { ok: false };
const bigTrigger = "h-12 w-full text-base";

export function DailyUpdateForm({ employees, projects }: { employees: Employee[]; projects: Project[] }) {
  const [state, formAction, pending] = useActionState(submitDailyUpdate, initialState);
  const [formKey, setFormKey] = useState(0);

  const [employeeId, setEmployeeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [alsoProjectNames, setAlsoProjectNames] = useState<string[]>([]);
  const [yesterdayStatus, setYesterdayStatus] = useState<string>("");
  const [blocked, setBlocked] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [blockedTagDepartment, setBlockedTagDepartment] = useState("");
  const [paymentPending, setPaymentPending] = useState("");
  const [clientDecision, setClientDecision] = useState("");
  const [supportStatus, setSupportStatus] = useState("");
  const [supportWho, setSupportWho] = useState("");

  const employee = useMemo(() => employees.find((e) => e.id === employeeId), [employees, employeeId]);
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))).sort(), [employees]);
  const otherProjectNames = useMemo(() => projects.filter((p) => p.id !== projectId).map((p) => p.name), [projects, projectId]);

  if (state.ok) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="size-10 text-emerald-600" />
          <p className="text-lg font-medium text-emerald-900">Submitted — thanks!</p>
          <Button
            onClick={() => {
              setEmployeeId("");
              setProjectId("");
              setAlsoProjectNames([]);
              setYesterdayStatus("");
              setBlocked("");
              setBlockedReason("");
              setBlockedTagDepartment("");
              setPaymentPending("");
              setClientDecision("");
              setSupportStatus("");
              setSupportWho("");
              setFormKey((k) => k + 1);
            }}
            className="h-11"
          >
            Submit another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form key={formKey} action={formAction}>
      <Field label="Who's filling this out?" htmlFor="employeeId">
        <Select value={employeeId || null} onValueChange={(v) => setEmployeeId(v ?? "")}>
          <SelectTrigger id="employeeId" className={bigTrigger}>
            <SelectValue placeholder="Select your name" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="employeeName" value={employee?.name ?? ""} />
        <input type="hidden" name="department" value={employee?.department ?? ""} />
      </Field>

      {employee && <p className="-mt-3 mb-5 text-sm text-muted-foreground">Department: {employee.department}</p>}

      <Field label="Which project is this mainly about today?" htmlFor="projectId">
        <Select value={projectId || null} onValueChange={(v) => setProjectId(v ?? "")}>
          <SelectTrigger id="projectId" className={bigTrigger}>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="projectName" value={project?.name ?? ""} />
      </Field>

      {projectId && otherProjectNames.length > 0 && (
        <Field label="Any other projects you also touched today?" hint="Optional — just a quick tag, no extra detail needed.">
          <ChipMultiSelect options={otherProjectNames} values={alsoProjectNames} onChange={setAlsoProjectNames} />
          {alsoProjectNames.map((name) => (
            <input key={name} type="hidden" name="alsoProjectNames" value={name} />
          ))}
        </Field>
      )}

      <Field label="How did yesterday's work go?">
        <ChoiceGroup options={YESTERDAY_STATUS} value={yesterdayStatus} onChange={setYesterdayStatus} />
        <input type="hidden" name="yesterdayStatus" value={yesterdayStatus} />
      </Field>

      {(yesterdayStatus === "Partial" || yesterdayStatus === "Not Started") && (
        <Field label="What's left from yesterday?" htmlFor="yesterdayDetail" hint="e.g. wiring not finished, waiting on materials">
          <Input id="yesterdayDetail" name="yesterdayDetail" required maxLength={200} className="h-12 text-base" />
        </Field>
      )}

      <Field label="What will you get done today?" htmlFor="todayPlan" hint="e.g. install AHU filter, submit drawing to client">
        <Input id="todayPlan" name="todayPlan" required maxLength={200} className="h-12 text-base" />
      </Field>

      <Field label="Is anything stopping you from finishing your work?" hint="e.g. missing material, no drawing approval yet">
        <ChoiceGroup options={["Yes", "No"]} value={blocked} onChange={setBlocked} />
        <input type="hidden" name="blocked" value={blocked} />
      </Field>

      {blocked === "Yes" && (
        <>
          <Field label="What's the reason?" htmlFor="blockedReason">
            <Select value={blockedReason || null} onValueChange={(v) => setBlockedReason(v ?? "")}>
              <SelectTrigger id="blockedReason" className={bigTrigger}>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {BLOCKED_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="blockedReason" value={blockedReason} />
          </Field>
          {blockedReason === "Other Dept" && (
            <Field label="Which team is holding this up?" htmlFor="blockedTagDepartment">
              <Select value={blockedTagDepartment || null} onValueChange={(v) => setBlockedTagDepartment(v ?? "")}>
                <SelectTrigger id="blockedTagDepartment" className={bigTrigger}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="blockedTagDepartment" value={blockedTagDepartment} />
            </Field>
          )}
        </>
      )}

      <Field label="Is a pending payment slowing this down?" hint="e.g. vendor won't deliver until paid">
        <ChoiceGroup options={["Yes", "No"]} value={paymentPending} onChange={setPaymentPending} />
        <input type="hidden" name="paymentPending" value={paymentPending} />
      </Field>
      {paymentPending === "Yes" && (
        <Field label="Quick note" htmlFor="paymentNote" hint="e.g. vendor invoice unpaid, client hasn't released advance">
          <Input id="paymentNote" name="paymentNote" required maxLength={200} className="h-12 text-base" />
        </Field>
      )}

      <Field label="Are you waiting on the client to decide something?" hint="e.g. tile color, layout approval">
        <ChoiceGroup options={["Yes", "No"]} value={clientDecision} onChange={setClientDecision} />
        <input type="hidden" name="clientDecision" value={clientDecision} />
      </Field>
      {clientDecision === "Yes" && (
        <Field label="Quick note" htmlFor="clientNote" hint="e.g. waiting on client to confirm design">
          <Input id="clientNote" name="clientNote" required maxLength={200} className="h-12 text-base" />
        </Field>
      )}

      <Field label="Do you need help from someone else today?">
        <ChoiceGroup options={SUPPORT_STATUS} value={supportStatus} onChange={setSupportStatus} />
        <input type="hidden" name="supportStatus" value={supportStatus} />
      </Field>
      {(supportStatus === "Yes-Urgent" || supportStatus === "Yes-Can wait") && (
        <>
          <Field label="Who can help with this?" htmlFor="supportWho">
            <Select value={supportWho || null} onValueChange={(v) => setSupportWho(v ?? "")}>
              <SelectTrigger id="supportWho" className={bigTrigger}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORT_WHO.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="supportWho" value={supportWho} />
          </Field>
          <Field label="What do you need?" htmlFor="supportDetail" hint="e.g. Rahul on site by 2pm">
            <Input id="supportDetail" name="supportDetail" required maxLength={200} className="h-12 text-base" />
          </Field>
        </>
      )}

      {state.error && <p className="mb-4 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-13 w-full text-base">
        {pending ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
