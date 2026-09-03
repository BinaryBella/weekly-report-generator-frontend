"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CHART_GRID_COLOR,
  CHART_TICK,
  CHART_TOOLTIP_STYLE,
  paletteColor,
} from "@/lib/chart-colors";
import { formatDate } from "@/lib/format";
import type { TasksCompletedTrend } from "@/lib/types";

/**
 * Completed tasks per report-week, team-wide or one line per team member.
 * Every series shares the same trailing-weeks x-axis (the backend fills zeros
 * for a week a series has no report in), so rows line up directly.
 */
export function TasksTrendChart({ data }: { data: TasksCompletedTrend }) {
  const series = data.series;
  const weeks = series[0]?.points.map((p) => p.week_start_date) ?? [];

  if (weeks.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No reports in this window yet.
      </p>
    );
  }

  const rows = weeks.map((week, i) => {
    const row: Record<string, string | number> = { week };
    for (const s of series) row[s.key] = s.points[i]?.completed_tasks ?? 0;
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        <XAxis
          dataKey="week"
          tickFormatter={(value: string) => formatDate(value)}
          tick={CHART_TICK}
        />
        <YAxis allowDecimals={false} tick={CHART_TICK} />
        <Tooltip
          labelFormatter={(value) => formatDate(String(value))}
          {...CHART_TOOLTIP_STYLE}
        />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={paletteColor(i)}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
