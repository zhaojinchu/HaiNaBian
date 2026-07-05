import { redirect } from "next/navigation";

import { LoginForm } from "@/components/portal/LoginForm";
import { authFeatures } from "@/lib/auth";
import { getPortalSession } from "@/lib/auth-session";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "zh" ? "zh" : "en";
  const currentSession = await getPortalSession();
  if (currentSession) redirect(`/${locale}/account`);
  const zh = locale === "zh";

  return (
    <section className="section">
      <div className="shell grid items-start gap-12 lg:grid-cols-[1fr_28rem]">
        <div className="max-w-2xl pt-4">
          <p className="mb-4 text-sm tracking-[0.18em] text-accent-dark uppercase">
            {zh ? "家长账户" : "Parent account"}
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">
            {zh ? "查看课程、课时与付款。" : "Lessons, balances and payments in one place."}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            {zh
              ? "使用老师已登记的邮箱登录。家长账户仅用于查看信息；学生资料与课程记录由老师管理。"
              : "Sign in with the email registered with the teacher. Parent accounts are read-only; the teacher manages learners and lesson records."}
          </p>
        </div>
        <LoginForm
          locale={locale}
          googleConfigured={authFeatures.googleConfigured}
        />
      </div>
    </section>
  );
}
