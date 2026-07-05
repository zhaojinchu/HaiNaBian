import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function getPortalSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requirePortalUser(locale: string) {
  const currentSession = await getPortalSession();
  if (!currentSession) redirect(`/${locale}/login`);
  return currentSession;
}

export async function requireTeacher(locale: string) {
  const currentSession = await requirePortalUser(locale);
  if (currentSession.user.role !== "teacher") {
    redirect(`/${locale}/account`);
  }
  return currentSession;
}
