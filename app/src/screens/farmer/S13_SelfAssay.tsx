/**
 * S13 — the six-question self-assay. Six taps, then a grade, on device, in a
 * field, before the lot is even listed. CANON §9's formula lives once, in
 * `lib/grading.ts`; this screen only collects the six answers and renders
 * what that function returns.
 *
 * ★ CANON §9 + FRONTEND_NEEDS_AI.md §8.2: the photo is evidence, not input.
 *   This screen produces a grade with **no photo at all** — a farmer with a
 *   cracked camera still gets one. There is no camera permission, no image
 *   picker, and no photo field anywhere on this screen; that risk belongs to
 *   S12 (task D), not here.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getLot, submitAssay } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { computeGrade } from '../../lib/grading';
import { DEFAULT_LOT_ID, USE_FIXTURES } from '../../config';
import { fxLotListed } from '../../fixtures/lots';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { BadgeType } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { MyLotsStackParamList } from '../../navigation/FarmerTabs';
import type { AssayDimension, AssayReq, AssayRes, Grade, Locale } from '../../types/api';

type Props = NativeStackScreenProps<MyLotsStackParamList, 'S13_SelfAssay'>;

type Rating = 1 | 2 | 3;

interface Answers {
  size_uniform: Rating | null;
  colour_uniform: Rating | null;
  sprouting: Rating | null;
  damage_pct: number | null;
  moisture_feel: Rating | null;
  foreign_matter: Rating | null;
}

const EMPTY_ANSWERS: Answers = {
  size_uniform: null,
  colour_uniform: null,
  sprouting: null,
  damage_pct: null,
  moisture_feel: null,
  foreign_matter: null,
};

const DAMAGE_STEP = 5;

/** One row per CANON §9 dimension, Marathi label + the three answer choices. */
const RATING_QUESTIONS: Array<{
  key: keyof Omit<Answers, 'damage_pct'>;
  label_mr: string;
  choices: Array<{ value: Rating; label_mr: string }>;
}> = [
  {
    key: 'size_uniform',
    label_mr: 'दाण्यांचा आकार किती सारखा आहे?',
    choices: [
      { value: 3, label_mr: 'खूप सारखा' },
      { value: 2, label_mr: 'मिश्र' },
      { value: 1, label_mr: 'खूप वेगवेगळा' },
    ],
  },
  {
    key: 'colour_uniform',
    label_mr: 'रंग किती सारखा आहे?',
    choices: [
      { value: 3, label_mr: 'सारखा' },
      { value: 2, label_mr: 'काही डाग' },
      { value: 1, label_mr: 'खूप डाग' },
    ],
  },
  {
    key: 'sprouting',
    label_mr: 'कोंब फुटले आहेत का?',
    choices: [
      { value: 3, label_mr: 'नाही' },
      { value: 2, label_mr: 'थोडे' },
      { value: 1, label_mr: 'खूप' },
    ],
  },
  {
    key: 'moisture_feel',
    label_mr: 'ओलावा कसा वाटतो?',
    choices: [
      { value: 3, label_mr: 'कोरडे' },
      { value: 2, label_mr: 'किंचित ओलसर' },
      { value: 1, label_mr: 'ओलसर' },
    ],
  },
  {
    key: 'foreign_matter',
    label_mr: 'माती/काडीकचरा किती आहे?',
    choices: [
      { value: 3, label_mr: 'स्वच्छ' },
      { value: 2, label_mr: 'थोडी माती' },
      { value: 1, label_mr: 'खूप माती' },
    ],
  },
];

/** §8.2 — the improvement tip, named per `weakest_dimension`. No rupee figure
 * here: that delta needs `grade_multiplier` against a real market price, which
 * this pure client-side screen does not have (S9/S10 are where a priced number
 * belongs). TODO(nilesh): if the server assay ever sends `tip_mr`/`tip_en`
 * verbatim with a real rupee delta, prefer that over this static map. */
const TIP_MR: Record<AssayDimension, string> = {
  damage_pct: 'नुकसान झालेले दाणे वेगळे केल्यास ग्रेड सुधारू शकतो.',
  sprouting: 'कोंब फुटलेले दाणे वेगळे करा — हे ग्रेडवर सर्वात जास्त परिणाम करते.',
  size_uniform: 'दाणे आकारानुसार चाळल्यास ग्रेड सुधारू शकतो.',
  colour_uniform: 'रंगानुसार दाणे वेगळे केल्यास ग्रेड सुधारू शकतो.',
  moisture_feel: 'माल चांगला वाळवल्यास ग्रेड सुधारू शकतो.',
  foreign_matter: 'माती व काडीकचरा साफ केल्यास ग्रेड सुधारू शकतो.',
};
const TIP_EN: Record<AssayDimension, string> = {
  damage_pct: 'Sorting out damaged grains could improve the grade.',
  sprouting: 'Removing sprouted grains helps the most here.',
  size_uniform: 'Sorting by size could improve the grade.',
  colour_uniform: 'Sorting by colour could improve the grade.',
  moisture_feel: 'Drying the produce further could improve the grade.',
  foreign_matter: 'Cleaning out soil and debris could improve the grade.',
};

const GRADE_BADGE: Record<Grade, BadgeType> = {
  A: 'GRADE_A',
  B: 'GRADE_B',
  C: 'GRADE_C',
};

async function fetchLot(lotId: string) {
  if (USE_FIXTURES) return fxLotListed;
  return getLot(lotId);
}

