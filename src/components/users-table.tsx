"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { assignRoleAction } from "@/lib/auth-actions";
import { updateUserStatusAction } from "@/lib/user-actions";
import { ROLES, type Role, type User, type UserStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function RoleCell({
  user,
  disabled,
}: {
  user: User;
  disabled: boolean;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(nextRole: string) {
    const target = nextRole as Role;
    if (target === role) return;
    const previous = role;
    setRole(target);
    setError(null);
    startTransition(async () => {
      const res = await assignRoleAction(user.id, target);
      if (!res.ok) {
        setRole(previous);
        setError(res.error ?? "Could not update the role.");
      }
    });
  }

  if (disabled) {
    return <span className="text-sm">{role}</span>;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Select value={role} onValueChange={onChange} disabled={pending}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * Enable/disable an account — this app's "remove" for a team member. Disabling
 * keeps their past reports and projects intact; it just blocks sign-in, and can
 * be reversed at any time.
 */
function StatusCell({
  user,
  disabled,
}: {
  user: User;
  disabled: boolean;
}) {
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const target: UserStatus = status === "active" ? "disabled" : "active";
    const previous = status;
    setStatus(target);
    setError(null);
    startTransition(async () => {
      const res = await updateUserStatusAction(user.id, target);
      if (!res.ok) {
        setStatus(previous);
        setError(res.error ?? "Could not update the account status.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={
            status === "active" ? "text-emerald-600" : "text-muted-foreground"
          }
        >
          {status === "active" ? "Active" : "Disabled"}
        </span>
        {!disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggle}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : status === "active" ? (
              "Disable"
            ) : (
              "Enable"
            )}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function UsersTable({
  users,
  currentUserId,
  canEditRoles,
  canEditStatus,
}: {
  users: User[];
  currentUserId: string;
  canEditRoles: boolean;
  /** Whether the caller may enable/disable accounts (Manager or Admin). */
  canEditStatus: boolean;
}) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No users found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  {user.name}
                  {isSelf ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.email}
                </td>
                <td className="py-3 pr-4">
                  <StatusCell user={user} disabled={!canEditStatus || isSelf} />
                </td>
                <td className="py-3 pr-4">
                  <RoleCell
                    user={user}
                    disabled={!canEditRoles || isSelf}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
