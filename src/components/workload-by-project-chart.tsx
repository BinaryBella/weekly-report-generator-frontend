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

import { CHART_GRID_COLOR, CHART_TICK, CHART_TOOLTIP_STYLE, paletteColor } from "@/lib/chart-colors";
import type { WorkloadByProject } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Planned vs. spent hours per project, with the full breakdown in a table below. */
export function WorkloadByProjectChart({ data }: { data: WorkloadByProject }) {
  if (data.rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No reports yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data.rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
          <XAxis
            dataKey="project_name"
            tick={CHART_TICK}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis allowDecimals={false} tick={CHART_TICK} />
          <Tooltip {...CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="planned_hours" name="Planned hours" fill={paletteColor(0)} radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent_hours" name="Spent hours" fill={paletteColor(1)} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Reports</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="text-right">Planned (h)</TableHead>
              <TableHead className="text-right">Spent (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.project_id}>
                <TableCell className="font-medium">{row.project_name}</TableCell>
                <TableCell className="text-right">{row.reports}</TableCell>
                <TableCell className="text-right">{row.tasks}</TableCell>
                <TableCell className="text-right">{row.planned_hours}</TableCell>
                <TableCell className="text-right">{row.spent_hours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
