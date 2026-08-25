"use client";

import { useActionState, useState } from "react";
import { ChipMultiSelect, ChoiceGroup, Field, Select, SubmitButton, TextInput } from "@/components/ui";
import { LEAD_SOURCES, PRIORITIES, REQUIREMENTS, STAGES } from "@/lib/constants";
import { submitLead, type LeadState } from "./actions";
import type { Employee } from "@/lib/db";

const initialState: LeadState = { ok: false };

export function LeadGenForm({ staff }: { staff: Employee[] }) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [formKey, setFormKey] = useState(0);
  const [requirement, setRequirement] = useState<string[]>([]);
  const [priority, setPriority] = useState("");

  if (state.ok) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="mb-1 text-lg font-medium text-green-800">Lead saved</p>
        <p className="mb-4 text-sm text-green-700">{state.leadId}</p>
        <button
          type="button"
          onClick={() => {
            setRequirement([]);
            setPriority("");
            setFormKey((k) => k + 1);
          }}
          className="min-h-12 rounded-lg bg-green-600 px-5 font-medium text-white active:bg-green-700"
        >
          Add another lead
        </button>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction}>
      <Field label="Captured By">
        <Select name="capturedBy" required defaultValue="">
          <option value="" disabled>
            Select your name
          </option>
          {staff.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Clinic/Project Name">
        <TextInput name="clinicName" required />
      </Field>
      <Field label="City">
        <TextInput name="city" required />
      </Field>
      <Field label="Contact Person">
        <TextInput name="contactPerson" required />
      </Field>
      <Field label="Mobile">
        <TextInput name="mobile" type="tel" required />
      </Field>

      <Field label="Lead Source">
        <Select name="leadSource" required defaultValue="">
          <option value="" disabled>
            Select source
          </option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
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

      <Field label="Assigned To">
        <Select name="assignedTo" required defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {staff.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Stage">
        <Select name="stage" required defaultValue="New">
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Next Follow-up Date">
        <TextInput name="nextFollowupDate" type="date" required />
      </Field>

      <Field label="Next Action (1 line)">
        <TextInput name="nextAction" required maxLength={200} />
      </Field>

      {state.error && <p className="mb-4 text-sm text-red-600">{state.error}</p>}
      <SubmitButton pending={pending}>Save Lead</SubmitButton>
    </form>
  );
}
