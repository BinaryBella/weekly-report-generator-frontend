"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_TOOLTIP_STYLE, HOURS_TYPE_COLORS } from "@/lib/chart-colors";
import { HOURS_TYPES, HOURS_TYPE_LABELS } from "@/lib/report-schema";
import type { HoursByType } from "@/lib/types";

/** Team-wide split of logged hours across activity types, as a donut chart. */
export function HoursByTypeChart({ data }: { data: HoursByType }) {
  const slices = HOURS_TYPES.map((key) => ({
    key,
    name: HOURS_TYPE_LABELS[key],
    hours: data[key],
  })).filter((slice) => slice.hours > 0);

  if (slices.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hours logged yet — hours worked is optional on each report.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="hours"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={HOURS_TYPE_COLORS[slice.key]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}h`, ""]}
            {...CHART_TOOLTIP_STYLE}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-muted-foreground">
        {data.total}h logged across {data.reports_counted} report
        {data.reports_counted === 1 ? "" : "s"} with an hours breakdown.
      </p>
    </div>
  );
}
