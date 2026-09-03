"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InviteUserForm } from "@/components/invite-user-form";
import { UsersTable } from "@/components/users-table";

/**
 * The team roster: invite a new account (Admin only), assign roles (Admin
 * only), and enable/disable accounts — this app's "remove" (Manager/Admin).
 */
export function UsersManager({
  users,
  currentUserId,
  canEditRoles,
  canInvite,
}: {
  users: User[];
  currentUserId: string;
  canEditRoles: boolean;
  canInvite: boolean;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-4">
      {canInvite ? (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite team member
          </Button>
        </div>
      ) : null}

      <UsersTable
        users={users}
        currentUserId={currentUserId}
        canEditRoles={canEditRoles}
        canEditStatus
      />

      {canInvite ? (
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a team member</DialogTitle>
              <DialogDescription>
                Creates the account directly — there&apos;s no outbound email,
                so you&apos;ll share the credentials with them yourself.
              </DialogDescription>
            </DialogHeader>
            <InviteUserForm
              onClose={() => setInviteOpen(false)}
              onSuccess={() => router.refresh()}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
