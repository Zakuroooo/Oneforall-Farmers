/**
 * Offline Marathi Voice Engine Test Script
 * Decomposes rupees, days, and verdicts into spoken Marathi clip sequences.
 */

const MARATHI_NUMBER_NAMES = {
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

const MARATHI_HUNDREDS = {
  1: 'शंभर', 2: 'दोनशे', 3: 'तीनशे', 4: 'चारशे', 5: 'पाचशे', 6: 'सहाशे', 7: 'सातशे', 8: 'आठशे', 9: 'नऊशे',
};

function decomposeRupees(paise) {
  const isNegative = paise < 0;
  let rupees = Math.trunc(Math.abs(paise) / 100);
  const clips = [];

  if (isNegative) clips.push('उणे');

  if (rupees === 0) {
    clips.push('शून्य', 'रुपये');
    return clips;
  }

  if (rupees >= 100000) {
    const lakhs = Math.floor(rupees / 100000);
    rupees %= 100000;
    if (MARATHI_NUMBER_NAMES[lakhs]) clips.push(MARATHI_NUMBER_NAMES[lakhs]);
    clips.push('लाख');
  }

  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000);
    rupees %= 1000;
    if (MARATHI_NUMBER_NAMES[thousands]) clips.push(MARATHI_NUMBER_NAMES[thousands]);
    clips.push('हजार');
  }

  if (rupees >= 100) {
    const hundreds = Math.floor(rupees / 100);
    rupees %= 100;
    if (MARATHI_HUNDREDS[hundreds]) clips.push(MARATHI_HUNDREDS[hundreds]);
  }

  if (rupees > 0 && MARATHI_NUMBER_NAMES[rupees]) {
    clips.push(MARATHI_NUMBER_NAMES[rupees]);
  }

  clips.push(isNegative ? 'रुपये तोटा' : 'रुपये');
  return clips;
}

console.log('--- MARATHI VOICE ENGINE DECOMPOSITION TEST ---');
console.log('₹6,290 (629000 paise)      :', decomposeRupees(629000).join(' '));
console.log('−₹4,800 (-480000 paise)    :', decomposeRupees(-480000).join(' '));
console.log('₹1,42,000 (14200000 paise)  :', decomposeRupees(14200000).join(' '));
console.log('\nFull Verdict Spoken Sequence:');
console.log('🔊 "थांबा अकरा दिवस अपेक्षित फायदा सहा हजार दोनशे नव्वद रुपये सर्वात वाईट स्थिती उणे चार हजार आठशे रुपये तोटा"');
