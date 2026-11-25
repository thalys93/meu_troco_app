import assert from "node:assert/strict";
import {
  clampYmdToToday,
  getBalancePeriodRange,
  getFinancialPeriodRange,
  getLocalTodayYmd,
} from "./month-range";

const base = new Date(2026, 7, 5);
assert.equal(getLocalTodayYmd(base), "2026-08-05");
assert.equal(clampYmdToToday("2026-08-31", base), "2026-08-05");
assert.equal(clampYmdToToday("2026-08-01", base), "2026-08-01");

const locked = getBalancePeriodRange(
  "2026-08",
  { startDate: "2026-08-01", endDate: "2026-08-31", dateRangeLockedToMonth: true },
  { baseDate: base }
);
assert.equal(locked.startDate, "2026-08-01");
assert.equal(locked.endDate, "2026-08-05");

const lockedFullMonth = getBalancePeriodRange(
  "2026-08",
  { startDate: "2026-08-01", endDate: "2026-08-31", dateRangeLockedToMonth: true },
  { throughFullMonth: true, baseDate: base }
);
assert.equal(lockedFullMonth.startDate, "2026-08-01");
assert.equal(lockedFullMonth.endDate, "2026-08-31");

const crossMonth = getFinancialPeriodRange("2026-08", {
  periodStartDay: 26,
  periodEndDay: 25,
});
assert.equal(crossMonth.startDate, "2026-07-26");
assert.equal(crossMonth.endDate, "2026-08-25");

const febPeriod = getFinancialPeriodRange("2026-02", {
  periodStartDay: 26,
  periodEndDay: 25,
});
assert.equal(febPeriod.startDate, "2026-01-26");
assert.equal(febPeriod.endDate, "2026-02-25");

const partialSameMonth = getFinancialPeriodRange("2026-03", {
  periodStartDay: 5,
  periodEndDay: 30,
});
assert.equal(partialSameMonth.startDate, "2026-03-05");
assert.equal(partialSameMonth.endDate, "2026-03-30");

const sameDayCross = getFinancialPeriodRange("2026-11", {
  periodStartDay: 31,
  periodEndDay: 31,
});
assert.equal(sameDayCross.startDate, "2026-10-31");
assert.equal(sameDayCross.endDate, "2026-11-30");

const sameDayCrossFeb = getFinancialPeriodRange("2026-03", {
  periodStartDay: 31,
  periodEndDay: 31,
});
assert.equal(sameDayCrossFeb.startDate, "2026-02-28");
assert.equal(sameDayCrossFeb.endDate, "2026-03-31");

const unlocked = getBalancePeriodRange(
  "2026-08",
  {
    startDate: "2026-07-30",
    endDate: "2026-08-31",
    dateRangeLockedToMonth: false,
  },
  { baseDate: base }
);
assert.equal(unlocked.startDate, "2026-07-30");
assert.equal(unlocked.endDate, "2026-08-05");

const unlockedFullMonth = getBalancePeriodRange(
  "2026-08",
  {
    startDate: "2026-07-30",
    endDate: "2026-08-31",
    dateRangeLockedToMonth: false,
  },
  { throughFullMonth: true, baseDate: base }
);
assert.equal(unlockedFullMonth.startDate, "2026-07-30");
assert.equal(unlockedFullMonth.endDate, "2026-08-31");

console.log("month-range.check.ts: ok");
