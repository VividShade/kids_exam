import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { deleteAttemptAction, publishExamSetAction } from '@/app/dashboard/actions';
import { SignOutButton } from '@/components/auth-buttons';
import { DashboardGeneratingPoller } from '@/components/dashboard-generating-poller';
import { adminEmailList } from '@/lib/env';
import { listActiveExamGenerationJobsByUser, listDashboardData } from '@/lib/repository';

function formatPercent(correctCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return '0%';
  }
  const raw = (correctCount / totalCount) * 100;
  const rounded = Math.round(raw * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

const trialActionButtonClass = 'rounded-full border px-3 py-2 text-xs font-semibold leading-none';
const examActionButtonClass = 'inline-flex h-10 items-center justify-center rounded-full px-4 !text-sm !font-semibold leading-none';
const categoryLabelByShortcutId: Record<string, string> = {
  vocabulary_mix: 'Vocabulary',
  reading_check: 'Reading',
  grammar_practice: 'Grammar',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const [{ examSets, attempts }, activeGenerationJobs] = await Promise.all([
    listDashboardData(session.user.id),
    listActiveExamGenerationJobsByUser(session.user.id),
  ]);
  const isAdmin = !!session.user.email && adminEmailList.includes(session.user.email.toLowerCase());
  const activeJobByExamSetId = new Map(activeGenerationJobs.map((job) => [job.examSetId, job]));
  const attemptsByExamSetId = attempts.reduce<Record<string, typeof attempts>>((acc, attempt) => {
    if (!acc[attempt.examSetId]) {
      acc[attempt.examSetId] = [];
    }
    acc[attempt.examSetId].push(attempt);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6,0,#f8fafc_45%,#e2e8f0_100%)] px-4 py-8 md:px-8">
      <DashboardGeneratingPoller enabled={activeGenerationJobs.length > 0} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-[0_32px_120px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Teacher dashboard</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">Exam creation, publishing, and review</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-600">
                Create new sets from photos, revise existing drafts, publish ready sets, and track every trial with score and wrong-question review.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700" href="/dashboard/settings">
                Settings
              </Link>
              <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href="/dashboard/exams/new">
                New exam set
              </Link>
              {isAdmin ? (
                <Link className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700" href="/admin/ai-logs">
                  Admin AI Logs
                </Link>
              ) : null}
              <SignOutButton />
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">Your exam sets</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{examSets.length} total</span>
            </div>
            <div className="space-y-4">
              {examSets.length > 0 ? (
                examSets.map((examSet) => {
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
                    new Set(attemptsByExamSet.map((attempt) => attempt.publishedAtSnapshot).filter((snapshot): snapshot is string => !!snapshot)),
                  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                  const editionBySnapshot = new Map(editionSnapshots.map((snapshot, index) => [snapshot, index + 1]));
                  return (
                    <article key={examSet.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <div className="flex flex-wrap items-start gap-2">
                            <h3 className="text-xl font-bold leading-tight text-slate-950 break-words">{examSet.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${visualStatusClass}`}>
                              {activeGenerationJob ? (
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : null}
                              {visualStatus}
                            </span>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm text-slate-600">{examSet.summary}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Keywords: {keywordsText}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Category {categoryLabel} · Editions {editionCount}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">Generated {examSet.generateCount} time(s)</p>
                          <p className="mt-2 text-xs text-slate-500">Updated {new Date(examSet.updatedAt).toLocaleString()}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link className={`${examActionButtonClass} border border-slate-300 bg-white text-slate-700`} href={`/dashboard/exams/${examSet.id}/edit`}>
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
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{attemptsByExamSet.length}</span>
                          </div>
                          <div className="space-y-3">
                            {attemptsByExamSet.length > 0 ? (
                              attemptsByExamSet.map((attempt) => {
                                const totalCount = attempt.questionsSnapshot.length > 0 ? attempt.questionsSnapshot.length : examSet.questions.length;
                                const correctCount = Math.max(0, totalCount - attempt.wrongQuestionIds.length);
                                const percent = formatPercent(correctCount, totalCount);
                                const progressCount = Math.min(Math.max(attempt.currentIndex + 1, 0), totalCount);
                                const progressPercent = formatPercent(progressCount, totalCount);
                                const editionNumber = attempt.publishedAtSnapshot ? editionBySnapshot.get(attempt.publishedAtSnapshot) : null;
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
                                          <p className="mt-1 text-xs text-slate-500">Completed {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : '-'}</p>
                                        ) : (
                                          <p className="mt-1 text-xs text-slate-500">Saved at question {attempt.currentIndex + 1} — {progressPercent} done</p>
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
                  No exam sets yet. Start by uploading a worksheet or textbook photo.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
