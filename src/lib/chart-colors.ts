/**
 * Chart color tokens shared by the insights dashboard. Recharts needs concrete
 * color strings (not Tailwind classes), so these are plain hex values rather
 * than the app's `hsl(var(--x))` design tokens — chosen to read consistently
 * in both light and dark, and to keep meaning across the app.
 */

import type { HoursType } from "@/lib/report-schema";
import type { TeamReportStatus } from "@/lib/types";

/** Same status → color mapping as the status badges, in a form SVG can use. */
export const STATUS_COLORS: Record<TeamReportStatus, string> = {
  NOT_STARTED: "#cbd5e1", // slate-300
  DRAFT: "#94a3b8", // slate-400
  SUBMITTED: "#3b82f6", // blue-500
  NEEDS_CORRECTION: "#f59e0b", // amber-500
  APPROVED: "#10b981", // emerald-500
};

export const HOURS_TYPE_COLORS: Record<HoursType, string> = {
  development: "#2563eb", // blue-600
  testing: "#16a34a", // green-600
  meetings: "#d97706", // amber-600
  documentation: "#7c3aed", // violet-600
  other: "#64748b", // slate-500
};

/** Qualitative palette for series that aren't otherwise semantically colored
 * (per-member trend lines, per-project bars). */
const CHART_PALETTE = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#db2777", // pink-600
  "#65a30d", // lime-600
];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Shared axis / grid tones that follow the app's light/dark theme tokens. */
export const CHART_GRID_COLOR = "hsl(var(--border))";
export const CHART_TEXT_COLOR = "hsl(var(--muted-foreground))";
export const CHART_TICK = { fill: CHART_TEXT_COLOR, fontSize: 12 };

/** Recharts `<Tooltip>` styling, so the tooltip matches the app's card chrome
 * instead of recharts' default white box. */
export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--popover-foreground))", fontWeight: 600 },
} as const;
