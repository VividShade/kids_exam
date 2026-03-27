import Link from 'next/link';
import { FilePlus2, LayoutDashboard, Settings, Shield } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { SignOutButton } from '@/components/auth-buttons';
import { DashboardExamSetsSection } from '@/components/dashboard-exam-sets-section';
import { DashboardGeneratingPoller } from '@/components/dashboard-generating-poller';
import { adminEmailList } from '@/lib/env';
import { listActiveExamGenerationJobsByUser, listDashboardData } from '@/lib/repository';

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6,0,#f8fafc_45%,#e2e8f0_100%)] px-4 py-8 md:px-8">
      <DashboardGeneratingPoller enabled={activeGenerationJobs.length > 0} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-[0_32px_120px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Teacher dashboard</p>
              <h1 className="mt-2 flex items-center gap-2 text-4xl font-black text-slate-950">
                <LayoutDashboard aria-hidden className="h-8 w-8" />
                Exam creation, publishing, and review
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-600">
                Create new sets from photos, revise existing drafts, publish ready sets, and track every trial with score and wrong-question review.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700" href="/dashboard/settings">
                <Settings aria-hidden className="mr-2 h-4 w-4" />
                Settings
              </Link>
              <Link className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href="/dashboard/exams/new">
                <FilePlus2 aria-hidden className="mr-2 h-4 w-4" />
                New exam set
              </Link>
              {isAdmin ? (
                <Link className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700" href="/admin/ai-logs">
                  <Shield aria-hidden className="mr-2 h-4 w-4" />
                  Admin AI Logs
                </Link>
              ) : null}
              <SignOutButton />
            </div>
          </div>
        </section>

        <DashboardExamSetsSection activeGenerationJobs={activeGenerationJobs} attempts={attempts} examSets={examSets} />
      </div>
    </main>
  );
}
