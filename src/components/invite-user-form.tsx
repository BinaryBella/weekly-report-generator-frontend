"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { inviteUserAction, type InviteUserState } from "@/lib/user-actions";
import { ROLES, type Role } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";

const initialState: InviteUserState = {};

/**
 * "Invite" (directly create) a team member account. There's no outbound
 * email, so on success the form shows the account details — and the
 * generated temporary password, if any — for the Admin to share themselves;
 * that password is never retrievable again after this.
 */
export function InviteUserForm({
  onClose,
  onSuccess,
}: {
  /** Dismiss the dialog — from Cancel before submit, or Done after. */
  onClose: () => void;
  /** Fires once the account exists, independent of when the dialog closes
   * (the Admin may still be copying the password). */
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(inviteUserAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};
  // Radix Select is not a native form control; mirror its value into a hidden input.
  const [role, setRole] = useState<Role>("Team Member");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (state.ok && !notifiedRef.current) {
      notifiedRef.current = true;
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  if (state.ok && state.user) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>
              Account created for <strong>{state.user.name}</strong> (
              {state.user.email}) as {state.user.role}.
            </p>
            {state.temporaryPassword ? (
              <p>
                Temporary password — shown once, share it securely:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  {state.temporaryPassword}
                </code>
              </p>
            ) : (
              <p>They can sign in with the password you set.</p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="role" value={role} />

      <div className="space-y-2">
        <Label htmlFor="invite-name">Full name</Label>
        <Input id="invite-name" name="name" autoFocus required />
        <FieldError message={fieldErrors.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" name="email" type="email" required />
        <FieldError message={fieldErrors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger id="invite-role">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-password">Temporary password</Label>
        <PasswordInput
          id="invite-password"
          name="password"
          placeholder="Leave blank to auto-generate one"
        />
        <FieldError message={fieldErrors.password} />
        <p className="text-xs text-muted-foreground">
          Shown once after creation so you can share it with them.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton pendingText="Creating…">Create account</SubmitButton>
      </div>
    </form>
  );
}
