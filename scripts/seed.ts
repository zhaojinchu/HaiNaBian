import "./load-env";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";

import { TEACHER_EMAIL } from "../src/lib/auth-policy";
import { db, pool } from "../src/lib/db/client";
import { lessonOfferings, user } from "../src/lib/db/schema";

const offerings = [
  {
    code: "individual",
    format: "individual" as const,
    nameEn: "Individual lesson",
    nameZh: "一对一课程",
  },
  {
    code: "pair",
    format: "pair" as const,
    nameEn: "Two-to-one lesson",
    nameZh: "二对一课程",
  },
  {
    code: "group",
    format: "group" as const,
    nameEn: "Small group lesson",
    nameZh: "小组课程",
  },
];

export async function seed() {
  await db
    .update(user)
    .set({ role: "parent", loginEnabled: false })
    .where(and(eq(user.role, "teacher"), ne(user.email, TEACHER_EMAIL)));

  const [teacher] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, TEACHER_EMAIL))
    .limit(1);
  if (teacher) {
    await db
      .update(user)
      .set({ role: "teacher", loginEnabled: true })
      .where(eq(user.id, teacher.id));
  } else {
    await db.insert(user).values({
      id: randomUUID(),
      email: TEACHER_EMAIL,
      name: TEACHER_EMAIL,
      emailVerified: false,
      image: null,
      role: "teacher",
      loginEnabled: true,
    });
  }

  for (const offering of offerings) {
    const [existing] = await db
      .select({ id: lessonOfferings.id })
      .from(lessonOfferings)
      .where(eq(lessonOfferings.code, offering.code))
      .limit(1);

    if (existing) {
      await db
        .update(lessonOfferings)
        .set({ ...offering, active: true })
        .where(eq(lessonOfferings.id, existing.id));
    } else {
      await db.insert(lessonOfferings).values(offering);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("Seeded the teacher account and lesson offerings.");
    })
    .finally(() => pool.end());
}
