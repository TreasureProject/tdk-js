import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDateDaysFromNow,
  getDateHoursFromNow,
  getDateSecondsFromNow,
  getDateYearsFromNow,
} from "./date";

describe("date utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 4, 11));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gets date seconds from now", () => {
    expect(getDateSecondsFromNow(5)).toEqual(new Date(2024, 5, 4, 11, 0, 5));
    expect(getDateSecondsFromNow(-1)).toEqual(new Date(2024, 5, 4, 10, 59, 59));
  });

  it("gets date hours from now", () => {
    expect(getDateHoursFromNow(5)).toEqual(new Date(2024, 5, 4, 16));
    expect(getDateHoursFromNow(-1)).toEqual(new Date(2024, 5, 4, 10));
  });

  it("gets date days from now", () => {
    expect(getDateDaysFromNow(5)).toEqual(new Date(2024, 5, 9, 11));
    expect(getDateDaysFromNow(-1)).toEqual(new Date(2024, 5, 3, 11));
  });

  it("gets date years from now", () => {
    expect(getDateYearsFromNow(1)).toEqual(new Date(2025, 5, 4, 11));
    expect(getDateYearsFromNow(-1)).toEqual(new Date(2023, 5, 5, 11)); // includes leap year
  });
});
