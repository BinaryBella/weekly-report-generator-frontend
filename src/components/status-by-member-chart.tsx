"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_GRID_COLOR, CHART_TICK, CHART_TOOLTIP_STYLE, STATUS_COLORS } from "@/lib/chart-colors";
import { TEAM_REPORT_STATUS_LABELS, type StatusByMemberData } from "@/lib/types";

const SERIES: { key: keyof StatusByMemberData["rows"][number]; status: keyof typeof STATUS_COLORS }[] = [
  { key: "not_started", status: "NOT_STARTED" },
  { key: "draft", status: "DRAFT" },
  { key: "submitted", status: "SUBMITTED" },
  { key: "needs_correction", status: "NEEDS_CORRECTION" },
  { key: "approved", status: "APPROVED" },
];

/** Report status, stacked per team member — same colors as the status badges. */
export function StatusByMemberChart({ data }: { data: StatusByMemberData }) {
  if (data.rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No team members to show.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data.rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        <XAxis dataKey="user_name" tick={CHART_TICK} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis allowDecimals={false} tick={CHART_TICK} />
        <Tooltip {...CHART_TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map(({ key, status }) => (
          <Bar
            key={key}
            dataKey={key}
            name={TEAM_REPORT_STATUS_LABELS[status]}
            stackId="status"
            fill={STATUS_COLORS[status]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
