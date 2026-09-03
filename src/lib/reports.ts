import "server-only";

import { apiFetch, readErrorDetail } from "@/lib/api";
import type { Result } from "@/lib/projects";
import { getAccessToken } from "@/lib/session";
import type {
  ActivityFeed,
  DashboardSummary,
  HoursByType,
  MemberProfile,
  Report,
  ReportListResponse,
  ReportSectionKey,
  ReportStatus,
  StatusByMemberData,
  TasksCompletedTrend,
  TeamSectionResponse,
  TeamStatusResponse,
  WorkloadByProject,
} from "@/lib/types";

const MANAGER_ONLY = "Only managers and admins can view the team dashboard.";

const EXPIRED = "Your session has expired. Sign in again.";

/**
 * Load the current user's own report history, newest week first. Backend:
 * `GET /reports/me` (any authenticated user; only ever returns the caller's
 * reports). `status` narrows the list to a single lifecycle state.
 */
export async function getMyReports(options?: {
  status?: ReportStatus;
  page?: number;
  pageSize?: number;
}): Promise<Result<ReportListResponse>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  params.set("page", String(options?.page ?? 1));
  params.set("page_size", String(options?.pageSize ?? 100));

  const res = await apiFetch(`/reports/me?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { error: await readErrorDetail(res, "Could not load your reports.") };
  }
  return { data: (await res.json()) as ReportListResponse };
}

/**
 * Load every team member's reports for the manager review dashboard. Backend:
 * `GET /reports/` (Manager/Admin only). Private drafts are never included. All
 * filters are optional and AND-combined.
 */
export async function getTeamReports(options?: {
  status?: ReportStatus;
  userId?: string;
  projectId?: string;
  weekStartDate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}): Promise<Result<ReportListResponse>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.userId) params.set("user_id", options.userId);
  if (options?.projectId) params.set("project_id", options.projectId);
  if (options?.weekStartDate) params.set("week_start_date", options.weekStartDate);
  if (options?.dateFrom) params.set("date_from", options.dateFrom);
  if (options?.dateTo) params.set("date_to", options.dateTo);
  params.set("page", String(options?.page ?? 1));
  params.set("page_size", String(options?.pageSize ?? 100));

  const res = await apiFetch(`/reports/?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 403) return { error: MANAGER_ONLY };
  if (!res.ok) {
    return { error: await readErrorDetail(res, "Could not load team reports.") };
  }
  return { data: (await res.json()) as ReportListResponse };
}

/**
 * Per-member submission status for a selected week. Backend:
 * `GET /reports/dashboard/status` (Manager/Admin only). One row per team member,
 * including those who have not started a report for that week.
 */
export async function getTeamWeekStatus(
  weekStartDate: string,
  projectId?: string
): Promise<Result<TeamStatusResponse>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const params = new URLSearchParams({ week_start_date: weekStartDate });
  if (projectId) params.set("project_id", projectId);

  const res = await apiFetch(`/reports/dashboard/status?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 403) return { error: MANAGER_ONLY };
  if (!res.ok) {
    return {
      error: await readErrorDetail(res, "Could not load the week's status."),
    };
  }
  return { data: (await res.json()) as TeamStatusResponse };
}

/**
 * One report section lined up across the whole team for a selected week.
 * Backend: `GET /reports/dashboard/section/{section}` (Manager/Admin only).
 * A member's section content is `null` while their report is a private draft.
 */
export async function getTeamSection(
  weekStartDate: string,
  section: ReportSectionKey,
  projectId?: string
): Promise<Result<TeamSectionResponse>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const params = new URLSearchParams({ week_start_date: weekStartDate });
  if (projectId) params.set("project_id", projectId);

  const res = await apiFetch(
    `/reports/dashboard/section/${section}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 403) return { error: MANAGER_ONLY };
  if (!res.ok) {
    return {
      error: await readErrorDetail(res, "Could not load the section."),
    };
  }
  return { data: (await res.json()) as TeamSectionResponse };
}

/**
 * Load one report in full. Backend: `GET /reports/{id}` — the owner always; a
 * Manager/Admin only once it has left DRAFT. A `403`/`404` is turned into a
 * friendly message rather than a raw error.
 */
