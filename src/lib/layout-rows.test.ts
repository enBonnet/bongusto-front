import { describe, expect, it } from "vitest";
import { gridSpans } from "./layout-rows";

const rowsOf = (spans: number[]) => {
  const rows: number[][] = [[]];
  for (const s of spans) {
    const cur = rows[rows.length - 1];
    if (cur.reduce((a, b) => a + b, 0) + s > 12) rows.push([s]);
    else cur.push(s);
  }
  return rows;
};

describe("gridSpans", () => {
  it("returns one span per item", () => {
    for (let n = 0; n <= 30; n++) expect(gridSpans(n)).toHaveLength(n);
  });

  it("always fills every row to 12 columns", () => {
    for (let n = 1; n <= 30; n++) {
      for (const row of rowsOf(gridSpans(n))) expect(row.reduce((a, b) => a + b, 0)).toBe(12);
    }
  });

  it("follows the 7+5, 4+4+4, 12 rhythm", () => {
    expect(gridSpans(6)).toEqual([7, 5, 4, 4, 4, 12]);
  });

  it("splits a partial last row evenly", () => {
    expect(gridSpans(1)).toEqual([12]);
    expect(gridSpans(8)).toEqual([7, 5, 4, 4, 4, 12, 7, 5]);
    expect(gridSpans(3)).toEqual([7, 5, 12]);
    expect(gridSpans(4)).toEqual([7, 5, 6, 6]);
  });
});
