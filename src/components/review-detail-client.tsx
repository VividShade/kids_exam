'use client';

import { useMemo, useState } from 'react';

import type { ExamQuestion } from '@/lib/types';

type ReviewDetailClientProps = {
  questions: ExamQuestion[];
  answers: Record<string, string>;
  wrongQuestionIds: string[];
};

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function ReviewDetailClient({ questions, answers, wrongQuestionIds }: ReviewDetailClientProps) {
  const [showWrongOnly, setShowWrongOnly] = useState(true);
  const wrongIdSet = useMemo(() => new Set(wrongQuestionIds), [wrongQuestionIds]);
  const visibleQuestions = showWrongOnly ? questions.filter((question) => wrongIdSet.has(question.id)) : questions;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            showWrongOnly ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
          }`}
          onClick={() => setShowWrongOnly(true)}
          type="button"
        >
          틀린 문제만 보기
        </button>
        <button
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            !showWrongOnly ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
          }`}
          onClick={() => setShowWrongOnly(false)}
          type="button"
        >
          모든 문제 보기
        </button>
      </div>

      {visibleQuestions.length > 0 ? (
        <div className="space-y-4">
          {visibleQuestions.map((question, index) => {
            const userAnswer = answers[question.id] ?? '';
            const isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
            const isMultipleChoice = question.kind === 'multiple_choice';
            const hasUserAnswer = userAnswer.trim().length > 0;
            return (
              <article key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                <p className="mt-2 font-semibold text-slate-950">{renderInlineBold(question.prompt)}</p>
                {isMultipleChoice && question.choices.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {question.choices.map((choice) => (
                      <li
                        key={choice}
                        className={[
                          choice === question.answer ? 'font-semibold text-emerald-700' : '',
                          !isCorrect && choice === userAnswer ? 'font-semibold text-rose-700' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {choice === question.answer ? '✅ ' : !isCorrect && choice === userAnswer ? '🚫 ' : '⚪️ '}
                        {choice}
                      </li>
                    ))}
                    {!isCorrect && !hasUserAnswer ? (
                      <li className="font-semibold text-rose-700">🚫 (not answered)</li>
                    ) : null}
                  </ul>
                ) : null}
                <div className="mt-3 space-y-1 text-sm">
                  {isMultipleChoice ? null : isCorrect ? (
                    <p className="font-semibold text-emerald-700">✅ 정답: {question.answer}</p>
                  ) : (
                    <>
                      <p className="font-semibold text-rose-700">🚫 사용자 답: {userAnswer || '(not answered)'}</p>
                      <p className="font-semibold text-emerald-700">✅ 정답: {question.answer}</p>
                    </>
                  )}
                  <p className="text-slate-500">풀이: {renderInlineBold(question.explanation)}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">표시할 문항이 없습니다.</p>
      )}
    </section>
  );
}
