import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AdminAiLogsPanel } from '@/components/admin-ai-logs-panel';
import { adminEmailList } from '@/lib/env';
import { listOpenAiLogs } from '@/lib/repository';

const MAX_LOGS = 100;
const INITIAL_VISIBLE_LOGS = 10;
const LOAD_STEP = 10;

export default async function AdminAiLogsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect('/');
  }

  const isAdmin = adminEmailList.includes(session.user.email.toLowerCase());
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const logs = await listOpenAiLogs(MAX_LOGS, 0);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_40%,#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Admin</p>
              <h1 className="text-3xl font-black text-slate-950">OpenAI usage and prompt logs</h1>
              <p className="mt-2 text-sm text-slate-600">Prompts exclude image binaries. Cost is estimated based on model pricing defaults.</p>
            </div>
            <Link className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </section>

        <AdminAiLogsPanel initialVisibleCount={INITIAL_VISIBLE_LOGS} loadStep={LOAD_STEP} logs={logs} />
      </div>
    </main>
  );
}
