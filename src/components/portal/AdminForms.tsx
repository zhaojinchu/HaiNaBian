"use client";

import { useActionState } from "react";

import {
  addLearnerAction,
  createPackageAction,
  recordLessonAction,
  type AdminActionState,
} from "@/app/[locale]/admin/actions";

const initialState: AdminActionState = { ok: false, message: "" };

function Status({ state }: { state: AdminActionState }) {
  if (!state.message) return null;
  return (
    <p
      className={`mt-3 text-sm ${state.ok ? "text-accent-dark" : "text-red-700"}`}
      role="status"
    >
      {state.message}
    </p>
  );
}

type AdminFormsProps = {
  locale: "en" | "zh";
  parents: { email: string }[];
  learners: { id: string; name: string; parentEmail: string }[];
  offerings: {
    id: string;
    nameEn: string;
    nameZh: string;
    format: "individual" | "pair" | "group";
  }[];
  defaultLessonTime: string;
};

export function AdminForms({
  locale,
  parents,
  learners,
  offerings,
  defaultLessonTime,
}: AdminFormsProps) {
  const zh = locale === "zh";
  const [learnerState, learnerAction, learnerPending] = useActionState(
    addLearnerAction,
    initialState,
  );
  const [packageState, packageAction, packagePending] = useActionState(
    createPackageAction,
    initialState,
  );
  const [lessonState, lessonAction, lessonPending] = useActionState(
    recordLessonAction,
    initialState,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-3xl border border-line bg-white-soft p-6">
        <h2 className="font-display text-2xl">
          {zh ? "添加学生" : "Add learner"}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {zh
            ? "家长必须先使用该邮箱登录注册。"
            : "The parent must first register by signing in with this email."}
        </p>
        <form action={learnerAction} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "家长邮箱" : "Parent email"}</span>
            <input
              className="field"
              type="email"
              name="email"
              list="registered-parents"
              required
            />
            <datalist id="registered-parents">
              {parents.map((parent) => (
                <option value={parent.email} key={parent.email} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "学生姓名" : "Learner name"}</span>
            <input className="field" name="displayName" required maxLength={100} />
          </label>
          <button
            className="min-h-11 w-full rounded-full bg-accent px-4 text-white disabled:opacity-60"
            disabled={learnerPending}
          >
            {learnerPending ? (zh ? "正在添加…" : "Adding…") : zh ? "添加学生" : "Add learner"}
          </button>
        </form>
        <Status state={learnerState} />
      </section>

      <section className="rounded-3xl border border-line bg-white-soft p-6">
        <h2 className="font-display text-2xl">
          {zh ? "创建套餐与发票" : "Create package and invoice"}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {zh
            ? "发票到期日自动设为创建后 14 天。"
            : "The invoice due date is set to 14 days after creation."}
        </p>
        <form action={packageAction} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "学生" : "Learner"}</span>
            <select className="field" name="studentId" required defaultValue="">
              <option value="" disabled>{zh ? "选择学生" : "Select learner"}</option>
              {learners.map((learner) => (
                <option value={learner.id} key={learner.id}>
                  {learner.name} · {learner.parentEmail}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "课程类型" : "Lesson type"}</span>
            <select className="field" name="offeringId" required defaultValue="">
              <option value="" disabled>{zh ? "选择课程类型" : "Select lesson type"}</option>
              {offerings.map((offering) => (
                <option value={offering.id} key={offering.id}>
                  {zh ? offering.nameZh : offering.nameEn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "课时" : "Package size"}</span>
            <select className="field" name="credits" defaultValue="10">
              <option value="1">{zh ? "单节课" : "Single lesson"}</option>
              <option value="10">{zh ? "十节课" : "Ten lessons"}</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm">{zh ? "金额（AED）" : "Amount (AED)"}</span>
              <input className="field" name="amountAed" inputMode="decimal" placeholder="500.00" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">{zh ? "发票编号" : "Reference"}</span>
              <input className="field" name="reference" required maxLength={100} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm">Ziina URL</span>
            <input
              className="field"
              type="url"
              name="paymentUrl"
              placeholder="https://pay.ziina.com/..."
              required
            />
          </label>
          <button
            className="min-h-11 w-full rounded-full bg-accent px-4 text-white disabled:opacity-60"
            disabled={packagePending || learners.length === 0}
          >
            {packagePending ? (zh ? "正在创建…" : "Creating…") : zh ? "创建套餐" : "Create package"}
          </button>
        </form>
        <Status state={packageState} />
      </section>

      <section className="rounded-3xl border border-line bg-white-soft p-6">
        <h2 className="font-display text-2xl">
          {zh ? "记录课程" : "Record lesson"}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {zh
            ? "系统按时间优先使用相同课程类型的有效课时。"
            : "The oldest active credit for the matching lesson type is used first."}
        </p>
        <form action={lessonAction} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "课程形式" : "Format"}</span>
            <select className="field" name="format" defaultValue="individual">
              <option value="individual">{zh ? "一对一" : "Individual"}</option>
              <option value="pair">{zh ? "二对一" : "Two-to-one"}</option>
              <option value="group">{zh ? "3–4 人小组" : "Group of 3–4"}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">{zh ? "迪拜日期与时间" : "Dubai date and time"}</span>
            <input
              className="field"
              type="datetime-local"
              name="occurredAt"
              defaultValue={defaultLessonTime}
              required
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm">{zh ? "参加学生" : "Participating learners"}</legend>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-line p-3">
              {learners.length ? learners.map((learner) => (
                <label className="flex items-start gap-2 text-sm" key={learner.id}>
                  <input className="mt-1 size-4" type="checkbox" name="studentIds" value={learner.id} />
                  <span>{learner.name}<small className="block text-ink-soft">{learner.parentEmail}</small></span>
                </label>
              )) : <p className="text-sm text-ink-soft">{zh ? "请先添加学生。" : "Add a learner first."}</p>}
            </div>
          </fieldset>
          <button
            className="min-h-11 w-full rounded-full bg-accent px-4 text-white disabled:opacity-60"
            disabled={lessonPending || learners.length === 0}
          >
            {lessonPending ? (zh ? "正在记录…" : "Recording…") : zh ? "记录并扣除课时" : "Record and deduct credit"}
          </button>
        </form>
        <Status state={lessonState} />
      </section>
    </div>
  );
}
