"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  id: string;
  active: boolean;
  name: string;
  department?: string;
  onUpdate: (id: string, name: string, department?: string) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
};

export function EditableRow({ id, active, name, department, onUpdate, onToggleActive }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [deptValue, setDeptValue] = useState(department ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await onUpdate(id, nameValue, department !== undefined ? deptValue : undefined);
        toast.success("Saved");
        setEditing(false);
      } catch {
        toast.error("Couldn't save — try again.");
      }
    });
  }

  function toggle() {
    startTransition(async () => {
      try {
        await onToggleActive(id, active);
        toast.success(active ? "Deactivated" : "Activated");
      } catch {
        toast.error("Couldn't update — try again.");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b py-2 last:border-0">
        <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="h-8 w-40" />
        {department !== undefined && (
          <Input value={deptValue} onChange={(e) => setDeptValue(e.target.value)} className="h-8 w-40" />
        )}
        <Button size="sm" onClick={save} disabled={isPending}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b py-2 last:border-0">
      <span className={`flex-1 text-sm ${active ? "" : "text-muted-foreground line-through"}`}>
        {name}
        {department !== undefined && <span className="text-muted-foreground"> — {department}</span>}
      </span>
      {!active && (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      )}
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
        Edit
      </Button>
      {active ? (
        <AlertDialog>
          <AlertDialogTrigger render={<Button size="sm" variant="ghost" className="text-muted-foreground" />}>
            Deactivate
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {name}?</AlertDialogTitle>
              <AlertDialogDescription>
                They&rsquo;ll disappear from the entry-form dropdowns immediately. You can reactivate them any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={toggle}>Deactivate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button size="sm" variant="ghost" onClick={toggle} disabled={isPending}>
          Activate
        </Button>
      )}
    </div>
  );
}