/**
 * `POST /lots/{id}/assay` — CANON §7.5. Akash's route does not exist in this
 * repo, so under `USE_FIXTURES` the response is built the same way `computeGrade`
 * would be graded server-side: `lib/grading.ts`'s formula, plus the tip text
 * this screen already carries for each `weakest_dimension`. When a real
 * backend exists, `submitAssay` is the one that actually persists it.
 */
async function persistAssay(lotId: string, body: AssayReq): Promise<AssayRes> {
  if (USE_FIXTURES) {
    const graded = computeGrade(body);
    return {
      score: graded.score,
      grade: graded.grade,
      weakest_dimension: graded.weakest_dimension,
      tip_mr: TIP_MR[graded.weakest_dimension],
      tip_en: TIP_EN[graded.weakest_dimension],
    };
  }
  return submitAssay(lotId, body);
}

export default function S13_SelfAssay({ route }: Props) {
  const lotId = route.params?.lot_id ?? DEFAULT_LOT_ID;

  const [locale, setLocale] = useState<Locale>('mr');
  React.useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data: lot, isLoading, error, refetch } = useQuery({
    queryKey: ['lots', lotId],
    queryFn: () => fetchLot(lotId),
  });

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);

  const {
    mutate: submit,
    isPending: submitting,
    isError: submitFailed,
    isSuccess: submitted,
    data: result,
    reset: resetSubmit,
  } = useMutation({
    mutationFn: (body: AssayReq) => persistAssay(lotId, body),
  });

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={400} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ErrorState message="लॉट माहिती आणता आली नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!lot) {
    return <EmptyState title="तपासणीसाठी लॉट सापडला नाही." />;
  }

  const allAnswered =
    answers.size_uniform !== null &&
    answers.colour_uniform !== null &&
    answers.sprouting !== null &&
    answers.moisture_feel !== null &&
    answers.foreign_matter !== null &&
    answers.damage_pct !== null;

  const setRating = (key: keyof Omit<Answers, 'damage_pct'>, value: Rating) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const adjustDamage = (delta: number) => {
    setAnswers(prev => {
      const current = prev.damage_pct ?? 0;
      const next = Math.min(100, Math.max(0, current + delta));
      return { ...prev, damage_pct: next };
    });
  };

  const buildAssayReq = (): AssayReq | null => {
    if (
      answers.size_uniform === null ||
      answers.colour_uniform === null ||
      answers.sprouting === null ||
      answers.moisture_feel === null ||
      answers.foreign_matter === null ||
      answers.damage_pct === null
    ) {
      return null;
    }
    return {
      size_uniform: answers.size_uniform,
      colour_uniform: answers.colour_uniform,
      sprouting: answers.sprouting,
      damage_pct: answers.damage_pct,
      moisture_feel: answers.moisture_feel,
      foreign_matter: answers.foreign_matter,
    };
  };

  const checkGrade = () => {
    const body = buildAssayReq();
    if (body) submit(body);
  };

  const startOver = () => {
    setAnswers(EMPTY_ANSWERS);
    resetSubmit();
  };

  if (submitFailed) {
    return (
      <ErrorState
        message="ग्रेड जतन करता आला नाही. पुन्हा प्रयत्न करा."
        onRetry={() => {
          const body = buildAssayReq();
          if (body) submit(body);
        }}
      />
    );
  }

  if (submitting) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={200} />
      </ScrollView>
    );
  }

  if (submitted && result) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Card variant="elevated" style={styles.resultCard}>
          <Badge label={`ग्रेड ${result.grade}`} type={GRADE_BADGE[result.grade]} />
          <Text style={styles.scoreText}>गुण: {result.score} (कमाल १०००)</Text>
          <Text style={styles.tipTextMr}>{result.tip_mr}</Text>
          {locale === 'en' ? <Text style={styles.tipTextEn}>{result.tip_en}</Text> : null}
        </Card>
        <Button title="पुन्हा तपासा" variant="outline" onPress={startOver} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.header}>माल तपासा (सहा प्रश्न)</Text>
      <Text style={styles.subheader}>फोटोची गरज नाही — फक्त पाहून उत्तर द्या.</Text>

      {RATING_QUESTIONS.map(q => (
        <Card key={q.key} style={styles.questionCard}>
          <Text style={styles.questionLabel}>{q.label_mr}</Text>
          <View style={styles.choiceRow}>
            {q.choices.map(c => {
              const selected = answers[q.key] === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setRating(q.key, c.value)}
                  style={[styles.choice, selected && styles.choiceSelected]}>
                  <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                    {c.label_mr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}

      <Card style={styles.questionCard}>
        <Text style={styles.questionLabel}>नुकसान किती % आहे?</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => adjustDamage(-DAMAGE_STEP)}>
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{answers.damage_pct ?? 0}%</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => adjustDamage(DAMAGE_STEP)}>
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Button
        title="ग्रेड तपासा"
        onPress={checkGrade}
        disabled={!allAnswered}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  questionCard: { padding: 16 },
  questionLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  choiceSelected: {
    borderColor: '#1B5E20',
    backgroundColor: '#E8F5E9',
  },
  choiceText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  choiceTextSelected: { color: '#1B5E20' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 24, fontWeight: '700', color: '#1B5E20' },
  stepperValue: { fontSize: 22, fontWeight: '700', color: '#1E293B', minWidth: 60, textAlign: 'center' },
  submitButton: { marginTop: 8, marginBottom: 24 },
  resultCard: { alignItems: 'center', padding: 24, gap: 8 },
  scoreText: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginTop: 8 },
  tipTextMr: { fontSize: 15, color: '#334155', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  tipTextEn: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 20 },
});
