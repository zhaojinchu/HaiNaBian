"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton({
  locale,
  label,
}: {
  locale: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className="rounded-full border border-line px-4 py-2 text-sm transition hover:border-accent"
      onClick={async () => {
        await authClient.signOut();
        window.location.assign(`/${locale}/login`);
      }}
    >
      {label}
    </button>
  );
}
