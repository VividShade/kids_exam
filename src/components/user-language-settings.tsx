'use client';

import { Languages, Save } from 'lucide-react';
import { useState } from 'react';

const APP_UI_LANGUAGE_KEY = 'app_ui_language';

type UiLang = 'en' | 'ko' | 'es';

export function UserLanguageSettings() {
  const [language, setLanguage] = useState<UiLang>(
    (typeof window !== 'undefined' ? ((window.localStorage.getItem(APP_UI_LANGUAGE_KEY) as UiLang | null) ?? 'en') : 'en'),
  );
  const [savedMessage, setSavedMessage] = useState('');

  function handleSave() {
    window.localStorage.setItem(APP_UI_LANGUAGE_KEY, language);
    setSavedMessage('Saved. New exam builder pages will use this language.');
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
        <Languages aria-hidden className="h-5 w-5" />
        Language settings
      </h2>
      <p className="mt-2 text-sm text-slate-600">Choose UI language preference for exam builder menus and labels.</p>
      <div className="mt-4 max-w-sm">
        <label className="text-sm font-semibold text-slate-800">
          Builder UI language
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
            onChange={(event) => setLanguage(event.target.value as UiLang)}
            value={language}
          >
            <option value="en">English</option>
            <option value="ko">Korean</option>
            <option value="es">Spanish</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" onClick={handleSave} type="button">
          <Save aria-hidden className="mr-1.5 inline h-4 w-4" />
          Save settings
        </button>
      </div>
      {savedMessage ? <p className="mt-3 text-sm text-emerald-700">{savedMessage}</p> : null}
    </section>
  );
}
