import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { getProjects } from "@/lib/projects";
import { getMemberProfile } from "@/lib/reports";
import { requireRole } from "@/lib/session";
import { MANAGER_ROLES } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReviewsQueue } from "@/components/reviews-queue";
import { StatCard } from "@/components/stat-card";

export const dynamic = "force-dynamic";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function BackLink() {
  return (
    <Link
      href="/reviews"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Team dashboard
    </Link>
  );
}

/**
 * Team member profile (manager view): identity, basic all-time stats, and
 * recent report history. Only reports that have left DRAFT are counted or
 * listed — a member's drafts stay private even here.
 */
export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(MANAGER_ROLES, "/reviews");
  const { id } = await params;

  const [profileResult, projectsResult] = await Promise.all([
    getMemberProfile(id, 10),
    getProjects(),
  ]);

  if ("error" in profileResult) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn&apos;t open this profile</AlertTitle>
          <AlertDescription>{profileResult.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { user, stats, recent_reports } = profileResult.data;

  const projectNames: Record<string, string> = {};
  if ("data" in projectsResult) {
    for (const project of projectsResult.data) {
      projectNames[project.id] = project.name;
    }
  }
  const memberNames = { [user.id]: user.name };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user.email} · {user.role}
            {user.status === "disabled" ? " · Account disabled" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total reports"
          value={stats.total_reports}
          detail={`${stats.submitted_count} submitted so far`}
        />
        <StatCard
          label="Approval rate"
          value={pct(stats.approval_rate)}
          detail={`${stats.approved_count} approved · ${stats.needs_correction_count} needs correction`}
        />
        <StatCard
          label="Tasks completed"
          value={stats.total_tasks_completed}
          detail="across every submitted report"
        />
        <StatCard
          label="Hours logged"
          value={`${stats.total_hours_logged}h`}
          detail={
            stats.last_submitted_at
              ? `Last submitted ${formatDateTime(stats.last_submitted_at)}`
              : "No submissions yet"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent reports</CardTitle>
          <CardDescription>
            Most recent reports that have left draft. Open one to review it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewsQueue
            items={recent_reports}
            memberNames={memberNames}
            projectNames={projectNames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
