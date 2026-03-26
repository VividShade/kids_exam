import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ReviewDetailClient } from '@/components/review-detail-client';
import { getAttemptById, getOwnedExamSetById } from '@/lib/repository';

function formatPercent(correctCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return '0%';
  }
  const raw = (correctCount / totalCount) * 100;
  const rounded = Math.round(raw * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { attemptId } = await params;

  const attempt = await getAttemptById(attemptId, session.user.id);
  if (!attempt || attempt.status !== 'completed') {
    notFound();
  }

  const examSet = await getOwnedExamSetById(attempt.examSetId, session.user.id);
  if (!examSet) {
    notFound();
  }

  const questionSource = attempt.questionsSnapshot.length > 0 ? attempt.questionsSnapshot : examSet.questions;
  const title = attempt.examTitleSnapshot || examSet.title;
  const totalCount = questionSource.length;
  const correctCount = Math.max(0, totalCount - attempt.wrongQuestionIds.length);
  const percent = formatPercent(correctCount, totalCount);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6,0,#f8fafc_45%,#e2e8f0_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Review</p>
              <h1 className="text-3xl font-black text-slate-950">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Completed {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : '-'}
              </p>
            </div>
            <Link className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard">
              Back to dashboard
            </Link>
          </div>
          <div className="mt-4 inline-flex items-baseline rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            <span>Result: {correctCount} / {totalCount}</span>
            <span className="ml-2 text-xs font-normal text-slate-600">({percent})</span>
          </div>
        </section>

        <ReviewDetailClient answers={attempt.answers} questions={questionSource} wrongQuestionIds={attempt.wrongQuestionIds} />
      </div>
    </main>
  );
}
