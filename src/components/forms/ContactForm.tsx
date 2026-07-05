"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { lessons } from "@/content/lessons";
import type { Locale } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { ContactFormProvider } from "@/components/integrations/ContactFormProvider";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  wechat: string;
  age: string;
  level: string;
  interest: string;
  method: string;
  message: string;
  consent: boolean;
}

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

function ErrorMessage({
  name,
  error,
}: {
  name: keyof ContactFormData;
  error?: string;
}) {
  return error ? (
    <p id={`${name}-error`} className="mt-1.5 text-sm text-red-800">
      {error}
    </p>
  ) : null;
}

export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale() as Locale;
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const levels = t.raw("levels") as string[];
  const methods = t.raw("methods") as string[];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    const data: ContactFormData = {
      name: String(source.get("name") ?? "").trim(),
      email: String(source.get("email") ?? "").trim(),
      phone: String(source.get("phone") ?? "").trim(),
      wechat: String(source.get("wechat") ?? "").trim(),
      age: String(source.get("age") ?? "").trim(),
      level: String(source.get("level") ?? ""),
      interest: String(source.get("interest") ?? ""),
      method: String(source.get("method") ?? ""),
      message: String(source.get("message") ?? "").trim(),
      consent: source.get("consent") === "on",
    };

    const nextErrors: FormErrors = {};
    (["name", "email", "age", "level", "interest", "method", "message"] as const).forEach(
      (field) => {
        if (!data[field]) nextErrors[field] = t("required");
      },
    );
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      nextErrors.email = t("emailInvalid");
    }
    if (!data.consent) nextErrors.consent = t("consentRequired");

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-[1.75rem] border border-accent/30 bg-accent-pale/35 p-7 sm:p-10" role="status">
        <CheckCircle2 className="size-9 text-accent-dark" aria-hidden="true" />
        <h2 className="mt-5 font-display text-3xl font-semibold">{t("successTitle")}</h2>
        <p className="mt-4 max-w-xl text-ink-soft">{t("successText")}</p>
        <Button className="mt-7" variant="secondary" onClick={() => setSuccess(false)}>
          {t("reset")}
        </Button>
      </div>
    );
  }

  const inputProps = (name: keyof ContactFormData) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-line bg-white-soft p-6 sm:p-9"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t("name")} <span aria-hidden="true">*</span>
            <input name="name" className="field mt-2" autoComplete="name" {...inputProps("name")} />
            <ErrorMessage name="name" error={errors.name} />
          </label>
          <label className="block text-sm font-medium">
            {t("email")} <span aria-hidden="true">*</span>
            <input
              name="email"
              type="email"
              className="field mt-2"
              autoComplete="email"
              {...inputProps("email")}
            />
            <ErrorMessage name="email" error={errors.email} />
          </label>
          <label className="block text-sm font-medium">
            {t("phone")}
            <input name="phone" type="tel" className="field mt-2" autoComplete="tel" />
          </label>
          <label className="block text-sm font-medium">
            {t("wechat")}
            <input name="wechat" className="field mt-2" autoComplete="off" />
          </label>
          <label className="block text-sm font-medium">
            {t("age")} <span aria-hidden="true">*</span>
            <input
              name="age"
              inputMode="numeric"
              className="field mt-2"
              {...inputProps("age")}
            />
            <ErrorMessage name="age" error={errors.age} />
          </label>
          <label className="block text-sm font-medium">
            {t("level")} <span aria-hidden="true">*</span>
            <select name="level" className="field mt-2" defaultValue="" {...inputProps("level")}>
              <option value="" disabled>{t("select")}</option>
              {levels.map((level) => <option key={level}>{level}</option>)}
            </select>
            <ErrorMessage name="level" error={errors.level} />
          </label>
          <label className="block text-sm font-medium">
            {t("interest")} <span aria-hidden="true">*</span>
            <select name="interest" className="field mt-2" defaultValue="" {...inputProps("interest")}>
              <option value="" disabled>{t("select")}</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title[locale]}</option>
              ))}
            </select>
            <ErrorMessage name="interest" error={errors.interest} />
          </label>
          <label className="block text-sm font-medium">
            {t("method")} <span aria-hidden="true">*</span>
            <select name="method" className="field mt-2" defaultValue="" {...inputProps("method")}>
              <option value="" disabled>{t("select")}</option>
              {methods.map((method) => <option key={method}>{method}</option>)}
            </select>
            <ErrorMessage name="method" error={errors.method} />
          </label>
        </div>
        <label className="mt-5 block text-sm font-medium">
          {t("message")} <span aria-hidden="true">*</span>
          <textarea name="message" rows={5} className="field mt-2 resize-y" {...inputProps("message")} />
          <ErrorMessage name="message" error={errors.message} />
        </label>
        <div className="mt-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
            <input
              name="consent"
              type="checkbox"
              className="mt-1 size-4 accent-accent-dark"
              {...inputProps("consent")}
            />
            <span>{t("consent")} <span aria-hidden="true">*</span></span>
          </label>
          <ErrorMessage name="consent" error={errors.consent} />
        </div>
        <Button type="submit" className="mt-7 w-full sm:w-auto">
          <Send className="size-4" aria-hidden="true" /> {t("submit")}
        </Button>
      </form>
      <ContactFormProvider />
    </div>
  );
}
