'use client';

import { useMemo, useState, useTransition } from 'react';

import { DashboardExamSetCard } from '@/components/dashboard-exam-set-card';
import { parseSearchSpec, sortBySearchSpec } from '@/components/dashboard-search-utils';
import type { AttemptRecord, ExamGenerationJobRecord, ExamSetRecord } from '@/lib/types';

const DEFAULT_VISIBLE_COUNT = 5;
const LOAD_STEP = 5;

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

  const activeJobByExamSetId = useMemo(
    () => new Map(activeGenerationJobs.map((job) => [job.examSetId, job])),
    [activeGenerationJobs],
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
    [attempts],
  );

  function handleSearchChange(nextQuery: string) {
    setSearchQuery(nextQuery);
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }

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
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by title, summary, or keywords"
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="space-y-4">
          {filteredExamSets.length > 0 ? (
            filteredExamSets.map((examSet) => (
              <DashboardExamSetCard
                key={examSet.id}
                activeGenerationJob={activeJobByExamSetId.get(examSet.id) ?? null}
                attemptsByExamSet={attemptsByExamSetId[examSet.id] ?? []}
                examSet={examSet}
                searchSpec={searchSpec}
              />
            ))
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
