"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { addDays, mostRecentMonday } from "@/lib/format";
import { NATIVE_SELECT_CLASS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** URL state for the insights dashboard, so the whole page is shareable. */
export interface InsightsParams {
  week: string;
  project_id?: string;
  trend?: string;
  group_by?: string;
}

const TREND_WINDOWS = [4, 8, 12, 26];

function href(params: InsightsParams, overrides: Partial<InsightsParams>): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, value);
  }
  return `/reviews/insights?${search.toString()}`;
}

export function InsightsControls({
  params,
  projects,
}: {
  params: InsightsParams;
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const set = (overrides: Partial<InsightsParams>) =>
    router.push(href(params, overrides));

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="ins-week">Week starting</Label>
        <div className="flex items-center gap-1">
          <Input
            id="ins-week"
            type="date"
            className="w-auto"
            value={params.week}
            onChange={(e) => e.target.value && set({ week: e.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => set({ week: addDays(params.week, -7) })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next week"
            onClick={() => set({ week: addDays(params.week, 7) })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => set({ week: mostRecentMonday() })}
          >
            This week
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ins-project">Project / category</Label>
        <select
          id="ins-project"
          className={NATIVE_SELECT_CLASS}
          value={params.project_id ?? ""}
          onChange={(e) => set({ project_id: e.target.value || undefined })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ins-trend">Trend window</Label>
        <select
          id="ins-trend"
          className={NATIVE_SELECT_CLASS}
          value={params.trend ?? "8"}
          onChange={(e) => set({ trend: e.target.value })}
        >
          {TREND_WINDOWS.map((w) => (
            <option key={w} value={w}>
              Last {w} weeks
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="ins-groupby">Trend grouping</Label>
        <select
          id="ins-groupby"
          className={NATIVE_SELECT_CLASS}
          value={params.group_by ?? "team"}
          onChange={(e) => set({ group_by: e.target.value })}
        >
          <option value="team">Team-wide</option>
          <option value="user">Per team member</option>
        </select>
      </div>
    </div>
  );
}
