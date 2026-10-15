/**
 * Tiny synthesized UI sounds (Web Audio API — no asset files, no network
 * requests). Mirrors the saved.ts conventions: the preference lives in this
 * browser's localStorage and a custom event + the storage event keep every
 * surface (and other tabs) in sync.
 *
 * Sounds are interaction feedback, not decoration, so `play()` is gated hard:
 * off · prefers-reduced-motion · hidden tab · played <100ms ago → silence.
 * The AudioContext is created lazily on the first play, which is always a user
 * gesture (click/input), satisfying autoplay policies. Each sound is ≤ ~120ms
 * at low gain — audible, never loud, never overlapping.
 */
const KEY = "bongusto:sonido";
export const SOUND_EVENT = "bongusto:sound-change";

/** Minimum gap between two sounds; faster triggers are swallowed. */
export const DEBOUNCE_MS = 100;

export type SfxName = "save" | "unsave" | "copy" | "search" | "nav";

/** The conditions play() checks, collected so the gate itself stays pure. */
export interface SfxGate {
  enabled: boolean;
  reducedMotion: boolean;
  hidden: boolean;
  /** performance.now() of the last scheduled sound (-Infinity = never). */
  lastAt: number;
}

/** Pure decision: should a sound go out for this state at `now`? */
export function shouldPlay(gate: SfxGate, now: number): boolean {
  if (!gate.enabled) return false;
  if (gate.reducedMotion) return false;
  if (gate.hidden) return false;
  if (now - gate.lastAt < DEBOUNCE_MS) return false;
  return true;
}

/** Sounds default to on; a blocked storage read must never disable them. */
export function readSoundPref(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage blocked (private mode, quota): keep playing for this page view
    // instead of pretending the preference was stored.
  }
  document.dispatchEvent(new CustomEvent(SOUND_EVENT));
}

/** Run `fn` now and whenever the preference changes here or in another tab. */
export function onSoundChange(fn: () => void) {
  fn();
  document.addEventListener(SOUND_EVENT, fn);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === null) fn();
  });
}

/**
 * One sound = a few short notes. `at` is the offset from the sound's start;
 * every envelope is an instant attack into an exponential decay, so notes
 * read as ticks and pops rather than beeps. Keep totals ≤ ~120ms and gains
 * ≤ 0.2 — sfx.test.ts pins those limits.
 */
interface Note {
  type: OscillatorType;
  freq: number;
  at: number;
  dur: number;
  gain: number;
}

/** Exported so the tests can hold every sound to the quiet-and-short limits. */
export const SOUNDS: Record<SfxName, Note[]> = {
  // Two ascending notes: the classic "bookmarked" confirmation.
  save: [
    { type: "triangle", freq: 523, at: 0, dur: 0.06, gain: 0.18 },
    { type: "triangle", freq: 784, at: 0.05, dur: 0.065, gain: 0.2 },
  ],
  // One softer, lower note: something was taken away.
  unsave: [{ type: "triangle", freq: 330, at: 0, dur: 0.07, gain: 0.14 }],
  // Single high blip: the link is on the clipboard.
  copy: [{ type: "sine", freq: 880, at: 0, dur: 0.05, gain: 0.16 }],
  // Barely-there tick: search results changed.
  search: [{ type: "sine", freq: 1245, at: 0, dur: 0.03, gain: 0.1 }],
  // Soft low tick: an internal link was followed.
  nav: [{ type: "triangle", freq: 240, at: 0, dur: 0.04, gain: 0.12 }],
};

let context: AudioContext | null = null;
let lastAt = Number.NEGATIVE_INFINITY;

function audioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === "suspended") {
    // Resume after a gesture-blocked start. Legacy webkitAudioContext.resume()
    // can return undefined or throw — never let that break the caller's handler.
    try {
      const resumed = (context.resume as () => Promise<void> | undefined)();
      resumed?.catch(() => {});
    } catch {
      // A stuck context just means silence.
    }
  }
  return context;
}

function schedule(ac: AudioContext, notes: Note[]) {
  const t0 = ac.currentTime + 0.01;
  for (const note of notes) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const start = t0 + note.at;
    const end = start + note.dur;
    osc.type = note.type;
    osc.frequency.value = note.freq;
    // ~4ms attack to avoid the click of an instant-on waveform.
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.linearRampToValueAtTime(note.gain, start + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(amp).connect(ac.destination);
    osc.start(start);
    osc.stop(end);
  }
}

/** Play one of the UI sounds, subject to every gate. Fire-and-forget. */
export function play(name: SfxName) {
  const now = performance.now();
  const gate: SfxGate = {
    enabled: readSoundPref(),
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    hidden: document.visibilityState !== "visible",
    lastAt,
  };
  if (!shouldPlay(gate, now)) return;
  const ac = audioContext();
  if (!ac) return;
  lastAt = now;
  schedule(ac, SOUNDS[name]);
}
