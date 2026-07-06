import {
  updatePaymentStatusAction,
  voidLessonAction,
} from "@/app/[locale]/admin/actions";
import {
  AdminForms,
  InvoiceEmailButton,
} from "@/components/portal/AdminForms";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { requireTeacher } from "@/lib/auth-session";
import {
  derivePaymentStatus,
  formatAed,
} from "@/lib/portal/domain";
import { getAdminDashboard } from "@/lib/portal/queries";

function dubaiDate(date: Date, locale: string, includeTime = false) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}

function defaultDubaiDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "zh" ? "zh" : "en";
  const teacher = await requireTeacher(locale);
  const dashboard = await getAdminDashboard();
  const zh = locale === "zh";

  return (
    <section className="section">
      <div className="shell">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-ink-soft">{teacher.user.email}</p>
            <h1 className="font-display mt-2 text-4xl sm:text-6xl">
              {zh ? "课程管理" : "Lesson administration"}
            </h1>
          </div>
          <SignOutButton locale={locale} label={zh ? "退出" : "Sign out"} />
        </div>

        <AdminForms
          locale={locale}
          parents={dashboard.parents}
          learners={dashboard.learners}
          offerings={dashboard.offerings}
          defaultLessonTime={defaultDubaiDateTime()}
        />

        <div className="mt-12 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-line bg-white-soft p-6">
            <h2 className="font-display text-2xl">
              {zh ? "课时余额" : "Remaining balances"}
            </h2>
            {dashboard.balances.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-ink-soft">
                    <tr className="border-b border-line">
                      <th className="pb-3 font-medium">{zh ? "学生" : "Learner"}</th>
                      <th className="pb-3 font-medium">{zh ? "家长" : "Parent"}</th>
                      <th className="pb-3 font-medium">{zh ? "形式" : "Format"}</th>
                      <th className="pb-3 text-right font-medium">{zh ? "剩余" : "Remaining"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.balances.map((balance) => (
                      <tr key={balance.packageId} className="border-b border-line/60">
                        <td className="py-3">{balance.studentName}</td>
                        <td className="py-3 text-ink-soft">{balance.parentEmail}</td>
                        <td className="py-3 capitalize">{balance.format}</td>
                        <td className="py-3 text-right font-semibold">{balance.remainingCredits}/{balance.totalCredits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-ink-soft">
                {zh ? "暂无课程套餐。" : "No lesson packages yet."}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white-soft p-6">
            <h2 className="font-display text-2xl">
              {zh ? "付款与欠款" : "Payments and outstanding invoices"}
            </h2>
            {dashboard.payments.length ? (
              <div className="mt-5 space-y-4">
                {dashboard.payments.map((payment) => {
                  const shownStatus = derivePaymentStatus(
                    payment.status,
                    payment.dueAt,
                  );
                  return (
                    <div key={payment.id} className="rounded-xl bg-paper p-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="font-medium">{payment.studentName} · {formatAed(payment.amountFils, locale)}</p>
                          <p className="text-sm text-ink-soft">{payment.parentEmail} · {payment.reference}</p>
                          <p className="mt-1 text-xs text-ink-soft">
                            {zh ? "到期" : "Due"} {dubaiDate(payment.dueAt, locale)} · <span className="capitalize">{shownStatus}</span>
                          </p>
                        </div>
                        <p className="text-xs text-ink-soft">
                          {payment.emailSentAt
                            ? `${zh ? "已发送邮件" : "Email sent"} ${dubaiDate(payment.emailSentAt, locale, true)}`
                            : zh
                              ? "尚未发送邮件"
                              : "Email not sent"}
                        </p>
                      </div>
                      <form action={updatePaymentStatusAction} className="mt-3 flex gap-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <select className="field min-h-10 py-1" name="status" defaultValue={payment.status}>
                          <option value="open">{zh ? "待付款" : "Open"}</option>
                          <option value="paid">{zh ? "已付款" : "Paid"}</option>
                          <option value="overdue">{zh ? "逾期" : "Overdue"}</option>
                          <option value="void">{zh ? "作废" : "Void"}</option>
                        </select>
                        <button className="rounded-full border border-accent px-4 text-sm text-accent-dark">
                          {zh ? "更新" : "Update"}
                        </button>
                      </form>
                      <InvoiceEmailButton
                        locale={locale}
                        paymentId={payment.id}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-ink-soft">
                {zh ? "暂无付款记录。" : "No payment records yet."}
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-line bg-white-soft p-6">
          <h2 className="font-display text-2xl">
            {zh ? "最近课程" : "Recent lessons"}
          </h2>
          {dashboard.lessons.length ? (
            <div className="mt-5 divide-y divide-line">
              {dashboard.lessons.map((lesson) => (
                <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{lesson.studentNames.join(" · ")}</p>
                    <p className="text-sm text-ink-soft">
                      {dubaiDate(lesson.occurredAt, locale, true)} · <span className="capitalize">{lesson.format}</span> · <span className="capitalize">{lesson.status}</span>
                    </p>
                  </div>
                  {lesson.status === "completed" ? (
                    <form action={voidLessonAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <button className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
                        {zh ? "作废并退回课时" : "Void and restore credits"}
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-ink-soft">
              {zh ? "暂无课程记录。" : "No lessons have been recorded yet."}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
