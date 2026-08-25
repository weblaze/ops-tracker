"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-5 space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Big-tap-target single-select used by the mobile entry forms. No shadcn equivalent exists for this pattern. */
export function ChoiceGroup({
  options,
  value,
  onChange,
  large = true,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  large?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          variant={value === opt ? "default" : "outline"}
          onClick={() => onChange(opt)}
          className={cn(large && "h-12 px-5 text-base")}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

export function ChipMultiSelect({
  options,
  values,
  onChange,
  large = true,
}: {
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
  large?: boolean;
}) {
  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          variant={values.includes(opt) ? "default" : "outline"}
          onClick={() => toggle(opt)}
          className={cn(large && "h-12 px-5 text-base")}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}
