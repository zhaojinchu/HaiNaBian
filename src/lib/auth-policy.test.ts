import { describe, expect, it } from "vitest";

import { isTeacherEmail, normalizeEmail, TEACHER_EMAIL } from "./auth-policy";

describe("portal authentication policy", () => {
  it("normalizes account emails before matching", () => {
    expect(normalizeEmail("  Parent@Example.com ")).toBe("parent@example.com");
  });

  it("recognizes only the fixed teacher email", () => {
    expect(isTeacherEmail(` ${TEACHER_EMAIL.toUpperCase()} `)).toBe(true);
    expect(isTeacherEmail("another-teacher@example.com")).toBe(false);
  });
});
