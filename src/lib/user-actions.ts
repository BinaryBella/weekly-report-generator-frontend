"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, readErrorDetail } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { ROLES, type Role, type User, type UserStatus } from "@/lib/types";
import { isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/validation";

const EXPIRED = "Your session has expired. Sign in again.";
const ADMIN_PATH = "/admin";

/** Result of the invite form action (drives `useActionState`). */
export interface InviteUserState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  user?: User;
  /** Only set when the Admin left the password blank — shown once, never again. */
  temporaryPassword?: string | null;
}

/**
 * Create ("invite") a team member account. Backend: `POST /users/` (Admin
 * only) — this app has no outbound email, so the account is created directly
 * and its credentials (or a generated temporary password) are shared out of
 * band by the Admin.
 */
export async function inviteUserAction(
  _prev: InviteUserState,
  formData: FormData
): Promise<InviteUserState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "Team Member");
  const role: Role = ROLES.includes(roleRaw as Role) ? (roleRaw as Role) : "Team Member";
  const password = String(formData.get("password") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!name) {
    fieldErrors.name = "Enter their full name.";
  }
  if (!email) {
    fieldErrors.email = "Enter their email address.";
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address, e.g. name@example.com.";
  }
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Leave blank to auto-generate one, or use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const token = await getAccessToken();
  if (!token) return { error: EXPIRED };

  const res = await apiFetch("/users/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, role, ...(password ? { password } : {}) }),
  });

  if (!res.ok) {
    const detail = await readErrorDetail(res, "Could not create the account.");
    // A 400 here means the backend rejected the email (already registered).
    if (res.status === 400) return { fieldErrors: { email: detail } };
    return { error: detail };
  }

  const body = (await res.json()) as {
    user: User;
    temporary_password: string | null;
  };
  revalidatePath(ADMIN_PATH);
  return { ok: true, user: body.user, temporaryPassword: body.temporary_password };
}

/**
 * Enable or disable a user account — this app's equivalent of "removing" a
 * team member: their past reports and projects stay intact, but a disabled
 * account can no longer sign in. Backend: `PATCH /users/{id}/status`
 * (Manager/Admin only; the backend itself blocks acting on your own account).
 */
export async function updateUserStatusAction(
  userId: string,
  status: UserStatus
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: EXPIRED };

  const res = await apiFetch(`/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    return {
      ok: false,
      error: await readErrorDetail(res, "Could not update the account status."),
    };
  }

  revalidatePath(ADMIN_PATH);
  return { ok: true, user: (await res.json()) as User };
}
