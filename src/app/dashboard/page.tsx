import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { deleteAttemptAction, publishExamSetAction } from '@/app/dashboard/actions';
import { SignOutButton } from '@/components/auth-buttons';
import { listDashboardData } from '@/lib/repository';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { examSets, attempts } = await listDashboardData(session.user.id);
  const examSetById = new Map(examSets.map((examSet) => [examSet.id, examSet]));
  const activeAttempts = attempts.filter((attempt) => attempt.status !== 'completed');
  const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed');

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6,0,#f8fafc_45%,#e2e8f0_100%)] px-4 py-8 md:px-8">
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
              <Link className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href="/dashboard/exams/new">
                New exam set
              </Link>
              <SignOutButton />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">Your exam sets</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{examSets.length} total</span>
            </div>
            <div className="space-y-4">
              {examSets.length > 0 ? (
                examSets.map((examSet) => (
                  <article key={examSet.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-950">{examSet.title}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${examSet.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {examSet.status}
                          </span>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">{examSet.summary}</p>
                        <p className="mt-2 text-xs text-slate-500">Updated {new Date(examSet.updatedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href={`/dashboard/exams/${examSet.id}/edit`}>
                          Edit draft
                        </Link>
                        {examSet.status === 'published' ? (
                          <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={`/exams/${examSet.id}`}>
                            Solve published set
                          </Link>
                        ) : (
                          <form action={publishExamSetAction}>
                            <input name="examSetId" type="hidden" value={examSet.id} />
                            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white" type="submit">
                              Publish
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 p-8 text-sm text-slate-500">
                  No exam sets yet. Start by uploading a worksheet or textbook photo.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-950">Unfinished trials</h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{activeAttempts.length}</span>
              </div>
              <div className="space-y-3">
                {activeAttempts.length > 0 ? (
                  activeAttempts.map((attempt) => {
                    const examSet = examSetById.get(attempt.examSetId);
                    return (
                      <article key={attempt.id} className="rounded-[1.5rem] bg-slate-50 p-4">
                        <p className="text-sm font-bold text-slate-950">{examSet?.title ?? 'Published set'}</p>
                        <p className="mt-1 text-xs text-slate-500">Saved at question {attempt.currentIndex + 1}</p>
                        <div className="mt-3 flex gap-2">
                          <Link className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" href={`/exams/${attempt.examSetId}?attempt=${attempt.id}`}>
                            Resume
                          </Link>
                          <form action={deleteAttemptAction}>
                            <input name="attemptId" type="hidden" value={attempt.id} />
                            <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" type="submit">
                              Delete trial
                            </button>
                          </form>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-500">There are no unfinished trials right now.</p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-950">Review history</h2>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">{completedAttempts.length}</span>
              </div>
              <div className="space-y-4">
                {completedAttempts.length > 0 ? (
                  completedAttempts.map((attempt) => {
                    const examSet = examSetById.get(attempt.examSetId);
                    const wrongPrompts = examSet?.questions
                      .filter((question) => attempt.wrongQuestionIds.includes(question.id))
                      .map((question) => question.prompt) ?? [];

                    return (
                      <article key={attempt.id} className="rounded-[1.5rem] bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-950">{examSet?.title ?? 'Published set'}</p>
                            <p className="mt-1 text-xs text-slate-500">Completed {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : '-'}</p>
                          </div>
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Score {attempt.score ?? 0}</span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          {wrongPrompts.length > 0 ? (
                            wrongPrompts.map((prompt) => (
                              <p key={prompt} className="rounded-2xl bg-white px-3 py-2">
                                Wrong: {prompt}
                              </p>
                            ))
                          ) : (
                            <p className="rounded-2xl bg-white px-3 py-2 text-emerald-700">Perfect attempt. No wrong questions recorded.</p>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-500">Completed attempts will appear here with scores and wrong-question review.</p>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
