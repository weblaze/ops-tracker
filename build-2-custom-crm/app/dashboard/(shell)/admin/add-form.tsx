"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AddEmployeeForm({ onAdd }: { onAdd: (name: string, department: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;
    startTransition(async () => {
      try {
        await onAdd(name.trim(), department.trim());
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
      <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="h-9 max-w-48" />
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
