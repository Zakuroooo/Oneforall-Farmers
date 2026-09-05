/**
 * S2 — phone number, then the OTP. One screen, two steps.
 *
 * P0 placeholder. P1 builds it for real.
 *
 * ★ I14 when you do. Nothing in this screen logs: not the number, not the code,
 *   not the response body. `dev_otp` on `OtpRequestRes` exists so the API can echo
 *   the code in development — read it, prefill the field with it if you like, but
 *   it does not go through `console.log` and it does not survive into a release
 *   build. A phone number in a shipped log is a real disclosure.
 */

import React from 'react';
import { Soon } from '../Soon';

export default function S02_Phone() {
  return <Soon label="S2 · मोबाइल नंबर" />;
}
