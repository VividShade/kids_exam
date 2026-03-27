'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { AttemptRecord, ExamSetRecord } from '@/lib/types';

type RunnerProps = {
  examSet: ExamSetRecord;
  initialAttempt: AttemptRecord | null;
};

export function ExamRunner({ examSet, initialAttempt }: RunnerProps) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState(initialAttempt?.id ?? '');
  const [shuffleSeed, setShuffleSeed] = useState(initialAttempt?.shuffleSeed ?? crypto.randomUUID());
  const [answers, setAnswers] = useState<Record<string, string>>(initialAttempt?.answers ?? {});
  const [currentIndex, setCurrentIndex] = useState(initialAttempt?.currentIndex ?? 0);
  const [statusMessage, setStatusMessage] = useState('Your progress will be saved while the attempt is in progress.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; wrongQuestionIds: string[] } | null>(
    initialAttempt?.status === 'completed' && initialAttempt.score !== null
      ? { score: initialAttempt.score, wrongQuestionIds: initialAttempt.wrongQuestionIds }
      : null,
  );
  const saveTimeoutRef = useRef<number | null>(null);

  const currentQuestion = examSet.questions[currentIndex];
  function getChoiceOrderScore(questionId: string, choice: string) {
    const input = `${shuffleSeed}:${questionId}:${choice}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  const shuffledChoicesByQuestionId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const question of examSet.questions) {
      if (question.kind !== 'multiple_choice') {
        map.set(question.id, question.choices);
        continue;
      }
      const choices = [...question.choices].sort(
        (left, right) => getChoiceOrderScore(question.id, left) - getChoiceOrderScore(question.id, right),
      );
      map.set(question.id, choices);
    }
    return map;
  }, [examSet.questions, shuffleSeed]);

  const answeredCount = useMemo(
    () => examSet.questions.filter((question) => (answers[question.id] ?? '').trim().length > 0).length,
    [answers, examSet.questions],
  );
  const unansweredCount = examSet.questions.length - answeredCount;

  async function ensureAttempt() {
    if (attemptId) {
      return attemptId;
    }

    const response = await fetch('/api/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ examSetId: examSet.id }),
    });

    const payload = (await response.json()) as AttemptRecord & { error?: string };
    if (!response.ok || !payload.id) {
      throw new Error(payload.error ?? 'Could not create an attempt.');
    }

    setAttemptId(payload.id);
    setShuffleSeed(payload.shuffleSeed || crypto.randomUUID());
    return payload.id;
  }

  async function persist(action: 'save' | 'abandon' | 'complete') {
    const id = await ensureAttempt();
    const response = await fetch(`/api/attempts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        answers,
        currentIndex,
      }),
    });

    const payload = (await response.json()) as { ok?: boolean; score?: number; wrongQuestionIds?: string[]; error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? 'Could not save attempt.');
    }

    if (action === 'complete' && typeof payload.score === 'number') {
      setResult({ score: payload.score, wrongQuestionIds: payload.wrongQuestionIds ?? [] });
    }

    return id;
  }

  useEffect(() => {
    if (result) {
      return;
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [result]);

  useEffect(() => {
    if (result) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void persist('save').catch((error) => {
        setStatusMessage(error instanceof Error ? error.message : 'Autosave failed.');
      });
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, currentIndex, result]);

  function updateAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  }

  async function handleExit() {
    if (!result) {
      const confirmed = window.confirm('This attempt is not finished. Leave and save it as an unfinished trial?');
      if (!confirmed) {
        return;
      }

      try {
        await persist('abandon');
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : 'Could not store unfinished attempt.');
        return;
      }
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleSubmit() {
    const warningMessage =
      unansweredCount > 0
        ? `There are ${unansweredCount} unanswered questions. Unanswered items may be counted as wrong. Submit anyway?`
        : 'All questions are answered. Submit your exam now?';
    const confirmed = window.confirm(warningMessage);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting your answers...');

    try {
      const completedAttemptId = await persist('complete');
      router.replace(`/dashboard/reviews/${completedAttemptId}`);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Submit failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Published exam</p>
          <h1 className="text-3xl font-black text-slate-950">{examSet.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{examSet.summary}</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={handleExit} type="button">
            Leave exam
          </button>
          {result ? (
            <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href="/dashboard">
              Back to dashboard
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
              Question {currentIndex + 1} / {examSet.questions.length}
            </span>
            <span className="text-sm text-slate-500">Answered {answeredCount}</span>
          </div>

          <article className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{currentQuestion.kind.replace('_', ' ')}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{currentQuestion.prompt}</h2>

            {currentQuestion.kind === 'short_answer' ? (
              <textarea
                className="mt-5 min-h-32 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm"
                onChange={(event) => updateAnswer(event.target.value)}
                value={answers[currentQuestion.id] ?? ''}
              />
            ) : (
              <div className="mt-5 space-y-3">
                {(shuffledChoicesByQuestionId.get(currentQuestion.id) ?? currentQuestion.choices).map((choice) => (
                  <label key={choice} className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input checked={(answers[currentQuestion.id] ?? '') === choice} name={currentQuestion.id} onChange={() => updateAnswer(choice)} type="radio" />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            )}
          </article>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)} type="button">
              ← Previous
            </button>
            <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50" disabled={currentIndex >= examSet.questions.length - 1} onClick={() => setCurrentIndex((value) => value + 1)} type="button">
              Next →
            </button>
          </div>

          <p className="mt-4 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{statusMessage}</p>
        </section>

        <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-[#fffef8] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-bold text-slate-950">Progress</h2>
          <div className="grid grid-cols-5 gap-2">
            {examSet.questions.map((question, index) => {
              const isAnswered = (answers[question.id] ?? '').trim().length > 0;
              const isWrong = result?.wrongQuestionIds.includes(question.id) ?? false;
              return (
                <button
                  key={question.id}
                  className={`aspect-square rounded-2xl text-xs font-bold ${
                    isWrong
                      ? 'bg-rose-200 text-rose-900'
                      : index === currentIndex
                        ? 'bg-slate-950 text-white'
                        : isAnswered
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-200 text-slate-700'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {result ? (
            <div className="rounded-3xl bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Final score</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{result.score}</p>
              <p className="mt-2 text-sm text-slate-600">Wrong answers: {result.wrongQuestionIds.length}</p>
            </div>
          ) : null}

          {!result ? (
            <div className="rounded-3xl border border-slate-300 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Submit</p>
              <p className="mt-2 text-sm text-slate-600">
                {unansweredCount > 0
                  ? `You still have ${unansweredCount} unanswered question(s).`
                  : 'All questions are answered. Ready to submit.'}
              </p>
              <button
                className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold ${
                  unansweredCount > 0 ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' : 'bg-slate-950 text-white'
                } disabled:opacity-50`}
                disabled={isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? 'Submitting...' : 'Submit exam'}
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
