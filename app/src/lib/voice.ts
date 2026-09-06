/**
 * voice.ts — Marathi offline voice engine.
 * Decomposes rupees and days into sequenced audio clips. Works 100% offline (I7).
 */

import { Platform } from 'react-native';
import type { WindowRes } from '../types/api';
import type { TFn } from './i18n';

// Static require map for audio clips (Metro & Webpack require static asset references)
// Fallback audio synthetic silent wave or Web Audio synth on web platform
const CLIPS: Record<string, string> = {
  hold: 'थांबा',
  sell_now: 'आज विका',
  sell_elsewhere: 'दुसऱ्या बाजारात विका',
  split: 'अर्धा आज विका',
  no_advice: 'सल्ला नाही',
  days: 'दिवस',
  exp_gain: 'अपेक्षित फायदा',
  worst_case: 'सर्वात वाईट स्थिती',
  rupees: 'रुपये',
  rupees_loss: 'रुपये तोटा',
  quintal: 'क्विंटल',
  thousand: 'हजार',
  lakh: 'लाख',
  minus: 'उणे',
};

// Marathi numbers 0-99 mapping for audio clip names
const MARATHI_NUMBER_NAMES: Record<number, string> = {
  0: 'शून्य', 1: 'एक', 2: 'दोन', 3: 'तीन', 4: 'चार', 5: 'पाच', 6: 'सहा', 7: 'सात', 8: 'आठ', 9: 'नऊ', 10: 'दहा',
  11: 'अकरा', 12: 'बारा', 13: 'तेरा', 14: 'चौदा', 15: 'पंधरा', 16: 'सोळा', 17: 'सतरा', 18: 'अठरा', 19: 'एकोणीस', 20: 'वीस',
  21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचवीस', 26: 'सव्वीस', 27: 'सत्तावीस', 28: 'अठ्ठावीस', 29: 'एकोणतीस', 30: 'तीस',
  31: 'एकतीस', 32: 'बत्तीस', 33: 'तेत्तीस', 34: 'चौतीस', 35: 'पाचतीस', 36: 'छत्तीस', 37: 'सदतीस', 38: 'अडतीस', 39: 'एकोणचाळीस', 40: 'चाळीस',
  41: 'एकचाळीस', 42: 'बेचाळीस', 43: 'त्रेचाळीस', 44: 'चौचाळीस', 45: 'पंचाळीस', 46: 'सहाचाळीस', 47: 'सतचाळीस', 48: 'अडचाळीस', 49: 'एकोणपन्नास', 50: 'पन्नास',
  51: 'एकपन्नास', 52: 'बावन्न', 53: 'त्रेपन्न', 54: 'चौपन्न', 55: 'पंचपन्न', 56: 'छापन्न', 57: 'सत्तावन्न', 58: 'अठ्ठावन्न', 59: 'एकोणसाठ', 60: 'साठ',
  61: 'एकसाठ', 62: 'बासाठ', 63: 'त्रेसाठ', 64: 'चौसाठ', 65: 'पासष्ट', 66: 'सहासाठ', 67: 'सदसाठ', 68: 'अडसाठ', 69: 'एकोणसत्तर', 70: 'सत्तर',
  71: 'एकसत्तर', 72: 'बायत्तर', 73: 'त्र्याहत्तर', 74: 'चौहत्तर', 75: 'पंचहत्तर', 76: 'शहात्तर', 77: 'सतहत्तर', 78: 'अठ्ठ्याहत्तर', 79: 'एकोणऐंशी', 80: 'ऐंशी',
  81: 'एकऐंशी', 82: 'ब्याऐंशी', 83: 'त्र्याऐंशी', 84: 'चौऱ्याऐंशी', 85: 'पंचऐंशी', 86: 'शहाऐंशी', 87: 'सत्ताऐंशी', 88: 'अठ्ठाऐंशी', 89: 'एकोणनव्वद', 90: 'नव्वद',
  91: 'एकणव्वद', 92: 'ब्याणव्वद', 93: 'त्र्याणव्वद', 94: 'चौऱ्याणव्वद', 95: 'पंचणव्वद', 96: 'शहाणव्वद', 97: 'सत्ताणव्वद', 98: 'अठ्ठाणव्वद', 99: 'नऊणव्वद',
};

