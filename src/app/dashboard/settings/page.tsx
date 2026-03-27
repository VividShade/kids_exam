import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { UserLanguageSettings } from '@/components/user-language-settings';

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6,0,#f8fafc_45%,#e2e8f0_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Settings</p>
              <h1 className="flex items-center gap-2 text-3xl font-black text-slate-950">
                <Settings aria-hidden className="h-7 w-7" />
                User preferences
              </h1>
            </div>
            <Link className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard">
              <ArrowLeft aria-hidden className="mr-1.5 h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </section>
        <UserLanguageSettings />
      </div>
    </main>
  );
}
