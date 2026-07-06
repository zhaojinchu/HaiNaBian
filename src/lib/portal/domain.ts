export const SUPPORTED_PACKAGE_CREDITS = [1, 10] as const;

export function assertSupportedCreditCount(value: number) {
  if (!SUPPORTED_PACKAGE_CREDITS.includes(value as 1 | 10)) {
    throw new Error("A package must contain either 1 or 10 lessons.");
  }
}

export function remainingCredits(deltas: readonly number[]) {
  const total = deltas.reduce((sum, delta) => sum + delta, 0);
  if (total < 0) {
    throw new Error("Credit balance cannot become negative.");
  }
  return total;
}

export function parseAedToFils(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid AED amount with no more than two decimals.");
  }
  const [dirhams, decimals = ""] = normalized.split(".");
  const fils = Number(dirhams) * 100 + Number(decimals.padEnd(2, "0"));
  if (!Number.isSafeInteger(fils) || fils < 0) {
    throw new Error("Enter a valid AED amount.");
  }
  return fils;
}

export function formatAed(amountFils: number, locale: string) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amountFils / 100);
}

export function isGoogleBookingUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "calendar.google.com" ||
        url.hostname === "calendar.app.google")
    );
  } catch {
    return false;
  }
}

export function isGoogleBookingEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "calendar.google.com" &&
      url.pathname.startsWith("/calendar/appointments/schedules/")
    );
  } catch {
    return false;
  }
}

export function derivePaymentStatus(
  status: "open" | "paid" | "overdue" | "void",
  dueAt: Date,
  now = new Date(),
) {
  return status === "open" && dueAt < now ? "overdue" : status;
}