const MARATHI_HUNDREDS: Record<number, string> = {
  1: 'शंभर', 2: 'दोनशे', 3: 'तीनशे', 4: 'चारशे', 5: 'पाचशे', 6: 'सहाशे', 7: 'सातशे', 8: 'आठशे', 9: 'नऊशे',
};

/**
 * Decomposes rupee amount in paise to Marathi spoken word clips.
 * Example: 629000 paise -> ₹6,290 -> ["सहा", "हजार", "दोनशे", "नव्वद", "रुपये"]
 */
export function decomposeRupees(paise: number): string[] {
  const isNegative = paise < 0;
  let rupees = Math.trunc(Math.abs(paise) / 100);
  const clips: string[] = [];

  if (isNegative) {
    clips.push('minus');
  }

  if (rupees === 0) {
    clips.push('शून्य', 'rupees');
    return clips;
  }

  // Lakhs (1,00,000+)
  if (rupees >= 100000) {
    const lakhs = Math.floor(rupees / 100000);
    rupees %= 100000;
    // `noUncheckedIndexedAccess` types a lookup table access as T | undefined —
    // narrow once onto a local so the truthy check and the push agree on the
    // same value instead of TS treating them as two independent lookups.
    const lakhsName = MARATHI_NUMBER_NAMES[lakhs];
    if (lakhsName) {
      clips.push(lakhsName);
    }
    clips.push('lakh');
  }

  // Thousands (1,000+)
  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000);
    rupees %= 1000;
    const thousandsName = MARATHI_NUMBER_NAMES[thousands];
    if (thousandsName) {
      clips.push(thousandsName);
    }
    clips.push('thousand');
  }

  // Hundreds (100-900)
  if (rupees >= 100) {
    const hundreds = Math.floor(rupees / 100);
    rupees %= 100;
    const hundredsName = MARATHI_HUNDREDS[hundreds];
    if (hundredsName) {
      clips.push(hundredsName);
    }
  }

  // Remaining 1-99
  const remainderName = MARATHI_NUMBER_NAMES[rupees];
  if (rupees > 0 && remainderName) {
    clips.push(remainderName);
  }

  clips.push(isNegative ? 'rupees_loss' : 'rupees');
  return clips;
}

export function decomposeDays(days: number): string[] {
  const clips: string[] = [];
  const daysName = MARATHI_NUMBER_NAMES[days];
  if (daysName) {
    clips.push(daysName);
  } else {
    clips.push(String(days));
  }
  clips.push('days');
  return clips;
}

// TODO(shreya): SH3 — real TTS/clip playback
export async function speak(clips: string[]): Promise<void> {
  void clips;
}

export async function speakVerdict(v: WindowRes, t?: TFn): Promise<void> {
  if (v.action === 'NO_ADVICE') {
    await speak(['no_advice']);
    return;
  }

  const clips: string[] = [];

  // Action
  if (v.action === 'HOLD' && v.hold_days) {
    clips.push('hold', ...decomposeDays(v.hold_days));
  } else if (v.action === 'SELL_NOW') {
    clips.push('sell_now');
  } else if (v.action === 'SELL_ELSEWHERE') {
    clips.push('sell_elsewhere');
  } else if (v.action === 'SPLIT') {
    clips.push('split');
  }

  // Expected Gain
  if (v.expected_gain_paise !== null && v.expected_gain_paise !== undefined) {
    clips.push('exp_gain', ...decomposeRupees(v.expected_gain_paise));
  }

  // Worst Case (Loss)
  if (v.worst_case_paise !== null && v.worst_case_paise !== undefined) {
    clips.push('worst_case', ...decomposeRupees(v.worst_case_paise));
  }

  await speak(clips);
}
