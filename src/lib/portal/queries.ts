import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  creditLedger,
  householdMembers,
  lessonOfferings,
  lessonParticipants,
  lessons,
  packages,
  paymentRecords,
  students,
  user,
} from "@/lib/db/schema";
import { ensureHouseholdForUser } from "@/lib/portal/households";

export async function getParentDashboard(userId: string) {
  const householdId = await ensureHouseholdForUser(userId);
  const learnerRows = await db
    .select({
      id: students.id,
      name: students.displayName,
      active: students.active,
    })
    .from(students)
    .where(eq(students.householdId, householdId))
    .orderBy(asc(students.displayName));

  if (learnerRows.length === 0) {
    return {
      learners: learnerRows,
      packages: [],
      completedLessons: [],
      payments: [],
    };
  }

  const learnerIds = learnerRows.map((learner) => learner.id);
  const packageRows = await db
    .select({
      id: packages.id,
      studentId: packages.studentId,
      studentName: students.displayName,
      totalCredits: packages.totalCredits,
      status: packages.status,
      startsAt: packages.startsAt,
      format: lessonOfferings.format,
      offeringNameEn: lessonOfferings.nameEn,
      offeringNameZh: lessonOfferings.nameZh,
      remainingCredits: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int`,
    })
    .from(packages)
    .innerJoin(students, eq(students.id, packages.studentId))
    .innerJoin(
      lessonOfferings,
      eq(lessonOfferings.id, packages.offeringId),
    )
    .leftJoin(creditLedger, eq(creditLedger.packageId, packages.id))
    .where(inArray(packages.studentId, learnerIds))
    .groupBy(
      packages.id,
      students.displayName,
      lessonOfferings.format,
      lessonOfferings.nameEn,
      lessonOfferings.nameZh,
    )
    .orderBy(desc(packages.startsAt));

  const completedLessonRows = await db
    .select({
      id: lessons.id,
      occurredAt: lessons.occurredAt,
      format: lessons.format,
      studentId: students.id,
      studentName: students.displayName,
    })
    .from(lessons)
    .innerJoin(
      lessonParticipants,
      eq(lessonParticipants.lessonId, lessons.id),
    )
    .innerJoin(students, eq(students.id, lessonParticipants.studentId))
    .where(
      and(
        inArray(students.id, learnerIds),
        eq(lessons.status, "completed"),
      ),
    )
    .orderBy(desc(lessons.occurredAt));

  const paymentRows = await db
    .select({
      id: paymentRecords.id,
      studentName: students.displayName,
      amountFils: paymentRecords.amountFils,
      externalReference: paymentRecords.externalReference,
      dueAt: paymentRecords.dueAt,
      status: paymentRecords.status,
      paidAt: paymentRecords.paidAt,
    })
    .from(paymentRecords)
    .innerJoin(students, eq(students.id, paymentRecords.studentId))
    .where(eq(paymentRecords.householdId, householdId))
    .orderBy(desc(paymentRecords.createdAt));

  return {
    learners: learnerRows,
    packages: packageRows,
    completedLessons: completedLessonRows,
    payments: paymentRows,
  };
}

export async function getAdminDashboard() {
  const parentRows = await db
    .select({
      userId: user.id,
      email: user.email,
      householdId: householdMembers.householdId,
    })
    .from(user)
    .leftJoin(householdMembers, eq(householdMembers.userId, user.id))
    .where(and(eq(user.role, "parent"), eq(user.loginEnabled, true)))
    .orderBy(asc(user.email));

  const learnerRows = await db
    .select({
      id: students.id,
      name: students.displayName,
      householdId: students.householdId,
      parentEmail: user.email,
    })
    .from(students)
    .innerJoin(
      householdMembers,
      eq(householdMembers.householdId, students.householdId),
    )
    .innerJoin(user, eq(user.id, householdMembers.userId))
    .where(eq(students.active, true))
    .orderBy(asc(students.displayName));

  const offeringRows = await db
    .select()
    .from(lessonOfferings)
    .where(eq(lessonOfferings.active, true))
    .orderBy(asc(lessonOfferings.code));

  const balanceRows = await db
    .select({
      packageId: packages.id,
      studentName: students.displayName,
      parentEmail: user.email,
      totalCredits: packages.totalCredits,
      status: packages.status,
      format: lessonOfferings.format,
      remainingCredits: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int`,
    })
    .from(packages)
    .innerJoin(students, eq(students.id, packages.studentId))
    .innerJoin(
      householdMembers,
      eq(householdMembers.householdId, students.householdId),
    )
    .innerJoin(user, eq(user.id, householdMembers.userId))
    .innerJoin(
      lessonOfferings,
      eq(lessonOfferings.id, packages.offeringId),
    )
    .leftJoin(creditLedger, eq(creditLedger.packageId, packages.id))
    .groupBy(
      packages.id,
      students.displayName,
      user.email,
      lessonOfferings.format,
    )
    .orderBy(asc(students.displayName), desc(packages.startsAt));

  const paymentRows = await db
    .select({
      id: paymentRecords.id,
      studentName: students.displayName,
      parentEmail: user.email,
      amountFils: paymentRecords.amountFils,
      reference: paymentRecords.externalReference,
      dueAt: paymentRecords.dueAt,
      status: paymentRecords.status,
      emailSentAt: paymentRecords.emailSentAt,
    })
    .from(paymentRecords)
    .innerJoin(students, eq(students.id, paymentRecords.studentId))
    .innerJoin(
      householdMembers,
      eq(householdMembers.householdId, paymentRecords.householdId),
    )
    .innerJoin(user, eq(user.id, householdMembers.userId))
    .orderBy(desc(paymentRecords.createdAt));

  const lessonRows = await db
    .select({
      id: lessons.id,
      occurredAt: lessons.occurredAt,
      format: lessons.format,
      status: lessons.status,
      studentName: students.displayName,
    })
    .from(lessons)
    .innerJoin(
      lessonParticipants,
      eq(lessonParticipants.lessonId, lessons.id),
    )
    .innerJoin(students, eq(students.id, lessonParticipants.studentId))
    .orderBy(desc(lessons.occurredAt))
    .limit(100);

  const lessonsById = new Map<
    string,
    {
      id: string;
      occurredAt: Date;
      format: "individual" | "pair" | "group";
      status: "completed" | "void";
      studentNames: string[];
    }
  >();
  for (const row of lessonRows) {
    const existing = lessonsById.get(row.id);
    if (existing) {
      existing.studentNames.push(row.studentName);
    } else {
      lessonsById.set(row.id, {
        id: row.id,
        occurredAt: row.occurredAt,
        format: row.format,
        status: row.status,
        studentNames: [row.studentName],
      });
    }
  }

  return {
    parents: parentRows,
    learners: learnerRows,
    offerings: offeringRows,
    balances: balanceRows,
    payments: paymentRows,
    lessons: [...lessonsById.values()],
  };
}
