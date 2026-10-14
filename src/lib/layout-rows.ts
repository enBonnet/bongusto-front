/**
 * Column spans (out of 12) for a magazine-style listing grid. The rhythm
 * repeats 7+5, 4+4+4, 12; a partial last row is split evenly so no row ever
 * ends with a hole.
 */
const RHYTHM: number[][] = [[7, 5], [4, 4, 4], [12]];

export function gridSpans(count: number): number[] {
  const spans: number[] = [];
  let row = 0;
  while (spans.length < count) {
    const pattern = RHYTHM[row % RHYTHM.length];
    const left = count - spans.length;
    if (left >= pattern.length) {
      spans.push(...pattern);
    } else {
      spans.push(...Array.from({ length: left }, () => 12 / left));
    }
    row++;
  }
  return spans;
}
