import { describe, expect, it } from "vitest";
import { DEBOUNCE_MS, SOUNDS, shouldPlay, type SfxGate, type SfxName } from "./sfx";

const gate = (over: Partial<SfxGate> = {}): SfxGate => ({
  enabled: true,
  reducedMotion: false,
  hidden: false,
  lastAt: Number.NEGATIVE_INFINITY,
  ...over,
});

describe("shouldPlay", () => {
  it("plays in the plain enabled case", () => {
    expect(shouldPlay(gate(), 1000)).toBe(true);
  });

  it("lets the very first sound through (never played, any clock)", () => {
    expect(shouldPlay(gate(), 0)).toBe(true);
    expect(shouldPlay(gate(), 50)).toBe(true);
  });

  it("still debounces a real first play that happened moments ago", () => {
    // lastAt = 0 is a real timestamp here (played at t=0), not "never".
    expect(shouldPlay(gate({ lastAt: 0 }), 50)).toBe(false);
  });

  it("is silent when the reader turned sounds off", () => {
    expect(shouldPlay(gate({ enabled: false }), 1000)).toBe(false);
  });

  it("is silent for prefers-reduced-motion readers", () => {
    expect(shouldPlay(gate({ reducedMotion: true }), 1000)).toBe(false);
  });

  it("is silent while the tab is hidden", () => {
    expect(shouldPlay(gate({ hidden: true }), 1000)).toBe(false);
  });

  it("swallows rapid-fire inside the debounce window, allows the next", () => {
    const t = 5000;
    expect(shouldPlay(gate({ lastAt: t }), t)).toBe(false);
    expect(shouldPlay(gate({ lastAt: t }), t + DEBOUNCE_MS - 1)).toBe(false);
    expect(shouldPlay(gate({ lastAt: t }), t + DEBOUNCE_MS)).toBe(true);
  });

  it("any single blocked gate is enough to silence", () => {
    expect(shouldPlay(gate({ enabled: false, reducedMotion: true, hidden: true }), 0)).toBe(false);
  });
});

describe("sound spec limits (quiet & short, as agreed)", () => {
  const names = Object.keys(SOUNDS) as SfxName[];

  it("defines exactly the five UI sounds, each with notes", () => {
    expect(names.sort()).toEqual(["copy", "nav", "save", "search", "unsave"]);
    for (const name of names) expect(SOUNDS[name].length).toBeGreaterThan(0);
  });

  it("matches the agreed shapes: save is two ascending notes, the rest are one", () => {
    expect(SOUNDS.save).toHaveLength(2);
    expect(SOUNDS.save[1].freq).toBeGreaterThan(SOUNDS.save[0].freq);
    for (const name of ["unsave", "copy", "search", "nav"] as SfxName[]) {
      expect(SOUNDS[name]).toHaveLength(1);
    }
  });

  it("stays quiet: gain in (0, 0.2]", () => {
    for (const name of names) {
      for (const note of SOUNDS[name]) {
        expect(note.gain).toBeGreaterThan(0);
        expect(note.gain).toBeLessThanOrEqual(0.2);
      }
    }
  });

  it("stays short: notes ≤ 80ms, whole sound ≤ 120ms", () => {
    for (const name of names) {
      const notes = SOUNDS[name];
      const total = Math.max(...notes.map((n) => n.at + n.dur));
      expect(total).toBeLessThanOrEqual(0.12);
      for (const note of notes) {
        expect(note.at).toBeGreaterThanOrEqual(0);
        expect(note.dur).toBeGreaterThan(0);
        expect(note.dur).toBeLessThanOrEqual(0.08);
        expect(note.freq).toBeGreaterThan(0);
      }
    }
  });
});
