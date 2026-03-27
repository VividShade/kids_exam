import Link from 'next/link';
import { AlertTriangle, CheckCircle2, LayoutDashboard } from 'lucide-react';

import { auth } from '@/auth';
import { SignInButton, SignOutButton } from '@/components/auth-buttons';
import { isGoogleAuthConfigured, isOpenAIConfigured, isSupabaseConfigured, isSupabaseStorageConfigured } from '@/lib/env';

const checks = [
  { label: 'Google OAuth', ready: isGoogleAuthConfigured },
  { label: 'OpenAI multi-modal', ready: isOpenAIConfigured },
  { label: 'Supabase deploy DB', ready: isSupabaseConfigured },
  { label: 'Supabase private storage', ready: isSupabaseStorageConfigured },
  { label: 'SQLite local fallback', ready: true },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff1c2_0%,#f8fafc_45%,#dbeafe_100%)] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/75 p-6 shadow-[0_32px_120px_rgba(15,23,42,0.16)] backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Kids exam studio</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-slate-950 md:text-6xl">
                Turn worksheet photos into publishable exam sets with history-aware review.
              </h1>
              <p className="mt-6 max-w-2xl text-base text-slate-600 md:text-lg">
                Sign in with Google, upload a textbook page or practice sheet, generate questions with OpenAI multi-modal input, and keep every trial with scores and wrong answers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {session?.user ? (
                  <>
                    <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white" href="/dashboard">
                      <LayoutDashboard aria-hidden className="mr-2 inline h-4 w-4" />
                      Open dashboard
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <SignInButton isConfigured={isGoogleAuthConfigured} />
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Infra checklist</p>
              <div className="mt-5 space-y-3">
                {checks.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.ready ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-400/20 text-amber-100'}`}>
                      {item.ready ? (
                        <CheckCircle2 aria-hidden className="mr-1 inline h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle aria-hidden className="mr-1 inline h-3.5 w-3.5" />
                      )}
                      {item.ready ? 'Ready' : 'Needs env'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
