'use client';

import { Clock3, Pencil, Play, Sparkles, Tags } from 'lucide-react';
import Link from 'next/link';

import { publishExamSetAction } from '@/app/dashboard/actions';
import { DashboardAttemptItem } from '@/components/dashboard-attempt-item';
import { highlightText, type SearchSpec } from '@/components/dashboard-search-utils';
import type { AttemptRecord, ExamGenerationJobRecord, ExamSetRecord } from '@/lib/types';

const examActionButtonClass = 'inline-flex h-10 items-center justify-center rounded-full px-4 !text-sm !font-semibold leading-none';
const categoryLabelByShortcutId: Record<string, string> = {
  reading_check: 'Reading',
  vocabulary_mix: 'Vocabulary',
  grammar_practice: 'Grammar',
};

type DashboardExamSetCardProps = {
  examSet: ExamSetRecord;
  attemptsByExamSet: AttemptRecord[];
  activeGenerationJob: ExamGenerationJobRecord | null;
  searchSpec: SearchSpec;
};

export function DashboardExamSetCard({
  examSet,
  attemptsByExamSet,
  activeGenerationJob,
  searchSpec,
}: DashboardExamSetCardProps) {
  const visualStatus = activeGenerationJob ? 'generating' : examSet.status;
  const visualStatusClass = activeGenerationJob
    ? 'bg-sky-100 text-sky-800'
    : examSet.status === 'published'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-amber-100 text-amber-800';
  const categoryLabel = categoryLabelByShortcutId[examSet.selectedShortcutId] ?? examSet.selectedShortcutId;
  const editionCount = Math.max(examSet.generateCount, examSet.questions.length > 0 ? 1 : 0);
  const keywordsText =
    Array.isArray(examSet.outputKeywords) && examSet.outputKeywords.length > 0 ? examSet.outputKeywords.join(', ') : '-';
  const editionSnapshots = Array.from(
    new Set(
      attemptsByExamSet.map((attempt) => attempt.publishedAtSnapshot).filter((snapshot): snapshot is string => !!snapshot),
    ),
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const editionBySnapshot = new Map(editionSnapshots.map((snapshot, index) => [snapshot, index + 1]));

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-xl font-bold leading-tight text-slate-950 break-words">{highlightText(examSet.title, searchSpec)}</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${visualStatusClass}`}>
              {activeGenerationJob ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {visualStatus}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{highlightText(examSet.summary, searchSpec)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Tags aria-hidden className="h-3.5 w-3.5" />
            Keywords: {highlightText(keywordsText, searchSpec)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Exam category {categoryLabel} · Editions {editionCount}</p>
          <p className="mt-1 text-xs text-slate-500">Generated {examSet.generateCount} time(s)</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <Clock3 aria-hidden className="h-3.5 w-3.5" />
            Updated {new Date(examSet.updatedAt).toLocaleString()}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className={`${examActionButtonClass} border border-slate-300 bg-white text-slate-700`} href={`/dashboard/exams/${examSet.id}/edit`}>
              <Pencil aria-hidden className="mr-1.5 h-3.5 w-3.5" />
              Edit draft
            </Link>
            {examSet.status === 'published' ? (
              <Link className={`${examActionButtonClass} bg-slate-950 text-white`} href={`/exams/${examSet.id}`}>
                <Play aria-hidden className="mr-1.5 h-3.5 w-3.5" />
                Solve published set
              </Link>
            ) : (
              <form action={publishExamSetAction}>
                <input name="examSetId" type="hidden" value={examSet.id} />
                <button className={`${examActionButtonClass} cursor-pointer bg-slate-950 text-white`} type="submit">
                  <Sparkles aria-hidden className="mr-1.5 h-3.5 w-3.5" />
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
              attemptsByExamSet.map((attempt) => (
                <DashboardAttemptItem
                  key={attempt.id}
                  attempt={attempt}
                  editionNumber={attempt.publishedAtSnapshot ? (editionBySnapshot.get(attempt.publishedAtSnapshot) ?? null) : null}
                  totalCount={attempt.questionsSnapshot.length > 0 ? attempt.questionsSnapshot.length : examSet.questions.length}
                />
              ))
            ) : (
              <p className="rounded-2xl bg-white p-3 text-sm text-slate-500">No trials yet for this exam set.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
