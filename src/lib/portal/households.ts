import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { householdMembers, households } from "@/lib/db/schema";

export async function ensureHouseholdForUser(userId: string) {
  const [membership] = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId))
    .limit(1);

  if (membership) return membership.householdId;

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, userId))
      .limit(1);
    if (existing) return existing.householdId;

    const [household] = await tx
      .insert(households)
      .values({})
      .returning({ id: households.id });
    await tx.insert(householdMembers).values({
      householdId: household.id,
      userId,
    });
    return household.id;
  });
}
