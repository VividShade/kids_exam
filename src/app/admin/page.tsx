import Link from 'next/link';

import { requireAdminPageSession } from '@/lib/admin-auth';

const sections = [
  {
    href: '/admin/operations',
    title: 'Operations',
    description: '고아 이미지 정리, 스케줄 작업 상태, 수동 실행',
  },
  {
    href: '/admin/observability',
    title: 'Observability',
    description: '헬스 체크, 처리량, 실패율, 비용 추정',
  },
  {
    href: '/admin/logs',
    title: 'Logs & Trace',
    description: 'OpenAI 요청/응답 로그 검색 및 상세 조회',
  },
  {
    href: '/admin/users',
    title: 'Users',
    description: '가입/활성/이탈 추이, 제재, 피드백 관리',
  },
];

export default async function AdminIndexPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_40%,#eef2ff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Admin</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">운영 대시보드</h1>
          <p className="mt-2 text-sm text-slate-600">{session.user.email}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link className="rounded-3xl border border-slate-200 bg-white p-5 hover:border-slate-300" href={section.href} key={section.href}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{section.title}</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">{section.description}</h2>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
