import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** A single KPI tile: label, big value, and an optional detail line. */
export function StatCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "amber";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon ? (
          <span
            className={
              tone === "amber"
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            }
          >
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-primary">{value}</div>
        {detail ? (
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
