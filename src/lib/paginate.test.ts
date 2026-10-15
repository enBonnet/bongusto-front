import { describe, expect, it } from "vitest";
import { buildRun, paginate } from "./paginate";

describe("buildRun", () => {
  it("lists every page when they fit (total ≤ 7)", () => {
    expect(buildRun(1, 1)).toEqual([1]);
    expect(buildRun(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the ends plus a three-page window around the current page", () => {
    expect(buildRun(11, 21)).toEqual([1, "gap", 10, 11, 12, "gap", 21]);
    expect(buildRun(1, 10)).toEqual([1, 2, "gap", 10]);
    expect(buildRun(10, 10)).toEqual([1, "gap", 9, 10]);
    expect(buildRun(4, 21)).toEqual([1, "gap", 3, 4, 5, "gap", 21]);
  });

  it("never lets a window touch an end without merging into it", () => {
    // total = 8 is the smallest condensed run; near-page filtering must not
    // duplicate the 1 or the total, nor strand a window beside an end.
    expect(buildRun(2, 8)).toEqual([1, 2, 3, "gap", 8]);
    expect(buildRun(7, 8)).toEqual([1, "gap", 6, 7, 8]);
  });

  it("always includes the current page", () => {
    for (let total = 2; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        expect(buildRun(current, total)).toContain(current);
      }
    }
  });

  it("stays bounded, strictly growing, with gaps that hide ≥ 1 page", () => {
    for (let total = 2; total <= 60; total++) {
      for (let current = 1; current <= total; current++) {
        const run = buildRun(current, total);
        expect(run.length).toBeLessThanOrEqual(7);
        let last = 0;
        let pendingGap = false;
        for (const item of run) {
          if (item === "gap") {
            pendingGap = true;
          } else {
            expect(item).toBeGreaterThan(last);
            if (pendingGap) {
              // A gap must stand for at least one hidden page, never zero.
              expect(item).toBeGreaterThanOrEqual(last + 2);
              pendingGap = false;
            }
            last = item;
          }
        }
      }
    }
  });
});

describe("paginate", () => {
  it("clamps the requested page into range", () => {
    expect(paginate([1, 2, 3], 0).current).toBe(1);
    expect(paginate([1, 2, 3], 5).current).toBe(1); // one page total
  });

  it("never produces a zero-page result for empty input", () => {
    const page = paginate([], 1);
    expect(page.total).toBe(1);
    expect(page.items).toEqual([]);
  });
});
