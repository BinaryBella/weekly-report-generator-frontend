import { AlertTriangle, CheckCheck, FileWarning, Send } from "lucide-react";

import type { DashboardSummary } from "@/lib/types";
import { StatCard } from "@/components/stat-card";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** The four headline metrics for the selected week, as a KPI row. */
export function InsightsSummary({ data }: { data: DashboardSummary }) {
  const compliance = data.submission_compliance;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Send className="h-4 w-4" />}
        label="Submitted this week"
        value={data.total_submitted_this_week}
        detail={`of ${data.total_members} team member${data.total_members === 1 ? "" : "s"}`}
      />
      <StatCard
        icon={<CheckCheck className="h-4 w-4" />}
        label="Submission compliance"
        value={pct(compliance.compliance_rate)}
        detail={`${compliance.submitted} submitted · ${compliance.pending} pending · ${compliance.late} late`}
      />
      <StatCard
        icon={<FileWarning className="h-4 w-4" />}
        label="Needs correction"
        value={data.needs_correction_count}
        detail="awaiting a resubmission"
        tone={data.needs_correction_count > 0 ? "amber" : undefined}
      />
      <StatCard
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Open blockers"
        value={data.open_blockers}
        detail={`${data.open_key_issues} flagged as key issues`}
        tone={data.open_blockers > 0 ? "amber" : undefined}
      />
    </div>
  );
}
