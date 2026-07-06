import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isTeacherEmail } from "@/lib/auth-policy";

export async function getPortalSession() {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });
  if (!currentSession?.user.loginEnabled) return null;
  if (
    currentSession.user.role === "teacher" &&
    !isTeacherEmail(currentSession.user.email)
  ) {
    return null;
  }
  return currentSession;
}

export async function requirePortalUser(locale: string) {
  const currentSession = await getPortalSession();
  if (!currentSession) redirect(`/${locale}/login`);
  return currentSession;
}

export async function requireTeacher(locale: string) {
  const currentSession = await requirePortalUser(locale);
  if (
    currentSession.user.role !== "teacher" ||
    !isTeacherEmail(currentSession.user.email)
  ) {
    redirect(`/${locale}/account`);
  }
  return currentSession;
}
