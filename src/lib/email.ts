import "server-only";

import nodemailer from "nodemailer";

import { formatAed } from "@/lib/portal/domain";

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.trim();
const smtpPort = Number(process.env.SMTP_PORT ?? 1025);
const productionSmtp = process.env.NODE_ENV === "production";

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: productionSmtp && smtpPort !== 465,
  tls: productionSmtp ? { minVersion: "TLSv1.2" } : undefined,
  ...(smtpUser && smtpPassword
    ? { auth: { user: smtpUser, pass: smtpPassword } }
    : {}),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailFrom() {
  return process.env.EMAIL_FROM ?? "Hai Na Bian <lessons@localhost>";
}

export async function sendSignInOtp(email: string, otp: string) {
  await mailer.sendMail({
    from: emailFrom(),
    to: email,
    subject: "Your Hai Na Bian sign-in code",
    text: `Your sign-in code is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your Hai Na Bian sign-in code is:</p><p style="font-size:24px;letter-spacing:0.2em"><strong>${escapeHtml(otp)}</strong></p><p>It expires in 5 minutes.</p>`,
  });
}

type InvoiceEmail = {
  to: string;
  learnerName: string;
  amountFils: number;
  reference: string;
  dueAt: Date;
};

export async function sendInvoiceEmail(invoice: InvoiceEmail) {
  const amount = formatAed(invoice.amountFils, "en");
  const due = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "long",
  }).format(invoice.dueAt);
  const instructions =
    process.env.BANK_TRANSFER_INSTRUCTIONS?.trim() ||
    "Please contact the teacher for bank transfer details.";

  await mailer.sendMail({
    from: emailFrom(),
    to: invoice.to,
    subject: `Hai Na Bian invoice ${invoice.reference}`,
    text: [
      "Hai Na Bian lesson invoice",
      `Learner: ${invoice.learnerName}`,
      `Invoice: ${invoice.reference}`,
      `Amount: ${amount}`,
      `Due: ${due}`,
      "",
      "Bank transfer instructions:",
      instructions,
      "",
      `Please use ${invoice.reference} as the transfer reference. The invoice will also remain visible in your Hai Na Bian account.`,
      "",
      "海那边课程发票",
      `学生：${invoice.learnerName}`,
      `发票编号：${invoice.reference}`,
      `金额：${amount}`,
      `到期日：${due}`,
      `银行转账信息：${instructions}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h1 style="font-size:22px">Hai Na Bian lesson invoice / 海那边课程发票</h1>
        <p><strong>Learner / 学生:</strong> ${escapeHtml(invoice.learnerName)}<br>
        <strong>Invoice / 发票编号:</strong> ${escapeHtml(invoice.reference)}<br>
        <strong>Amount / 金额:</strong> ${escapeHtml(amount)}<br>
        <strong>Due / 到期日:</strong> ${escapeHtml(due)}</p>
        <h2 style="font-size:17px">Bank transfer / 银行转账</h2>
        <p style="white-space:pre-line">${escapeHtml(instructions)}</p>
        <p>Please use <strong>${escapeHtml(invoice.reference)}</strong> as the transfer reference. This invoice is also available in your Hai Na Bian account.</p>
      </div>`,
  });
}
