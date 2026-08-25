import { listEmployees } from "@/lib/db";
import { LeadGenForm } from "./form";

export const dynamic = "force-dynamic";

export default async function LeadGenPage() {
  const staff = await listEmployees(true);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Lead Generation</h1>
      <p className="mb-6 text-sm text-gray-500">Office staff only — new lead capture.</p>
      <LeadGenForm staff={staff} />
    </main>
  );
}
