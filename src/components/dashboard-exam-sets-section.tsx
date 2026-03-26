'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { deleteAttemptAction, publishExamSetAction } from '@/app/dashboard/actions';
import type { AttemptRecord, ExamGenerationJobRecord, ExamSetRecord } from '@/lib/types';

const trialActionButtonClass = 'rounded-full border px-3 py-2 text-xs font-semibold leading-none';
const examActionButtonClass = 'inline-flex h-10 items-center justify-center rounded-full px-4 !text-sm !font-semibold leading-none';
const categoryLabelByShortcutId: Record<string, string> = {
  vocabulary_mix: 'Vocabulary',
  reading_check: 'Reading',
  grammar_practice: 'Grammar',
};

const DEFAULT_VISIBLE_COUNT = 5;
const LOAD_STEP = 5;

type SearchSpec =
  | {
      mode: 'none';
      query: '';
      terms: [];
    }
  | {
      mode: 'phrase';
      query: string;
      terms: [string];
    }
  | {
      mode: 'terms';
      query: string;
      terms: string[];
    };

function formatPercent(correctCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return '0%';
  }
  const raw = (correctCount / totalCount) * 100;
  const rounded = Math.round(raw * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function parseSearchSpec(raw: string): SearchSpec {
  const query = raw.trim();
  if (!query) {
    return { mode: 'none', query: '', terms: [] };
  }

  const first = query[0];
  const last = query[query.length - 1];
  const isQuoted = query.length >= 2 && (first === "'" || first === '"') && first === last;
  if (isQuoted) {
    const phrase = query.slice(1, -1).trim().toLowerCase();
    if (!phrase) {
      return { mode: 'none', query: '', terms: [] };
    }
    return { mode: 'phrase', query, terms: [phrase] };
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  if (terms.length === 0) {
    return { mode: 'none', query: '', terms: [] };
  }
  return { mode: 'terms', query, terms };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSearchableText(input: { title: string; summary: string; outputKeywords: string[] }) {
  return [input.title, input.summary, ...(input.outputKeywords ?? [])].join(' ').toLowerCase();
}

function sortBySearchSpec<T extends { title: string; summary: string; outputKeywords: string[] }>(items: T[], spec: SearchSpec) {
  if (spec.mode === 'none') {
    return items;
  }

  if (spec.mode === 'phrase') {
    const phrase = spec.terms[0];
    return items.filter((item) => getSearchableText(item).includes(phrase));
  }

  const andMatches: T[] = [];
  const orMatches: T[] = [];
  for (const item of items) {
    const text = getSearchableText(item);
    const matchCount = spec.terms.filter((term) => text.includes(term)).length;
    if (matchCount === spec.terms.length) {
      andMatches.push(item);
      continue;
    }
    if (matchCount > 0) {
      orMatches.push(item);
    }
  }
  return [...andMatches, ...orMatches];
}

function highlightText(text: string, spec: SearchSpec): ReactNode {
  if (spec.mode === 'none') {
    return text;
  }
  const terms = spec.terms
    .map((term) => term.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (terms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    const isMatch = terms.some((term) => part.toLowerCase() === term);
    if (!isMatch) {
      return <span key={`txt_${index}`}>{part}</span>;
    }
    return (
      <mark key={`hl_${index}`} className="rounded bg-amber-200/70 px-0 text-inherit">
        {part}
      </mark>
    );
  });
}

export function DashboardExamSetsSection({
  examSets,
  attempts,
  activeGenerationJobs,
}: {
  examSets: ExamSetRecord[];
  attempts: AttemptRecord[];
  activeGenerationJobs: ExamGenerationJobRecord[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [isLoadingMore, startLoadMoreTransition] = useTransition();

  const searchSpec = useMemo(() => parseSearchSpec(searchQuery), [searchQuery]);
  const searchedExamSets = useMemo(() => sortBySearchSpec(examSets, searchSpec), [examSets, searchSpec]);
  const filteredExamSets = useMemo(() => searchedExamSets.slice(0, visibleCount), [searchedExamSets, visibleCount]);
  const hasMore = searchedExamSets.length > filteredExamSets.length;

  useEffect(() => {
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }, [searchQuery]);

  const activeJobByExamSetId = useMemo(
    () => new Map(activeGenerationJobs.map((job) => [job.examSetId, job])),
    [activeGenerationJobs]
  );

  const attemptsByExamSetId = useMemo(
    () =>
      attempts.reduce<Record<string, AttemptRecord[]>>((acc, attempt) => {
        if (!acc[attempt.examSetId]) {
          acc[attempt.examSetId] = [];
        }
        acc[attempt.examSetId].push(attempt);
        return acc;
      }, {}),
    [attempts]
  );

  return (
    <section>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950">Your exam sets</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {filteredExamSets.length} / {examSets.length}
          </span>
        </div>

        <div className="mb-4">
          <label className="sr-only" htmlFor="dashboard-search">
            Search exam sets
          </label>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
            id="dashboard-search"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title, summary, or keywords"
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="space-y-4">
          {filteredExamSets.length > 0 ? (
            filteredExamSets.map((examSet) => {
              const activeGenerationJob = activeJobByExamSetId.get(examSet.id) ?? null;
              const visualStatus = activeGenerationJob ? 'generating' : examSet.status;
              const visualStatusClass = activeGenerationJob
                ? 'bg-sky-100 text-sky-800'
                : examSet.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800';
              const attemptsByExamSet = attemptsByExamSetId[examSet.id] ?? [];
              const categoryLabel = categoryLabelByShortcutId[examSet.selectedShortcutId] ?? examSet.selectedShortcutId;
              const editionCount = Math.max(examSet.generateCount, examSet.questions.length > 0 ? 1 : 0);
              const keywordsText =
                Array.isArray(examSet.outputKeywords) && examSet.outputKeywords.length > 0
                  ? examSet.outputKeywords.join(', ')
                  : '-';
              const editionSnapshots = Array.from(
                new Set(
                  attemptsByExamSet
                    .map((attempt) => attempt.publishedAtSnapshot)
                    .filter((snapshot): snapshot is string => !!snapshot)
                )
              ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
              const editionBySnapshot = new Map(editionSnapshots.map((snapshot, index) => [snapshot, index + 1]));

              return (
                <article key={examSet.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="text-xl font-bold leading-tight text-slate-950 break-words">
                          {highlightText(examSet.title, searchSpec)}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${visualStatusClass}`}
                        >
                          {activeGenerationJob ? (
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : null}
                          {visualStatus}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm text-slate-600">{highlightText(examSet.summary, searchSpec)}</p>
                      <p className="mt-1 text-xs text-slate-500">Keywords: {highlightText(keywordsText, searchSpec)}</p>
                      <p className="mt-1 text-xs text-slate-500">Category {categoryLabel} · Editions {editionCount}</p>
                      <p className="mt-1 text-xs text-slate-500">Generated {examSet.generateCount} time(s)</p>
                      <p className="mt-2 text-xs text-slate-500">Updated {new Date(examSet.updatedAt).toLocaleString()}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          className={`${examActionButtonClass} border border-slate-300 bg-white text-slate-700`}
                          href={`/dashboard/exams/${examSet.id}/edit`}
                        >
                          Edit draft
                        </Link>
                        {examSet.status === 'published' ? (
                          <Link className={`${examActionButtonClass} bg-slate-950 text-white`} href={`/exams/${examSet.id}`}>
                            Solve published set
                          </Link>
                        ) : (
                          <form action={publishExamSetAction}>
                            <input name="examSetId" type="hidden" value={examSet.id} />
                            <button className={`${examActionButtonClass} bg-slate-950 text-white`} type="submit">
                              Publish
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Trials</h4>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          {attemptsByExamSet.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {attemptsByExamSet.length > 0 ? (
                          attemptsByExamSet.map((attempt) => {
                            const totalCount =
                              attempt.questionsSnapshot.length > 0 ? attempt.questionsSnapshot.length : examSet.questions.length;
                            const correctCount = Math.max(0, totalCount - attempt.wrongQuestionIds.length);
                            const percent = formatPercent(correctCount, totalCount);
                            const progressPercent = formatPercent(
                              Math.min(Math.max(attempt.currentIndex + 1, 0), totalCount),
                              totalCount
                            );
                            const editionNumber = attempt.publishedAtSnapshot
                              ? editionBySnapshot.get(attempt.publishedAtSnapshot)
                              : null;
                            return (
                              <article key={attempt.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span
                                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                        attempt.status === 'completed' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {attempt.status === 'completed' ? 'Finished' : 'Unfinished'}
                                    </span>
                                    <p className="mt-2 text-xs text-slate-500">{editionNumber ? `Edition ${editionNumber}` : 'Legacy edition'}</p>
                                    {attempt.status === 'completed' ? (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Completed {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : '-'}
                                      </p>
                                    ) : (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Saved at question {attempt.currentIndex + 1} — {progressPercent} done
                                      </p>
                                    )}
                                  </div>
                                  {attempt.status === 'completed' ? (
                                    <span className="text-right text-[11px] font-semibold text-slate-700">
                                      {correctCount} / {totalCount} ({percent})
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {attempt.status === 'completed' ? (
                                    <Link className={`${trialActionButtonClass} border-slate-300 bg-white text-slate-700`} href={`/dashboard/reviews/${attempt.id}`}>
                                      Review details
                                    </Link>
                                  ) : (
                                    <>
                                      <Link className={`${trialActionButtonClass} border-slate-300 bg-white text-slate-700`} href={`/exams/${attempt.examSetId}?attempt=${attempt.id}`}>
                                        Resume
                                      </Link>
                                      <form action={deleteAttemptAction}>
                                        <input name="attemptId" type="hidden" value={attempt.id} />
                                        <button className={`${trialActionButtonClass} border-rose-200 bg-rose-50 !text-xs text-rose-700`} type="submit">
                                          Delete trial
                                        </button>
                                      </form>
                                    </>
                                  )}
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <p className="rounded-2xl bg-white p-3 text-sm text-slate-500">No trials yet for this exam set.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 p-8 text-sm text-slate-500">
              {searchQuery.trim().length > 0
                ? `No exam sets match "${searchQuery}".`
                : 'No exam sets yet. Start by uploading a worksheet or textbook photo.'}
            </div>
          )}
        </div>

        {searchedExamSets.length > DEFAULT_VISIBLE_COUNT ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            {hasMore ? (
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoadingMore}
                onClick={() =>
                  startLoadMoreTransition(() => {
                    setVisibleCount((current) => Math.min(searchedExamSets.length, current + LOAD_STEP));
                  })
                }
                type="button"
              >
                {isLoadingMore ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            ) : (
              <p className="text-sm text-slate-500">No more exam sets to load.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
