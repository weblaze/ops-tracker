"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENT_PROFILES } from "@/lib/departments";

export function AddEmployeeForm({ onAdd }: { onAdd: (name: string, department: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department) return;
    startTransition(async () => {
      try {
        await onAdd(name.trim(), department);
        toast.success("Employee added");
        setName("");
        setDepartment("");
      } catch {
        toast.error("Couldn't add — try again.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 max-w-48" />
      <Select value={department || null} onValueChange={(v) => setDepartment(v ?? "")}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENT_PROFILES.map((p) => (
            <SelectItem key={p.slug} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}

export function AddProjectForm({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await onAdd(name.trim());
        toast.success("Project added");
        setName("");
      } catch {
        toast.error("Couldn't add — try again.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 max-w-48" />
      <Button type="submit" size="sm" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}
