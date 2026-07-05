"use server";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-session";
import { db } from "@/lib/db/client";
import {
  auditLog,
  creditLedger,
  lessonOfferings,
  lessonParticipants,
  lessons,
  packages,
  paymentRecords,
  students,
  user,
} from "@/lib/db/schema";
import {
  assertSupportedCreditCount,
  parseAedToFils,
  validateZiinaPaymentUrl,
} from "@/lib/portal/domain";
import { ensureHouseholdForUser } from "@/lib/portal/households";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

const initialError: AdminActionState = { ok: false, message: "Invalid input." };

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field.trim() : "";
}

function localeFrom(formData: FormData) {
  return value(formData, "locale") === "zh" ? "zh" : "en";
}

function actionError(error: unknown): AdminActionState {
  return {
    ok: false,
    message: error instanceof Error ? error.message : initialError.message,
  };
}

function dubaiLocalToUtc(input: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    throw new Error("Enter a valid lesson date and time.");
  }
  const date = new Date(`${input}:00+04:00`);
  if (Number.isNaN(date.valueOf())) {
    throw new Error("Enter a valid lesson date and time.");
  }
  return date;
}

export async function addLearnerAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const locale = localeFrom(formData);
  try {
    const teacher = await requireTeacher(locale);
    const parsed = z
      .object({
        email: z.email().transform((email) => email.toLowerCase()),
        displayName: z.string().min(1).max(100),
      })
      .parse({
        email: value(formData, "email"),
        displayName: value(formData, "displayName"),
      });

    const [parent] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.email, parsed.email))
      .limit(1);
    if (!parent || parent.role !== "parent") {
      throw new Error("No registered parent account uses that email.");
    }

    const householdId = await ensureHouseholdForUser(parent.id);
    const [learner] = await db
      .insert(students)
      .values({
        householdId,
        displayName: parsed.displayName,
      })
      .returning({ id: students.id });
    await db.insert(auditLog).values({
      actorId: teacher.user.id,
      action: "student.created",
      entityType: "student",
      entityId: learner.id,
      payload: { parentEmail: parsed.email },
    });
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/account`);
    return { ok: true, message: "Learner added." };
  } catch (error) {
    return actionError(error);
  }
}

export async function createPackageAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const locale = localeFrom(formData);
  try {
    const teacher = await requireTeacher(locale);
    const studentId = z.uuid().parse(value(formData, "studentId"));
    const offeringId = z.uuid().parse(value(formData, "offeringId"));
    const totalCredits = z.coerce.number().int().parse(value(formData, "credits"));
    assertSupportedCreditCount(totalCredits);
    const amountFils = parseAedToFils(value(formData, "amountAed"));
    if (amountFils <= 0) throw new Error("Invoice amount must be greater than zero.");
    const externalReference = z
      .string()
      .min(1)
      .max(100)
      .parse(value(formData, "reference"));
    const paymentUrl = validateZiinaPaymentUrl(
      value(formData, "paymentUrl"),
    );

    const [learner] = await db
      .select({
        id: students.id,
        householdId: students.householdId,
      })
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.active, true)))
      .limit(1);
    if (!learner) throw new Error("Select an active learner.");

    const [offering] = await db
      .select({ id: lessonOfferings.id })
      .from(lessonOfferings)
      .where(
        and(
          eq(lessonOfferings.id, offeringId),
          eq(lessonOfferings.active, true),
        ),
      )
      .limit(1);
    if (!offering) throw new Error("Select an active lesson type.");

    const dueAt = new Date();
    dueAt.setUTCDate(dueAt.getUTCDate() + 14);

    const packageId = await db.transaction(async (tx) => {
      const [createdPackage] = await tx
        .insert(packages)
        .values({
          studentId,
          offeringId,
          totalCredits,
          createdBy: teacher.user.id,
        })
        .returning({ id: packages.id });
      await tx.insert(creditLedger).values({
        packageId: createdPackage.id,
        delta: totalCredits,
        reason: "package_grant",
        createdBy: teacher.user.id,
      });
      await tx.insert(paymentRecords).values({
        householdId: learner.householdId,
        studentId,
        packageId: createdPackage.id,
        externalReference,
        paymentUrl,
        amountFils,
        dueAt,
        createdBy: teacher.user.id,
      });
      await tx.insert(auditLog).values({
        actorId: teacher.user.id,
        action: "package.created",
        entityType: "package",
        entityId: createdPackage.id,
        payload: {
          credits: totalCredits,
          paymentReference: externalReference,
        },
      });
      return createdPackage.id;
    });

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/account`);
    return {
      ok: true,
      message: `Package ${packageId.slice(0, 8)} created with a 14-day invoice.`,
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function recordLessonAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const locale = localeFrom(formData);
  try {
    const teacher = await requireTeacher(locale);
    const format = z
      .enum(["individual", "pair", "group"])
      .parse(value(formData, "format"));
    const occurredAt = dubaiLocalToUtc(value(formData, "occurredAt"));
    const studentIds = [
      ...new Set(
        formData
          .getAll("studentIds")
          .filter((entry): entry is string => typeof entry === "string"),
      ),
    ].map((entry) => z.uuid().parse(entry));

    const expected =
      format === "individual"
        ? [1, 1]
        : format === "pair"
          ? [2, 2]
          : [3, 4];
    if (studentIds.length < expected[0] || studentIds.length > expected[1]) {
      throw new Error(
        format === "individual"
          ? "An individual lesson needs one learner."
          : format === "pair"
            ? "A two-to-one lesson needs two learners."
            : "A group lesson needs three or four learners.",
      );
    }

    await db.transaction(async (tx) => {
      const availablePackages = await tx
        .select({
          packageId: packages.id,
          studentId: packages.studentId,
          startsAt: packages.startsAt,
        })
        .from(packages)
        .innerJoin(
          lessonOfferings,
          eq(lessonOfferings.id, packages.offeringId),
        )
        .where(
          and(
            inArray(packages.studentId, studentIds),
            eq(packages.status, "active"),
            eq(lessonOfferings.format, format),
          ),
        )
        .orderBy(asc(packages.startsAt))
        .for("update", { of: packages });

      const packageByStudent = new Map<
        string,
        (typeof availablePackages)[0] & { balance: number }
      >();
      for (const candidate of availablePackages) {
        if (packageByStudent.has(candidate.studentId)) continue;
        const [balanceRow] = await tx
          .select({
            balance: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int`,
          })
          .from(creditLedger)
          .where(eq(creditLedger.packageId, candidate.packageId));
        if (balanceRow.balance > 0) {
          packageByStudent.set(candidate.studentId, {
            ...candidate,
            balance: balanceRow.balance,
          });
        }
      }
      for (const studentId of studentIds) {
        if (!packageByStudent.has(studentId)) {
          throw new Error(
            "Every selected learner needs an active package with credit for this lesson type.",
          );
        }
      }

      const [lesson] = await tx
        .insert(lessons)
        .values({
          occurredAt,
          format,
          createdBy: teacher.user.id,
        })
        .returning({ id: lessons.id });

      for (const studentId of studentIds) {
        const selectedPackage = packageByStudent.get(studentId)!;
        await tx.insert(lessonParticipants).values({
          lessonId: lesson.id,
          studentId,
          packageId: selectedPackage.packageId,
        });
        await tx.insert(creditLedger).values({
          packageId: selectedPackage.packageId,
          lessonId: lesson.id,
          delta: -1,
          reason: "lesson_used",
          createdBy: teacher.user.id,
        });
        if (selectedPackage.balance === 1) {
          await tx
            .update(packages)
            .set({ status: "exhausted" })
            .where(eq(packages.id, selectedPackage.packageId));
        }
      }
      await tx.insert(auditLog).values({
        actorId: teacher.user.id,
        action: "lesson.recorded",
        entityType: "lesson",
        entityId: lesson.id,
        payload: { format, studentIds },
      });
    });

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/account`);
    return { ok: true, message: "Lesson recorded and credits deducted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function voidLessonAction(formData: FormData) {
  const locale = localeFrom(formData);
  const teacher = await requireTeacher(locale);
  const lessonId = z.uuid().parse(value(formData, "lessonId"));

  await db.transaction(async (tx) => {
    const [lesson] = await tx
      .select({ status: lessons.status })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .for("update")
      .limit(1);
    if (!lesson) throw new Error("Lesson not found.");
    if (lesson.status === "void") throw new Error("Lesson is already void.");

    const participants = await tx
      .select({ packageId: lessonParticipants.packageId })
      .from(lessonParticipants)
      .where(eq(lessonParticipants.lessonId, lessonId));

    await tx
      .update(lessons)
      .set({
        status: "void",
        voidedAt: new Date(),
        voidedBy: teacher.user.id,
      })
      .where(eq(lessons.id, lessonId));
    for (const participant of participants) {
      await tx.insert(creditLedger).values({
        packageId: participant.packageId,
        lessonId,
        delta: 1,
        reason: "lesson_voided",
        createdBy: teacher.user.id,
      });
      await tx
        .update(packages)
        .set({ status: "active" })
        .where(eq(packages.id, participant.packageId));
    }
    await tx.insert(auditLog).values({
      actorId: teacher.user.id,
      action: "lesson.voided",
      entityType: "lesson",
      entityId: lessonId,
      payload: { creditsRestored: participants.length },
    });
  });

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/account`);
}

export async function updatePaymentStatusAction(formData: FormData) {
  const locale = localeFrom(formData);
  const teacher = await requireTeacher(locale);
  const paymentId = z.uuid().parse(value(formData, "paymentId"));
  const status = z
    .enum(["open", "paid", "overdue", "void"])
    .parse(value(formData, "status"));

  const [payment] = await db
    .update(paymentRecords)
    .set({
      status,
      paidAt: status === "paid" ? new Date() : null,
    })
    .where(eq(paymentRecords.id, paymentId))
    .returning({ id: paymentRecords.id });
  if (!payment) throw new Error("Payment not found.");
  await db.insert(auditLog).values({
    actorId: teacher.user.id,
    action: "payment.status_changed",
    entityType: "payment",
    entityId: paymentId,
    payload: { status },
  });

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/account`);
}
