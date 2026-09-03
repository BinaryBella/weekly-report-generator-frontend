import { AlertCircle } from "lucide-react";

import { formatDate, mostRecentMonday } from "@/lib/format";
import { getProjects } from "@/lib/projects";
import {
  getActivityFeed,
  getDashboardSummary,
  getHoursByType,
  getStatusByMember,
  getTasksCompletedTrend,
  getWorkloadByProject,
} from "@/lib/reports";
import { requireRole } from "@/lib/session";
import { MANAGER_ROLES } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity-feed";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { HoursByTypeChart } from "@/components/hours-by-type-chart";
import { InsightsControls, type InsightsParams } from "@/components/insights-controls";
import { InsightsSummary } from "@/components/insights-summary";
import { StatusByMemberChart } from "@/components/status-by-member-chart";
import { TasksTrendChart } from "@/components/tasks-trend-chart";
import { WorkloadByProjectChart } from "@/components/workload-by-project-chart";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TREND_WINDOWS = [4, 8, 12, 26];

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.length > 0 ? raw : undefined;
}

function validDate(value: string | string[] | undefined): string | undefined {
  const raw = first(value);
  return raw && ISO_DATE.test(raw) ? raw : undefined;
}

type SearchParams = {
  week?: string | string[];
  project_id?: string | string[];
  trend?: string | string[];
  group_by?: string | string[];
};

function ErrorNote({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(MANAGER_ROLES, "/reviews/insights");
  const sp = await searchParams;

  const week = validDate(sp.week) ?? mostRecentMonday();
  const projectId = first(sp.project_id);
  const trendWeeksRaw = Number(first(sp.trend));
  const trendWeeks = TREND_WINDOWS.includes(trendWeeksRaw) ? trendWeeksRaw : 8;
  const groupBy = first(sp.group_by) === "user" ? "user" : "team";

  const [
    summaryResult,
    trendResult,
    statusResult,
    workloadResult,
    hoursResult,
    activityResult,
    projectsResult,
  ] = await Promise.all([
    getDashboardSummary(week, projectId),
    getTasksCompletedTrend({ weeks: trendWeeks, groupBy, projectId }),
    getStatusByMember({ weekStartDate: week, projectId }),
    getWorkloadByProject(),
    getHoursByType({ projectId }),
    getActivityFeed({ limit: 20, projectId }),
    getProjects(),
  ]);

  const projectNames: Record<string, string> = {};
  const projectOptions: { id: string; name: string }[] = [];
  if ("data" in projectsResult) {
    for (const project of projectsResult.data) {
      projectNames[project.id] = project.name;
      projectOptions.push({ id: project.id, name: project.name });
    }
  }

  const params: InsightsParams = {
    week,
    project_id: projectId,
    trend: String(trendWeeks),
    group_by: groupBy,
  };
  const projectSuffix = projectId
    ? ` · ${projectNames[projectId] ?? "selected project"}`
    : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Team dashboard</h1>
        <p className="text-muted-foreground">
          Headline metrics and visual insights across the whole team.
        </p>
      </div>

      <DashboardTabs active="insights" />

      <InsightsControls params={params} projects={projectOptions} />

      {"error" in summaryResult ? (
        <ErrorNote message={summaryResult.error} />
      ) : (
        <InsightsSummary data={summaryResult.data} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks completed trend</CardTitle>
            <CardDescription>
              Last {trendWeeks} weeks{projectSuffix},{" "}
              {groupBy === "team" ? "team-wide" : "one line per team member"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {"error" in trendResult ? (
              <ErrorNote message={trendResult.error} />
            ) : (
              <TasksTrendChart data={trendResult.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status by team member</CardTitle>
            <CardDescription>
              Week of {formatDate(week)}
              {projectSuffix}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {"error" in statusResult ? (
              <ErrorNote message={statusResult.error} />
            ) : (
              <StatusByMemberChart data={statusResult.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workload by project</CardTitle>
            <CardDescription>
              All time — planned vs. spent hours per project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {"error" in workloadResult ? (
              <ErrorNote message={workloadResult.error} />
            ) : (
              <WorkloadByProjectChart data={workloadResult.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time spent by task type</CardTitle>
            <CardDescription>
              All time, team-wide{projectSuffix}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {"error" in hoursResult ? (
              <ErrorNote message={hoursResult.error} />
            ) : (
              <HoursByTypeChart data={hoursResult.data} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
          <CardDescription>
            Submissions and review actions, newest first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {"error" in activityResult ? (
            <ErrorNote message={activityResult.error} />
          ) : (
            <ActivityFeed
              events={activityResult.data.events}
              projectNames={projectNames}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
