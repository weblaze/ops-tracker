import { listAllLeadsForBoard } from "@/lib/leads";
import { PipelineBoard } from "./board";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await listAllLeadsForBoard();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Drag a card to change its stage, or click a card for details.</p>
      </div>
      <PipelineBoard leads={leads} />
    </div>
  );
}
