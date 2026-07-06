"use client";

import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

type Props = {
  locale: "en" | "zh";
  googleConfigured: boolean;
};

export function LoginForm({ locale, googleConfigured }: Props) {
  const zh = locale === "zh";
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setPending(false);
    if (result.error) {
      setMessage(result.error.message ?? (zh ? "无法发送验证码。" : "Could not send the code."));
      return;
    }
    setCodeSent(true);
    setMessage(
      zh
        ? "如果该邮箱已由老师登记，验证码将会发送。开发环境中请在 Mailpit 查看。"
        : "If the teacher has approved this email, its code will be sent. In local development, open it in Mailpit.",
    );
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const result = await authClient.signIn.emailOtp({
      email,
      otp,
    });
    setPending(false);
    if (result.error) {
      setMessage(result.error.message ?? (zh ? "验证码无效。" : "The code is invalid."));
      return;
    }
    window.location.assign(`/${locale}/account`);
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/${locale}/account`,
    });
  }

  return (
    <div className="rounded-3xl border border-line bg-white-soft p-6 shadow-soft sm:p-8">
      {googleConfigured ? (
        <>
          <button
            type="button"
            className="min-h-12 w-full rounded-full border border-line bg-white px-5 font-medium transition hover:border-accent"
            onClick={signInWithGoogle}
          >
            {zh ? "使用 Google 登录" : "Continue with Google"}
          </button>
          <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            {zh ? "或使用邮箱" : "or use email"}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : null}

      {!codeSent ? (
        <form onSubmit={sendCode} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {zh ? "邮箱地址" : "Email address"}
            </span>
            <input
              className="field"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            className="min-h-12 w-full rounded-full bg-accent px-5 font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
            disabled={pending}
          >
            {pending
              ? zh
                ? "正在发送…"
                : "Sending…"
              : zh
                ? "发送六位验证码"
                : "Send six-digit code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <p className="text-sm text-ink-soft">{email}</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {zh ? "六位验证码" : "Six-digit code"}
            </span>
            <input
              className="field text-center text-xl tracking-[0.3em]"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </label>
          <button
            className="min-h-12 w-full rounded-full bg-accent px-5 font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
            disabled={pending || otp.length !== 6}
          >
            {pending
              ? zh
                ? "正在登录…"
                : "Signing in…"
              : zh
                ? "登录"
                : "Sign in"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-accent-dark underline"
            onClick={() => {
              setCodeSent(false);
              setOtp("");
              setMessage("");
            }}
          >
            {zh ? "使用其他邮箱" : "Use a different email"}
          </button>
        </form>
      )}

      {message ? (
        <p className="mt-4 text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}
      {!googleConfigured ? (
        <p className="mt-5 text-xs text-ink-soft">
          {zh
            ? "Google 登录将在本地环境变量配置后显示。"
            : "Google sign-in appears after its local environment variables are configured."}
        </p>
      ) : null}
    </div>
  );
}
