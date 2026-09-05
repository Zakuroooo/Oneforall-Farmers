/**
 * S4 — Home. Today's price, the source badge, one big CTA.
 *
 * P0 placeholder. P2 builds it for real.
 *
 * ★ One CTA. Not three. The farmer opening this app has one question — *should I
 *   sell today?* — and the home screen's job is to carry him to the answer in one
 *   tap. Every extra button on this screen is a tap he might not take.
 *
 * ★ I8: the source badge is not decoration. Whatever price appears here carries the
 *   `source` from the price row, and anything that is not AGMARKNET or MSAMB is
 *   badged as generated. Showing an unlabelled synthetic number to a government
 *   panel is the one unrecoverable mistake available to this team.
 */

import React from 'react';
import { Soon } from '../Soon';

export default function S04_Home() {
  return <Soon label="S4 · मुख्यपृष्ठ" />;
}
