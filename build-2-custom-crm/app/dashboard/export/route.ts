import { NextRequest, NextResponse } from "next/server";
import { getTodayRedFlags } from "@/lib/daily-updates";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  const department = request.nextUrl.searchParams.get("department") || undefined;
  const project = request.nextUrl.searchParams.get("project") || undefined;

  const flags = await getTodayRedFlags({ department, project });

  const header = ["Project", "Person", "Dept", "Issue Type", "Detail", "Tagged To"];
  const rows = flags.map((f) => [f.project, f.person, f.dept, f.issueType, f.detail, f.taggedTo]);
  const csv = [header, ...rows].map((r) => r.map((c) => csvEscape(String(c))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="red-flags-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
