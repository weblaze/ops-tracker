"use client";

import { useActionState, useMemo, useState } from "react";
import { ChoiceGroup, Field, Select, SubmitButton, TextInput } from "@/components/ui";
import { BLOCKED_REASONS, SUPPORT_STATUS, SUPPORT_WHO, YESTERDAY_STATUS } from "@/lib/constants";
import { submitDailyUpdate, type DailyUpdateState } from "./actions";
import type { Employee, Project } from "@/lib/db";

const initialState: DailyUpdateState = { ok: false };

export function DailyUpdateForm({ employees, projects }: { employees: Employee[]; projects: Project[] }) {
  const [state, formAction, pending] = useActionState(submitDailyUpdate, initialState);
  const [formKey, setFormKey] = useState(0);

  const [employeeId, setEmployeeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [yesterdayStatus, setYesterdayStatus] = useState<string>("");
  const [blocked, setBlocked] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [paymentPending, setPaymentPending] = useState("");
  const [clientDecision, setClientDecision] = useState("");
  const [supportStatus, setSupportStatus] = useState("");

  const employee = useMemo(() => employees.find((e) => e.id === employeeId), [employees, employeeId]);
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))).sort(), [employees]);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="mb-4 text-lg font-medium text-green-800">Submitted — thanks!</p>
        <button
          type="button"
          onClick={() => {
            setEmployeeId("");
            setProjectId("");
            setYesterdayStatus("");
            setBlocked("");
            setBlockedReason("");
            setPaymentPending("");
            setClientDecision("");
            setSupportStatus("");
            setFormKey((k) => k + 1);
          }}
          className="min-h-12 rounded-lg bg-green-600 px-5 text-white font-medium active:bg-green-700"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction}>
      <Field label="Name">
        <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
          <option value="" disabled>
            Select your name
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
        <input type="hidden" name="employeeId" value={employeeId} />
        <input type="hidden" name="employeeName" value={employee?.name ?? ""} />
        <input type="hidden" name="department" value={employee?.department ?? ""} />
      </Field>

      {employee && <p className="-mt-3 mb-5 text-sm text-gray-500">Department: {employee.department}</p>}

      <Field label="Project">
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
          <option value="" disabled>
            Select project
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="projectName" value={project?.name ?? ""} />
      </Field>

      <Field label="Yesterday — Status">
        <ChoiceGroup options={YESTERDAY_STATUS} value={yesterdayStatus} onChange={setYesterdayStatus} />
        <input type="hidden" name="yesterdayStatus" value={yesterdayStatus} />
      </Field>

      {(yesterdayStatus === "Partial" || yesterdayStatus === "Not Started") && (
        <Field label="What (1 line)">
          <TextInput name="yesterdayDetail" required maxLength={200} />
        </Field>
      )}

      <Field label="Today — what will be completed">
        <TextInput name="todayPlan" required maxLength={200} />
      </Field>

      <Field label="Blocked?">
        <ChoiceGroup options={["Yes", "No"]} value={blocked} onChange={setBlocked} />
        <input type="hidden" name="blocked" value={blocked} />
      </Field>

      {blocked === "Yes" && (
        <>
          <Field label="Reason">
            <Select name="blockedReason" value={blockedReason} onChange={(e) => setBlockedReason(e.target.value)} required>
              <option value="" disabled>
                Select reason
              </option>
              {BLOCKED_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          {blockedReason === "Other Dept" && (
            <Field label="Tag Department">
              <Select name="blockedTagDepartment" required defaultValue="">
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </>
      )}

      <Field label="Payment pending and affecting this work?">
        <ChoiceGroup options={["Yes", "No"]} value={paymentPending} onChange={setPaymentPending} />
        <input type="hidden" name="paymentPending" value={paymentPending} />
      </Field>
      {paymentPending === "Yes" && (
        <Field label="Payment note (1 line)">
          <TextInput name="paymentNote" required maxLength={200} />
        </Field>
      )}

      <Field label="Client decision required?">
        <ChoiceGroup options={["Yes", "No"]} value={clientDecision} onChange={setClientDecision} />
        <input type="hidden" name="clientDecision" value={clientDecision} />
      </Field>
      {clientDecision === "Yes" && (
        <Field label="Client note (1 line)">
          <TextInput name="clientNote" required maxLength={200} />
        </Field>
      )}

      <Field label="Support needed?">
        <ChoiceGroup options={SUPPORT_STATUS} value={supportStatus} onChange={setSupportStatus} />
        <input type="hidden" name="supportStatus" value={supportStatus} />
      </Field>
      {(supportStatus === "Yes-Urgent" || supportStatus === "Yes-Can wait") && (
        <>
          <Field label="Who">
            <Select name="supportWho" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {SUPPORT_WHO.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="What (1 line)">
            <TextInput name="supportDetail" required maxLength={200} />
          </Field>
        </>
      )}

      {state.error && <p className="mb-4 text-sm text-red-600">{state.error}</p>}
      <SubmitButton pending={pending}>Submit</SubmitButton>
    </form>
  );
}
