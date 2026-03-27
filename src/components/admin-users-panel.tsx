'use client';

import { useEffect, useState } from 'react';

type UserSummary = {
  userId: string;
  email: string;
  createdAt: string;
  status: 'active' | 'suspended';
  recentRequestCount: number;
  recentAttemptCount: number;
};

type Feedback = {
  id: string;
  userId: string | null;
  category: string;
  message: string;
  status: string;
  createdAt: string;
};

type UsersResponse = {
  summary: {
    signedUpUsers: number;
    activeUsers: number;
    suspendedUsers: number;
  };
  users: UserSummary[];
  feedback: Feedback[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value));
}

export function AdminUsersPanel() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('abuse suspected');

  async function load() {
    setIsLoading(true);
    const response = await fetch('/api/admin/users/summary', { cache: 'no-store' });
    if (response.ok) {
      setData((await response.json()) as UsersResponse);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function suspend() {
    if (!selectedUser) {
      return;
    }

    const response = await fetch('/api/admin/users/suspend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser, reason }),
    });

    if (response.ok) {
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">가입자</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{data?.summary.signedUpUsers ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">활성 사용자</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{data?.summary.activeUsers ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">정지 사용자</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{data?.summary.suspendedUsers ?? '-'}</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">사용 정지 처리</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <select className="rounded-full border border-slate-300 px-3 py-2 text-sm" onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
            <option value="">사용자 선택</option>
            {(data?.users ?? []).map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.email}
              </option>
            ))}
          </select>
          <input className="min-w-[280px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm" onChange={(e) => setReason(e.target.value)} value={reason} />
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void suspend()} type="button">
            정지 처리
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">사용자 현황</h2>
        {isLoading ? <p className="mt-2 text-sm text-slate-500">불러오는 중...</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.15em] text-slate-500">
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">가입일</th>
                <th className="px-2 py-2">상태</th>
                <th className="px-2 py-2">7d req</th>
                <th className="px-2 py-2">7d attempts</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users ?? []).map((user) => (
                <tr className="border-b border-slate-100" key={user.userId}>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2 text-xs text-slate-600">{formatDateTime(user.createdAt)}</td>
                  <td className="px-2 py-2">{user.status}</td>
                  <td className="px-2 py-2">{user.recentRequestCount}</td>
                  <td className="px-2 py-2">{user.recentAttemptCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">사용자 피드백</h2>
        <ul className="mt-4 space-y-2">
          {(data?.feedback ?? []).slice(0, 30).map((item) => (
            <li className="rounded-xl bg-slate-50 p-3" key={item.id}>
              <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)} · {item.category} · {item.status}</p>
              <p className="mt-1 text-sm text-slate-700">{item.message}</p>
            </li>
          ))}
          {(data?.feedback.length ?? 0) === 0 ? <li className="text-sm text-slate-500">피드백 없음</li> : null}
        </ul>
      </section>
    </div>
  );
}
