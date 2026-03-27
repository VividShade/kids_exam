'use client';

import Link from 'next/link';

import { deleteAttemptAction } from '@/app/dashboard/actions';
import { formatPercent } from '@/components/dashboard-search-utils';
import type { AttemptRecord } from '@/lib/types';

const trialActionButtonClass = 'rounded-full border px-3 py-2 text-xs font-semibold leading-none';

type DashboardAttemptItemProps = {
  attempt: AttemptRecord;
  totalCount: number;
  editionNumber: number | null;
};

export function DashboardAttemptItem({ attempt, totalCount, editionNumber }: DashboardAttemptItemProps) {
  const correctCount = Math.max(0, totalCount - attempt.wrongQuestionIds.length);
  const percent = formatPercent(correctCount, totalCount);
  const progressPercent = formatPercent(Math.min(Math.max(attempt.currentIndex + 1, 0), totalCount), totalCount);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3">
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
          <span className="inline-flex items-baseline text-right text-xs font-semibold text-slate-700">
            <span>
              {correctCount} / {totalCount}
            </span>
            <span className="ml-1 text-[10px] font-normal text-slate-500">({percent})</span>
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
}
