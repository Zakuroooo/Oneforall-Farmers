/**
 * S28 — assistant. P16, cuttable, last on PRANAY.md's own cut order — built
 * anyway since the ask was the whole frontend.
 *
 * ★ "Canned tri-lingual Q&A, retrieval only, no generation" (PRANAY.md §1.3).
 *   Eight fixed questions, one fixed answer each, in `mr`/`hi`/`en` — nothing
 *   here calls a model or composes a sentence. Tapping a question reveals
 *   its answer; that is the entire interaction.
 *
 * ★ CLAUDE.md §9 / `05_AI_ARCHITECTURE.md` §9 (referenced from
 *   `07_FRONTEND_ARCHITECTURE.md`): "a real generative voice assistant
 *   inverts the thesis" — a hallucinating advisor is worse than none. This
 *   screen is the honest version: eight true, checked sentences about how
 *   this app itself works, never a synthesized answer to an arbitrary
 *   question.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import type { Locale } from '../../types/api';

interface QA {
  id: string;
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

const QUESTIONS: QA[] = [
  {
    id: 'no_advice',
    q: {
      mr: 'सल्ला का दिला नाही?',
      hi: 'सलाह क्यों नहीं दी?',
      en: 'Why was there no advice?',
    },
    a: {
      mr: 'जेव्हा अंदाजाची रुंदी खूप जास्त असते, तेव्हा प्रणाली चुकीचा अंदाज देण्याऐवजी सल्ला देत नाही.',
      hi: 'जब अनुमान की सीमा बहुत बड़ी होती है, तो सिस्टम गलत अनुमान देने के बजाय सलाह नहीं देता।',
      en: "When the forecast's uncertainty band is too wide, the system refuses to guess rather than give a confident but wrong answer.",
    },
  },
  {
    id: 'worst_case',
    q: {
      mr: 'सर्वात वाईट परिस्थिती म्हणजे काय?',
      hi: 'सबसे खराब स्थिति का मतलब क्या है?',
      en: 'What does "worst case" mean?',
    },
    a: {
      mr: 'हे १० पैकी १ शक्यता आहे — याहून वाईट होण्याची शक्यता फक्त १०%. अपेक्षित फायदा आणि सर्वात वाईट परिस्थिती दोन्ही सारख्याच आकारात दाखवले जातात.',
      hi: 'यह 10 में से 1 संभावना है — इससे बुरा होने की संभावना सिर्फ 10% है। अपेक्षित लाभ और सबसे खराब स्थिति दोनों एक ही आकार में दिखाए जाते हैं।',
      en: "It's the 1-in-10 outcome — only a 10% chance it's worse than this. The expected gain and the worst case are always shown at the same size.",
    },
  },
  {
    id: 'grade',
    q: {
      mr: 'ग्रेड कसा ठरतो?',
      hi: 'ग्रेड कैसे तय होता है?',
      en: 'How is the grade decided?',
    },
    a: {
      mr: 'सहा प्रश्नांची उत्तरे देऊन — आकार, रंग, कोंब, नुकसान %, ओलावा, माती — त्यावरून गुण मोजले जातात. फोटोची गरज नाही.',
      hi: 'छह सवालों के जवाब देकर — आकार, रंग, अंकुर, नुकसान %, नमी, मिट्टी — उससे अंक निकलते हैं। फोटो की जरूरत नहीं।',
      en: 'By answering six questions — size, colour, sprouting, damage %, moisture, foreign matter. No photo is needed.',
    },
  },
  {
    id: 'pledge',
    q: {
      mr: 'तारण कर्ज खरे आहे का?',
      hi: 'गिरवी ऋण असली है क्या?',
      en: 'Is the pledge loan real?',
    },
    a: {
      mr: 'नाही — हे फक्त सूचक सिम्युलेशन आहे, खरे कर्ज नाही. फायद्यापेक्षा व्याज जास्त असल्यास हे कार्ड दाखवलेच जात नाही.',
      hi: 'नहीं — यह सिर्फ सांकेतिक सिमुलेशन है, असली ऋण नहीं। यदि ब्याज लाभ से ज्यादा हो, तो यह कार्ड दिखाया ही नहीं जाता।',
      en: "No — it's an indicative simulation only, not a real loan. If the interest would exceed the gain, this card never shows at all.",
    },
  },
  {
    id: 'escrow',
    q: {
      mr: 'पैसे सुरक्षित आहेत का?',
      hi: 'पैसा सुरक्षित है क्या?',
      en: 'Is the money safe?',
    },
    a: {
      mr: 'व्यापाऱ्याने पैसे एस्क्रॉ खात्यात आधीच जमा केलेले असतात — माल पोहोचल्यावरच ते तुमच्या खात्यात जातात.',
      hi: 'व्यापारी पहले ही पैसा एस्क्रो खाते में जमा कर देता है — माल पहुंचने पर ही यह आपके खाते में जाता है।',
      en: "The buyer's money sits in escrow before dispatch — it only reaches your account once delivery is confirmed.",
    },
  },
  {
    id: 'pool',
    q: {
      mr: 'गटात सामील झाल्यास नुकसान होईल का?',
      hi: 'समूह में शामिल होने से नुकसान होगा क्या?',
      en: 'Will joining a pool hurt me?',
    },
    a: {
      mr: 'नाही — जर कोणाचाही वाटा एकट्याने विकण्यापेक्षा कमी असेल, तर तो गट तयारच होत नाही.',
      hi: 'नहीं — अगर किसी का हिस्सा अकेले बेचने से कम हो, तो वह समूह बनता ही नहीं।',
      en: "No — if any member's share would be worth less than selling alone, that pool simply does not form.",
    },
  },
  {
    id: 'counter',
    q: {
      mr: 'काउंटर किती वेळा करता येते?',
      hi: 'काउंटर कितनी बार किया जा सकता है?',
      en: 'How many times can I counter?',
    },
    a: {
      mr: 'तीन फेऱ्यांपर्यंत. तिसऱ्या फेरीनंतर काउंटरचा पर्याय बंद होतो.',
      hi: 'तीन दौर तक। तीसरे दौर के बाद काउंटर का विकल्प बंद हो जाता है।',
      en: 'Up to three rounds. After the third round, the counter option is disabled.',
    },
  },
  {
    id: 'offline',
    q: {
      mr: 'इंटरनेट नसेल तर काय होईल?',
      hi: 'इंटरनेट न हो तो क्या होगा?',
      en: 'What happens with no internet?',
    },
    a: {
      mr: 'शेवटची आणलेली माहिती जुनी आहे असे सांगून दाखवली जाते — रिकामी स्क्रीन किंवा एरर दिसत नाही.',
      hi: 'आखिरी बार लाई गई जानकारी को पुराना बताकर दिखाया जाता है — खाली स्क्रीन या एरर नहीं दिखता।',
      en: "The last data fetched is shown, marked as old — never a blank screen or an error where a number used to be.",
    },
  },
];

export default function S28_Assistant() {
  const [locale, setLocale] = useState<Locale>('mr');
  React.useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.header}>{translate('assistant_header', locale)}</Text>
      <Text style={styles.subheader}>{translate('assistant_subheader', locale)}</Text>
      {QUESTIONS.map(qa => {
        const open = openId === qa.id;
        return (
          <TouchableOpacity
            key={qa.id}
            style={styles.card}
            onPress={() => setOpenId(open ? null : qa.id)}
            accessibilityRole="button">
            <Text style={styles.question}>{open ? '▾ ' : '▸ '}{qa.q[locale]}</Text>
            {open ? <Text style={styles.answer}>{qa.a[locale]}</Text> : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20, paddingBottom: 32 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  question: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  answer: { fontSize: 14, color: '#334155', marginTop: 10, lineHeight: 21 },
});
