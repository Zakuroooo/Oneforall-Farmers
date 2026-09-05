/**
 * S1 — language picker. मराठी / हिंदी / English.
 *
 * P0 placeholder. P1 builds it for real.
 *
 * ★ It is the first screen for a reason: everything after it is in the language
 *   chosen here, including the OTP screen. Marathi is the default and it is
 *   pre-selected — the picker exists to let the other two out, not to make a farmer
 *   choose his own language before he can use the app.
 */

import React from 'react';
import { Soon } from '../Soon';

export default function S01_Language() {
  return <Soon label="S1 · भाषा निवडा" />;
}
