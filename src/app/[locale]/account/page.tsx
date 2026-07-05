import { Link } from "@/i18n/navigation";
import { requirePortalUser } from "@/lib/auth-session";
import {
  derivePaymentStatus,
  formatAed,
  isGoogleBookingUrl,
} from "@/lib/portal/domain";
import { getParentDashboard } from "@/lib/portal/queries";
import { SignOutButton } from "@/components/portal/SignOutButton";

function dubaiDate(date: Date, locale: string, includeTime = false) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "zh" ? "zh" : "en";
  const currentSession = await requirePortalUser(locale);
  if (currentSession.user.role === "teacher") {
    return (
      <section className="section">
        <div className="shell max-w-3xl">
          <p className="text-sm text-ink-soft">{currentSession.user.email}</p>
          <h1 className="font-display mt-3 text-5xl">
            {locale === "zh" ? "老师管理页面" : "Teacher administration"}
          </h1>
          <p className="mt-5 text-ink-soft">
            {locale === "zh"
              ? "老师账户没有家长视图，请进入管理页面。"
              : "The teacher account does not have a parent view."}
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-accent px-5 py-3 text-white"
            >
              {locale === "zh" ? "进入管理页面" : "Open admin"}
            </Link>
            <SignOutButton
              locale={locale}
              label={locale === "zh" ? "退出" : "Sign out"}
            />
          </div>
        </div>
      </section>
    );
  }

  const dashboard = await getParentDashboard(currentSession.user.id);
  const zh = locale === "zh";
  const configuredBookingUrl = process.env.GOOGLE_BOOKING_URL ?? "";
  const bookingUrl = isGoogleBookingUrl(configuredBookingUrl)
    ? configuredBookingUrl
    : null;
  const bookingEmbedUrl = bookingUrl
    ? (() => {
        const url = new URL(bookingUrl);
        url.searchParams.set("gv", "true");
        return url.toString();
      })()
    : null;

  return (
    <section className="section">
      <div className="shell">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-ink-soft">{currentSession.user.email}</p>
            <h1 className="font-display mt-2 text-4xl sm:text-6xl">
              {zh ? "我的课程" : "My lessons"}
            </h1>
          </div>
          <SignOutButton locale={locale} label={zh ? "退出" : "Sign out"} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-line bg-white-soft p-6 sm:p-8">
            <h2 className="font-display text-2xl">{zh ? "学生" : "Learners"}</h2>
            {dashboard.learners.length ? (
              <ul className="mt-5 space-y-3">
                {dashboard.learners.map((learner) => (
                  <li key={learner.id} className="rounded-xl bg-paper p-4">
                    {learner.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-soft">
                {zh
                  ? "老师尚未为此邮箱添加学生。"
                  : "The teacher has not assigned a learner to this email yet."}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white-soft p-6 sm:p-8">
            <h2 className="font-display text-2xl">{zh ? "剩余课时" : "Lesson balance"}</h2>
            {dashboard.packages.length ? (
              <ul className="mt-5 space-y-4">
                {dashboard.packages.map((lessonPackage) => (
                  <li
                    key={lessonPackage.id}
                    className="flex items-center justify-between gap-4 rounded-xl bg-paper p-4"
                  >
                    <div>
                      <p className="font-medium">{lessonPackage.studentName}</p>
                      <p className="text-sm text-ink-soft">
                        {zh
                          ? lessonPackage.offeringNameZh
                          : lessonPackage.offeringNameEn}{" "}
                        · {lessonPackage.totalCredits === 10 ? (zh ? "十节课" : "Ten lessons") : zh ? "单节课" : "Single lesson"}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-2xl text-accent-dark">
                        {lessonPackage.remainingCredits}
                      </strong>
                      <p className="text-xs text-ink-soft">{zh ? "节剩余" : "remaining"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-soft">
                {zh ? "暂无课程套餐。" : "No lesson packages have been added yet."}
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-line bg-white-soft p-6 sm:p-8">
          <h2 className="font-display text-2xl">{zh ? "付款" : "Payments"}</h2>
          {dashboard.payments.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead className="text-ink-soft">
                  <tr className="border-b border-line">
                    <th className="pb-3 font-medium">{zh ? "学生" : "Learner"}</th>
                    <th className="pb-3 font-medium">{zh ? "发票" : "Invoice"}</th>
                    <th className="pb-3 font-medium">{zh ? "金额" : "Amount"}</th>
                    <th className="pb-3 font-medium">{zh ? "到期日" : "Due"}</th>
                    <th className="pb-3 font-medium">{zh ? "状态" : "Status"}</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {dashboard.payments.map((payment) => {
                    const status = derivePaymentStatus(
                      payment.status,
                      payment.dueAt,
                    );
                    return (
                      <tr key={payment.id} className="border-b border-line/60">
                        <td className="py-4">{payment.studentName}</td>
                        <td className="py-4">{payment.externalReference}</td>
                        <td className="py-4">{formatAed(payment.amountFils, locale)}</td>
                        <td className="py-4">{dubaiDate(payment.dueAt, locale)}</td>
                        <td className="py-4 capitalize">{status}</td>
                        <td className="py-4 text-right">
                          {payment.paymentUrl && status !== "paid" && status !== "void" ? (
                            <a
                              href={payment.paymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-full bg-accent px-4 py-2 text-white"
                            >
                              {zh ? "使用 Ziina 付款" : "Pay with Ziina"}
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-ink-soft">{zh ? "暂无付款记录。" : "No invoices have been added yet."}</p>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-line bg-white-soft p-6 sm:p-8">
          <h2 className="font-display text-2xl">{zh ? "已完成课程" : "Completed lessons"}</h2>
          {dashboard.completedLessons.length ? (
            <ul className="mt-5 divide-y divide-line">
              {dashboard.completedLessons.map((lesson) => (
                <li key={`${lesson.id}-${lesson.studentId}`} className="flex justify-between gap-4 py-4">
                  <span>{lesson.studentName}</span>
                  <time className="text-ink-soft">{dubaiDate(lesson.occurredAt, locale, true)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-soft">{zh ? "暂无已完成课程。" : "No completed lessons have been recorded yet."}</p>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-line bg-white-soft p-6 sm:p-8">
          <h2 className="font-display text-2xl">{zh ? "预约课程" : "Book a lesson"}</h2>
          <p className="mt-3 max-w-3xl text-ink-soft">
            {zh
              ? "预约后时段会立即保留。老师随后联系您确认线上或到老师家上课等细节；地点暂定。"
              : "Your time is reserved immediately. The teacher will contact you afterward to confirm online versus home and other details; location is to be confirmed."}
          </p>
          {bookingUrl && bookingEmbedUrl ? (
            <>
              <iframe
                src={bookingEmbedUrl}
                title={zh ? "Google 课程预约" : "Google lesson booking"}
                className="mt-6 h-[44rem] w-full rounded-2xl border border-line bg-white"
                loading="lazy"
              />
              <p className="mt-4">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-dark underline"
                >
                  {zh ? "如果预约页面无法显示，请直接打开。" : "Open the booking page directly if the embed does not load."}
                </a>
              </p>
            </>
          ) : (
            <p className="mt-5 rounded-xl bg-paper p-4 text-ink-soft">
              {zh ? "老师尚未添加预约页面。" : "The teacher has not added the booking page yet."}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
