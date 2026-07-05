import "./load-env";

import { eq } from "drizzle-orm";

import { db, pool } from "../src/lib/db/client";
import { lessonOfferings } from "../src/lib/db/schema";

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
      console.log("Seeded lesson offerings.");
    })
    .finally(() => pool.end());
}
