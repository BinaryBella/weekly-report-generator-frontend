import Link from "next/link";
import { CheckCircle2, Send, Undo2 } from "lucide-react";

import { formatDate, formatDateTime } from "@/lib/format";
import type { ActivityEvent, ActivityEventType } from "@/lib/types";

const EVENT_STYLE: Record<
  ActivityEventType,
  { icon: typeof Send; tone: string }
> = {
  SUBMITTED: { icon: Send, tone: "text-blue-600 dark:text-blue-400" },
  APPROVED: { icon: CheckCircle2, tone: "text-emerald-600 dark:text-emerald-400" },
  CHANGES_REQUESTED: { icon: Undo2, tone: "text-amber-600 dark:text-amber-400" },
};

function describe(event: ActivityEvent, projectName: string): string {
  const week = formatDate(event.week_start_date);
  switch (event.type) {
    case "SUBMITTED":
      return `${event.author_name} submitted their ${week} report (${projectName}) for review.`;
    case "APPROVED":
      return `${event.actor_name ?? "A manager"} approved ${event.author_name}'s ${week} report (${projectName}).`;
    case "CHANGES_REQUESTED":
      return `${event.actor_name ?? "A manager"} requested changes on ${event.author_name}'s ${week} report (${projectName}).`;
  }
}

/** Newest-first feed of submissions, approvals and change requests. */
export function ActivityFeed({
  events,
  projectNames,
}: {
  events: ActivityEvent[];
  projectNames: Record<string, string>;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event, i) => {
        const { icon: Icon, tone } = EVENT_STYLE[event.type];
        return (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 shrink-0 ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm">
                <Link
                  href={`/reviews/${event.report_id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {describe(event, projectNames[event.project_id] ?? "Unknown project")}
                </Link>
              </p>
              {event.comment ? (
                <p className="text-sm text-muted-foreground">
                  &ldquo;{event.comment}&rdquo;
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatDateTime(event.at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