export async function getReport(reportId: string): Promise<Result<Report>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const res = await apiFetch(`/reports/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return { error: "That report could not be found." };
  if (res.status === 403) {
    return { error: "You do not have access to that report." };
  }
  if (!res.ok) {
    return { error: await readErrorDetail(res, "Could not load the report.") };
  }
  return { data: (await res.json()) as Report };
}

// ---------------------------------------------------------------------------
// Section 6 — Dashboard & visual insights (Manager/Admin only)
// ---------------------------------------------------------------------------

async function dashboardGet<T>(
  path: string,
  params: Record<string, string | undefined>,
  fallback: string
): Promise<Result<T>> {
  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();

  const res = await apiFetch(`${path}${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 403) return { error: MANAGER_ONLY };
  if (!res.ok) return { error: await readErrorDetail(res, fallback) };
  return { data: (await res.json()) as T };
}

/** The four headline metrics for the selected week. */
export async function getDashboardSummary(
  weekStartDate: string,
  projectId?: string
): Promise<Result<DashboardSummary>> {
  return dashboardGet<DashboardSummary>(
    "/reports/dashboard/summary",
    { week_start_date: weekStartDate, project_id: projectId },
    "Could not load the summary."
  );
}

/** Completed-tasks trend, team-wide or per team member, over trailing weeks. */
export async function getTasksCompletedTrend(options: {
  weeks?: number;
  groupBy?: "team" | "user";
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Result<TasksCompletedTrend>> {
  return dashboardGet<TasksCompletedTrend>(
    "/reports/dashboard/charts/tasks-completed-trend",
    {
      weeks: options.weeks ? String(options.weeks) : undefined,
      group_by: options.groupBy,
      project_id: options.projectId,
      date_from: options.dateFrom,
      date_to: options.dateTo,
    },
    "Could not load the tasks-completed trend."
  );
}

/**
 * Per-member counts of reports by status. Pass `weekStartDate` alone to enable
 * the NOT_STARTED bucket for a single selected week, or a date range instead.
 */
export async function getStatusByMember(options: {
  weekStartDate?: string;
  dateFrom?: string;
  dateTo?: string;
  projectId?: string;
}): Promise<Result<StatusByMemberData>> {
  return dashboardGet<StatusByMemberData>(
    "/reports/dashboard/charts/status-by-member",
    {
      week_start_date: options.weekStartDate,
      date_from: options.dateFrom,
      date_to: options.dateTo,
      project_id: options.projectId,
    },
    "Could not load status by team member."
  );
}

/** Task / hours distribution across projects. */
export async function getWorkloadByProject(options?: {
  weekStartDate?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Result<WorkloadByProject>> {
  return dashboardGet<WorkloadByProject>(
    "/reports/dashboard/charts/workload-by-project",
    {
      week_start_date: options?.weekStartDate,
      date_from: options?.dateFrom,
      date_to: options?.dateTo,
    },
    "Could not load workload by project."
  );
}

/** Team-wide sum of the hours-worked breakdown across activity types. */
export async function getHoursByType(options?: {
  weekStartDate?: string;
  dateFrom?: string;
  dateTo?: string;
  projectId?: string;
}): Promise<Result<HoursByType>> {
  return dashboardGet<HoursByType>(
    "/reports/dashboard/charts/hours-by-type",
    {
      week_start_date: options?.weekStartDate,
      date_from: options?.dateFrom,
      date_to: options?.dateTo,
      project_id: options?.projectId,
    },
    "Could not load hours by task type."
  );
}

/** Newest-first feed of submissions, approvals and change requests. */
export async function getActivityFeed(options?: {
  limit?: number;
  projectId?: string;
}): Promise<Result<ActivityFeed>> {
  return dashboardGet<ActivityFeed>(
    "/reports/dashboard/activity",
    {
      limit: options?.limit ? String(options.limit) : undefined,
      project_id: options?.projectId,
    },
    "Could not load the activity feed."
  );
}

/**
 * One team member's profile: identity, basic all-time stats and their most
 * recent reports. Backend: `GET /reports/dashboard/member/{user_id}`
 * (Manager/Admin only). Powers the "click a team member" profile page.
 */
export async function getMemberProfile(
  userId: string,
  limit = 10
): Promise<Result<MemberProfile>> {
  return dashboardGet<MemberProfile>(
    `/reports/dashboard/member/${userId}`,
    { limit: String(limit) },
    "Could not load this team member's profile."
  );
}
