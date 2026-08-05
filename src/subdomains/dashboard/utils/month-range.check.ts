import assert from "node:assert/strict";
import {
  clampYmdToToday,
  getBalancePeriodRange,
  getLocalTodayYmd,
} from "./month-range";

const base = new Date(2026, 7, 5);
assert.equal(getLocalTodayYmd(base), "2026-08-05");
assert.equal(clampYmdToToday("2026-08-31", base), "2026-08-05");
assert.equal(clampYmdToToday("2026-08-01", base), "2026-08-01");

const locked = getBalancePeriodRange(
  "2026-08",
  { startDate: "2026-08-01", endDate: "2026-08-31", dateRangeLockedToMonth: true },
  base
);
assert.equal(locked.startDate, "2026-07-01");
assert.equal(locked.endDate, "2026-08-05");

const unlocked = getBalancePeriodRange(
  "2026-08",
  {
    startDate: "2026-07-30",
    endDate: "2026-08-31",
    dateRangeLockedToMonth: false,
  },
  base
);
assert.equal(unlocked.startDate, "2026-07-30");
assert.equal(unlocked.endDate, "2026-08-05");

console.log("month-range.check.ts: ok");
