import Link from "next/link";

import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Team status", href: "/reviews" },
  { key: "insights", label: "Insights", href: "/reviews/insights" },
] as const;

/** Switches between the Section 4 team-status view and the Section 6 insights
 * dashboard — both live under the manager-only "Team" area. */
export function DashboardTabs({
  active,
}: {
  active: (typeof TABS)[number]["key"];
}) {
  return (
    <div className="flex gap-4 border-b">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
