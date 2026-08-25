"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STAGES } from "@/lib/constants";
import type { LeadRow } from "@/lib/leads";
import { updateLeadStageAction } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function PriorityBadge({ priority }: { priority: LeadRow["priority"] }) {
  if (priority === "Hot") return <Badge variant="destructive">Hot</Badge>;
  if (priority === "Warm") {
    return <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">Warm</Badge>;
  }
  return <Badge variant="secondary">Cold</Badge>;
}

function LeadCard({ lead }: { lead: LeadRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const overdue = lead.next_followup_date < todayISO();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm transition-shadow",
        isDragging && "opacity-50 shadow-md"
      )}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <Link href={`/dashboard/pipeline/${lead.id}`} className="text-sm font-medium hover:underline">
          {lead.clinic_name}
        </Link>
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to change stage"
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        {lead.lead_id} &middot; {lead.city}
      </p>
      <div className="flex items-center justify-between">
        <PriorityBadge priority={lead.priority} />
        <span className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
          {lead.next_followup_date}
        </span>
      </div>
    </div>
  );
}

function Column({ stage, leads }: { stage: string; leads: LeadRow[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 p-2 transition-colors",
        isOver && "bg-muted"
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{stage}</h3>
        <Badge variant="outline">{leads.length}</Badge>
      </div>
      <div className="flex min-h-8 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export function PipelineBoard({ leads: initialLeads }: { leads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const columns = useMemo(() => {
    const byStage = new Map<string, LeadRow[]>();
    for (const stage of STAGES) byStage.set(stage, []);
    for (const lead of leads) {
      const list = byStage.get(lead.stage) ?? [];
      list.push(lead);
      byStage.set(lead.stage, list);
    }
    return byStage;
  }, [leads]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const newStage = String(over.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    const previousStage = lead.stage;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));

    updateLeadStageAction(leadId, newStage).catch(() => {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: previousStage } : l)));
      toast.error("Couldn't update stage — try again.");
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Column key={stage} stage={stage} leads={columns.get(stage) ?? []} />
        ))}
      </div>
    </DndContext>
  );
}
