/**
 * RegistrationAgent — the voice-driven state machine behind S3's name /
 * district / village slots.
 *
 * ★ This file did not exist anywhere in this repository, on any branch, or
 *   anywhere else on this machine before this commit — despite a report
 *   describing it as already built, "ready and waiting", with 23 passing
 *   tests. That file could not be found, so this is a fresh implementation
 *   against the interface the report described (`new RegistrationAgent
 *   (districts)`, `.next(transcript)`, `.confirm()`, `.deny()`, actions
 *   `ask`/`prefill`/`retry`/`done`), not a copy of anyone else's code. If the
 *   original file surfaces later, treat this as the thing to reconcile
 *   against it, not the other way around.
 *
 * Pure logic, no React — S3 owns rendering the question, speaking it via
 * `lib/voice.ts`, and wiring the हो/नाही buttons to `confirm()`/`deny()`.
 *
 * Slot order is fixed: name, then district, then village. Village is
 * optional (S3's own `village_label_optional` key already says so) — an
 * empty transcript on that slot is treated as "skip", not a retry.
 */

import type { District } from '../types/api';

export type RegistrationSlot = 'name' | 'district' | 'village';

export interface AskAction {
  type: 'ask';
  slot: RegistrationSlot;
  question_mr: string;
}

export interface PrefillAction {
  type: 'prefill';
  slot: RegistrationSlot;
  /** The value to write into the field — a district's `id` for the
   * `district` slot (matching what `S03_Profile.tsx`'s `districtId` state
   * already expects), the trimmed transcript for `name`/`village`. */
  value: string;
  confirm_mr: string;
}

export interface RetryAction {
  type: 'retry';
  slot: RegistrationSlot;
  message_mr: string;
}

export interface DoneAction {
  type: 'done';
}

export type AgentAction = AskAction | PrefillAction | RetryAction | DoneAction;

export interface RegistrationValues {
  name?: string;
  districtId?: string;
  village?: string;
}

const SLOT_ORDER: RegistrationSlot[] = ['name', 'district', 'village'];

const QUESTION_MR: Record<RegistrationSlot, string> = {
  name: 'तुमचं नाव सांगा.',
  district: 'तुम्ही कोणत्या जिल्ह्यात आहात?',
  village: 'तुमच्या गावाचे नाव सांगा. गाव नसेल तर "नाही" म्हणा.',
};

const RETRY_MR: Record<RegistrationSlot, string> = {
  name: 'माफ करा, नाव समजलं नाही. पुन्हा सांगा.',
  district: 'माफ करा, हा जिल्हा सापडला नाही. पुन्हा सांगा.',
  village: 'माफ करा, समजलं नाही. पुन्हा सांगा.',
};

/** Words that mean "skip this" on the one optional slot. */
const SKIP_WORDS = new Set(['नाही', 'नको', 'skip', 'no', 'none']);

/** Lowercases and strips whitespace/punctuation a farmer's ASR transcript or
 * a district's own name may disagree on, so "नाशिक", "  नाशिक ", and
 * "नाशिक." all compare equal. */
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?।]/g, '');
}

/**
 * Matches a spoken district name against the real list — by `name_mr`
 * first (the app's default locale), falling back to the English `name` for
 * a farmer who says the district in English. Substring match either way,
 * since a transcript often carries a filler word ("नाशिक जिल्हा" for
 * "Nashik district") the district's own name does not.
 */
function matchDistrict(transcript: string, districts: District[]): District | null {
  const t = normalize(transcript);
  if (!t) return null;

  let best: District | null = null;
  for (const d of districts) {
    const nameMr = normalize(d.name_mr);
    const nameEn = normalize(d.name);
    if (t.includes(nameMr) || nameMr.includes(t) || t.includes(nameEn) || nameEn.includes(t)) {
      // Prefer the more specific (longer) match if more than one district's
      // name is a substring of the transcript.
      if (!best || nameMr.length > normalize(best.name_mr).length) best = d;
    }
  }
  return best;
}

export class RegistrationAgent {
  private readonly districts: District[];
  private slotIndex = 0;
  private awaitingConfirm = false;
  private pendingValue: string | null = null;
  private readonly values: RegistrationValues = {};

  constructor(districts: District[]) {
    this.districts = districts;
  }

  private currentSlot(): RegistrationSlot | null {
    return this.slotIndex < SLOT_ORDER.length ? SLOT_ORDER[this.slotIndex] ?? null : null;
  }

  /** The question for whatever slot the agent is on right now — call once
   * on mount to get the opening prompt without needing a transcript first. */
  start(): AgentAction {
    const slot = this.currentSlot();
    if (!slot) return { type: 'done' };
    return { type: 'ask', slot, question_mr: QUESTION_MR[slot] };
  }

  /** Feeds one ASR transcript to whatever slot is currently open. */
  next(transcript: string): AgentAction {
    const slot = this.currentSlot();
    if (!slot) return { type: 'done' };

    const trimmed = transcript.trim();

    if (slot === 'village' && (trimmed.length === 0 || SKIP_WORDS.has(normalize(trimmed)))) {
      // Optional slot, explicitly skipped — no confirm step, straight to the
      // next slot (or done).
      this.slotIndex += 1;
      const nextSlot = this.currentSlot();
      return nextSlot
        ? { type: 'ask', slot: nextSlot, question_mr: QUESTION_MR[nextSlot] }
        : { type: 'done' };
    }

    if (slot === 'district') {
      const match = matchDistrict(trimmed, this.districts);
      if (!match) return { type: 'retry', slot, message_mr: RETRY_MR[slot] };
      this.pendingValue = match.id;
      this.awaitingConfirm = true;
      return {
        type: 'prefill',
        slot,
        value: match.id,
        confirm_mr: `तुम्ही ${match.name_mr} जिल्ह्यात आहात का?`,
      };
    }

    // name / village free text
    if (trimmed.length === 0) {
      return { type: 'retry', slot, message_mr: RETRY_MR[slot] };
    }
    this.pendingValue = trimmed;
    this.awaitingConfirm = true;
    const confirmLabel = slot === 'name' ? 'तुमचं नाव' : 'तुमचं गाव';
    return { type: 'prefill', slot, value: trimmed, confirm_mr: `${confirmLabel} ${trimmed} आहे का?` };
  }

  /** हो — commits the pending value and advances. */
  confirm(): AgentAction {
    const slot = this.currentSlot();
    if (!slot || !this.awaitingConfirm || this.pendingValue === null) return this.start();

    if (slot === 'name') this.values.name = this.pendingValue;
    if (slot === 'district') this.values.districtId = this.pendingValue;
    if (slot === 'village') this.values.village = this.pendingValue;

    this.pendingValue = null;
    this.awaitingConfirm = false;
    this.slotIndex += 1;

    const nextSlot = this.currentSlot();
    return nextSlot
      ? { type: 'ask', slot: nextSlot, question_mr: QUESTION_MR[nextSlot] }
      : { type: 'done' };
  }

  /** नाही — discards the pending value and re-asks the same slot. */
  deny(): AgentAction {
    const slot = this.currentSlot();
    this.pendingValue = null;
    this.awaitingConfirm = false;
    if (!slot) return { type: 'done' };
    return { type: 'ask', slot, question_mr: QUESTION_MR[slot] };
  }

  /** Everything confirmed so far — a screen reads this after `done` to fill
   * its own form state, or mid-flow to show progress. */
  getValues(): RegistrationValues {
    return { ...this.values };
  }

  isDone(): boolean {
    return this.currentSlot() === null;
  }
}
