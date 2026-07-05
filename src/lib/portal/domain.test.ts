import { describe, expect, it } from "vitest";

import {
  assertSupportedCreditCount,
  derivePaymentStatus,
  parseAedToFils,
  remainingCredits,
  validateZiinaPaymentUrl,
} from "./domain";

describe("portal rules", () => {
  it("supports only single lessons and ten packs", () => {
    expect(() => assertSupportedCreditCount(1)).not.toThrow();
    expect(() => assertSupportedCreditCount(10)).not.toThrow();
    expect(() => assertSupportedCreditCount(5)).toThrow();
  });

  it("prevents negative credit balances", () => {
    expect(remainingCredits([10, -1, -1])).toBe(8);
    expect(() => remainingCredits([1, -1, -1])).toThrow();
  });

  it("creates exactly ten usable credits for a ten pack", () => {
    expect(remainingCredits([10])).toBe(10);
  });

  it("consumes and restores a credit with immutable entries", () => {
    expect(remainingCredits([1, -1])).toBe(0);
    expect(remainingCredits([1, -1, 1])).toBe(1);
  });

  it("tracks group learners through separate package ledgers", () => {
    const learnerBalances = [[10, -1], [1, -1], [10, -1]];
    expect(learnerBalances.map(remainingCredits)).toEqual([9, 0, 9]);
  });

  it("parses AED as integer fils", () => {
    expect(parseAedToFils("125")).toBe(12500);
    expect(parseAedToFils("125.5")).toBe(12550);
    expect(() => parseAedToFils("12.345")).toThrow();
  });

  it("only accepts the approved Ziina payment host over HTTPS", () => {
    expect(validateZiinaPaymentUrl("https://pay.ziina.com/example")).toBe(
      "https://pay.ziina.com/example",
    );
    expect(() =>
      validateZiinaPaymentUrl("https://pay.ziina.com.evil.test/example"),
    ).toThrow();
    expect(() =>
      validateZiinaPaymentUrl("http://pay.ziina.com/example"),
    ).toThrow();
  });

  it("derives overdue presentation without mutating the stored record", () => {
    const dueAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-02T00:00:00Z");
    expect(derivePaymentStatus("open", dueAt, now)).toBe("overdue");
    expect(derivePaymentStatus("paid", dueAt, now)).toBe("paid");
  });
});
