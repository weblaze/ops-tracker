"use client";

import { useState } from "react";

type Props = {
  id: string;
  active: boolean;
  name: string;
  department?: string;
  updateAction: (formData: FormData) => void | Promise<void>;
  toggleAction: (formData: FormData) => void | Promise<void>;
};

export function EditableRow({ id, active, name, department, updateAction, toggleAction }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateAction(formData);
          setEditing(false);
        }}
        className="flex flex-wrap items-center gap-2 border-b border-gray-200 py-2"
      >
        <input type="hidden" name="id" value={id} />
        <input name="name" defaultValue={name} required className="min-h-10 rounded border border-gray-300 px-2 text-sm" />
        {department !== undefined && (
          <input
            name="department"
            defaultValue={department}
            required
            className="min-h-10 rounded border border-gray-300 px-2 text-sm"
          />
        )}
        <button type="submit" className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
          Save
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 py-2">
      <span className={`flex-1 text-sm ${active ? "" : "text-gray-400 line-through"}`}>
        {name}
        {department !== undefined && <span className="text-gray-500"> — {department}</span>}
      </span>
      <button type="button" onClick={() => setEditing(true)} className="text-sm text-blue-600 underline">
        Edit
      </button>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={String(active)} />
        <button type="submit" className="text-sm text-gray-600 underline">
          {active ? "Deactivate" : "Activate"}
        </button>
      </form>
    </div>
  );
}
