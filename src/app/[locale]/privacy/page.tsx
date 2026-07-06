import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export const dynamic = "force-dynamic";

const copy = {
  en: {
    title: "Privacy Policy",
    intro:
      "This policy explains how Hai Na Bian handles information used for lesson administration, authentication, scheduling and payments.",
    updated: "Last updated: 5 July 2026",
    sections: [
      {
        title: "Information we handle",
        paragraphs: [
          "Parent accounts contain a verified email address, authentication account and session records, and a parent or teacher role.",
          "The teacher may manually enter learner names, lesson packages, credit balances, lesson attendance, invoice references, invoice amounts, due dates, payment links and payment status. Parents do not submit learner profiles, addresses, telephone numbers, goals or questionnaires through the account portal.",
          "Technical security records may include session information, IP addresses, browser information, rate-limit records and administrative audit entries.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "Information is used to authenticate accounts, show each family its own lesson and payment records, administer lessons, prevent misuse and maintain an accurate credit history.",
          "We do not sell personal information or use portal information for unrelated advertising.",
        ],
      },
      {
        title: "Services involved",
        paragraphs: [
          "Google may process information when Google sign-in or the Google Calendar booking page is used. The booking page is operated by Google and may request a name and email address.",
          "Our transactional email provider processes email addresses to deliver sign-in codes and invoices. Cloudflare and our hosting provider process limited technical information needed to deliver and protect the website.",
          "These services operate under their own privacy terms. Bank transfers take place outside this website, and Hai Na Bian does not copy Google Calendar bookings into its portal database.",
        ],
      },
      {
        title: "Storage and retention",
        paragraphs: [
          "Portal records are kept while they are needed to operate the tutoring service, maintain lesson and payment histories, resolve disputes, or meet applicable record-keeping requirements. Records that are no longer needed may be deleted or anonymised.",
        ],
      },
      {
        title: "Access, correction and deletion",
        paragraphs: [
          "Parents can ask to review, correct or delete information associated with their account. Some financial, security or audit records may need to be retained where required for legitimate operational or legal reasons.",
        ],
      },
      {
        title: "Children’s information",
        paragraphs: [
          "Learner information is entered by the teacher in connection with a parent account. Parents or guardians should contact the teacher if learner information is incorrect or should be removed.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Questions or privacy requests can be sent to the email address below.",
        ],
      },
    ],
  },
  zh: {
    title: "隐私政策",
    intro:
      "本政策说明海那边如何处理用于课程管理、账户登录、预约和付款的信息。",
    updated: "最后更新：2026年7月5日",
    sections: [
      {
        title: "我们处理的信息",
        paragraphs: [
          "家长账户包含已验证的电子邮箱、登录账户和会话记录，以及家长或老师的账户角色。",
          "老师可以手动记录学生姓名、课程套餐、剩余课时、上课记录、发票编号、金额、到期日、付款链接和付款状态。家长不会通过账户页面提交学生档案、地址、电话号码、学习目标或问卷。",
          "为保障网站安全，技术记录可能包括会话信息、IP 地址、浏览器信息、访问频率限制记录和管理操作日志。",
        ],
      },
      {
        title: "信息用途",
        paragraphs: [
          "这些信息用于验证账户、向每个家庭展示其本人的课程和付款记录、管理课程、防止滥用并维护准确的课时记录。",
          "我们不会出售个人信息，也不会把账户信息用于无关广告。",
        ],
      },
      {
        title: "所使用的服务",
        paragraphs: [
          "使用 Google 登录或 Google 日历预约页面时，Google 可能处理相关信息。预约页面由 Google 提供，并可能要求姓名和电子邮箱。",
          "邮件服务商会处理电子邮箱以发送一次性登录验证码和发票。Cloudflare 和网站托管服务商会处理提供及保护网站所需的有限技术信息。",
          "这些服务受其各自的隐私条款约束。银行转账在本网站之外进行，海那边也不会把 Google 日历预约复制到网站数据库。",
        ],
      },
      {
        title: "保存期限",
        paragraphs: [
          "在提供家教服务、保存课程及付款历史、解决争议或满足适用记录要求所需期间，我们会保留相关记录。不再需要的信息可能会被删除或匿名化。",
        ],
      },
      {
        title: "查阅、更正与删除",
        paragraphs: [
          "家长可以要求查阅、更正或删除与其账户有关的信息。基于合理运营或法律需要，部分财务、安全或审计记录可能需要继续保留。",
        ],
      },
      {
        title: "儿童信息",
        paragraphs: [
          "学生信息由老师在关联家长账户后录入。如信息不正确或需要删除，家长或监护人可以直接联系老师。",
        ],
      },
      {
        title: "联系我们",
        paragraphs: ["隐私问题或相关请求可以发送至下方电子邮箱。"],
      },
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "隐私政策｜海那边" : "Privacy Policy | 海那边",
    description:
      locale === "zh"
        ? "了解海那边如何处理账户、课程、预约和付款信息。"
        : "How Hai Na Bian handles account, lesson, booking and payment information.",
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = copy[locale];
  const contactEmail =
    process.env.PRIVACY_CONTACT_EMAIL ??
    (locale === "zh" ? "隐私联系邮箱待确认" : "Privacy contact email to be confirmed");
  const contactConfigured = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);

  return (
    <section className="section">
      <div className="shell max-w-3xl">
        <p className="text-sm tracking-[0.18em] text-accent-dark uppercase">
          {locale === "zh" ? "网站政策" : "Website policy"}
        </p>
        <h1 className="font-display mt-4 text-4xl leading-tight sm:text-6xl">
          {content.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-ink-soft">{content.intro}</p>
        <p className="mt-3 text-sm text-ink-soft">{content.updated}</p>

        <div className="mt-12 space-y-10">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-3 text-ink-soft">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
          {contactConfigured ? (
            <a
              className="inline-flex text-accent-dark underline"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
          ) : (
            <p className="text-ink-soft">{contactEmail}</p>
          )}
        </div>
      </div>
    </section>
  );
}
