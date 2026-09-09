import Link from "next/link";
import { ClipboardList, UserPlus, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DEPARTMENT_PROFILES } from "@/lib/departments";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-8">
      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardList className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Ops Tracker</h1>
        <p className="text-sm text-muted-foreground">Daily Update — pick your department</p>
      </div>

      {DEPARTMENT_PROFILES.map((p) => (
        <Link key={p.slug} href={`/${p.slug}`} className={buttonVariants({ className: "h-14 text-base" })}>
          <ClipboardList className="size-5" />
          {p.label}
        </Link>
      ))}

      <Link href="/lead-gen" className={buttonVariants({ variant: "secondary", className: "mt-2 h-14 text-base" })}>
        <UserPlus className="size-5" />
        Lead Generation
      </Link>

      <Link
        href="/dashboard"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <LayoutDashboard className="size-3.5" />
        Manager dashboard
      </Link>
    </main>
  );
}
