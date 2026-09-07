/**
 * The rule these guard: our own demo notes are translated, a buyer's typed
 * words never are. Getting that backwards either puts Devanagari on an
 * English screen (the bug) or rewrites what the other party said (worse).
 */

import {
  DEMO_NOTE_RAISED_FOR_TRANSPORT,
  DEMO_NOTE_TRUCK_TOMORROW,
  noteText,
} from '../offerNote';

const t = (key: string) => `translated:${key}`;

describe('noteText', () => {
  it('resolves a demo note through the dictionary', () => {
    expect(noteText(DEMO_NOTE_RAISED_FOR_TRANSPORT, t)).toBe(
      `translated:${DEMO_NOTE_RAISED_FOR_TRANSPORT}`,
    );
    expect(noteText(DEMO_NOTE_TRUCK_TOMORROW, t)).toBe(
      `translated:${DEMO_NOTE_TRUCK_TOMORROW}`,
    );
  });

  it("leaves a buyer's own words exactly as typed", () => {
    expect(noteText('मी उद्या येतो', t)).toBe('मी उद्या येतो');
    expect(noteText('Can you do 1950?', t)).toBe('Can you do 1950?');
  });

  it('does not translate a note that merely looks like a key', () => {
    // A buyer who types this must see it back, not a UI string.
    expect(noteText('hold_advice', t)).toBe('hold_advice');
  });

  it('treats absent and blank notes as nothing to show', () => {
    expect(noteText(null, t)).toBeNull();
    expect(noteText(undefined, t)).toBeNull();
    expect(noteText('   ', t)).toBeNull();
  });

  it('trims surrounding whitespace off a real note', () => {
    expect(noteText('  1950 ठीक आहे  ', t)).toBe('1950 ठीक आहे');
  });
});
