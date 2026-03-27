import Link from 'next/link';

import { AdminOperationsPanel } from '@/components/admin-operations-panel';
import { requireAdminPageSession } from '@/lib/admin-auth';

export default async function AdminOperationsPage() {
  await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_40%,#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Admin / Operations</p>
              <h1 className="text-3xl font-black text-slate-950">스케줄 작업 현황 및 수동 실행</h1>
            </div>
            <Link className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/admin">
              Admin 홈
            </Link>
          </div>
        </section>
        <AdminOperationsPanel />
      </div>
    </main>
  );
}
