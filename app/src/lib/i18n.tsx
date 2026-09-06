import React, { createContext, useCallback, useContext, useState } from 'react';
import mr from '../i18n/mr.json';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import type { Locale } from '../types/api';

const DICTS: Record<Locale, Record<string, string>> = { mr, hi, en };

const DEV_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Converts Latin digits (0-9) to Devanagari numerals (०-९) for Marathi and Hindi.
 */
export function devNum(n: number | string, locale: Locale = 'mr'): string {
  const str = String(n);
  if (locale === 'en') return str;
  // `noUncheckedIndexedAccess` types DEV_DIGITS[i] as string | undefined; the
  // regex only ever matches 0-9 so this can't actually miss, but the honest way
  // to satisfy the type is a fallback, not a `!`.
  return str.replace(/\d/g, d => DEV_DIGITS[+d] ?? d);
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  t: TFn;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  devNum: (n: number | string) => string;
}

const defaultT: TFn = (key, vars) => {
  let text = mr[key as keyof typeof mr] || `⟨${key}⟩`;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
};

const defaultContextValue: I18nContextValue = {
  t: defaultT,
  locale: 'mr',
  setLocale: () => {},
  devNum: n => devNum(n, 'mr'),
};

const I18nContext = createContext<I18nContextValue>(defaultContextValue);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('mr'); // Marathi is the DEFAULT

  const t = useCallback<TFn>(
    (key, vars) => {
      const dict = DICTS[locale] || DICTS.mr;
      let text = dict[key] ?? `⟨${key}⟩`;

      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }

      return text;
    },
    [locale],
  );

  const formatDevNum = useCallback((n: number | string) => devNum(n, locale), [locale]);

  return (
    <I18nContext.Provider value={{ t, locale, setLocale, devNum: formatDevNum }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  return ctx || defaultContextValue;
}
