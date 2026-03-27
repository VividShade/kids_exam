'use client';

import { useEffect, useState } from 'react';

type CleanupSummary = {
  orphanedCount: number;
  totalPathCount: number;
  referencedCount: number;
  nextScheduledAt: string;
};

type CleanupRun = {
  id: string;
  runType: 'scheduled' | 'manual';
  status: 'success' | 'failed';
  triggeredBy: string | null;
  dryRun: boolean;
  orphanCount: number;
  removedCount: number;
  failedCount: number;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function AdminOperationsPanel() {
  const [summary, setSummary] = useState<CleanupSummary | null>(null);
  const [runs, setRuns] = useState<CleanupRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  async function loadData() {
    setIsLoading(true);
    try {
      const [summaryRes, runsRes] = await Promise.all([
        fetch('/api/admin/storage-cleanup/summary', { cache: 'no-store' }),
        fetch('/api/admin/storage-cleanup/runs', { cache: 'no-store' }),
      ]);
      if (summaryRes.ok) {
        setSummary((await summaryRes.json()) as CleanupSummary);
      }
      if (runsRes.ok) {
        const data = (await runsRes.json()) as { runs: CleanupRun[] };
        setRuns(data.runs ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function runManual(dryRun: boolean) {
    setIsRunning(true);
    setLastMessage('');
    try {
      const response = await fetch('/api/admin/storage-cleanup/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = (await response.json()) as { orphanCount?: number; removedCount?: number; error?: string; dryRun?: boolean };
      if (!response.ok) {
        throw new Error(data.error ?? '실행 중 오류가 발생했습니다.');
      }

      setLastMessage(
        data.dryRun
          ? `Dry-run 완료: 고아 파일 ${data.orphanCount ?? 0}건 탐지`
          : `실제 삭제 완료: ${data.removedCount ?? 0}건 삭제`,
      );
      await loadData();
    } catch (error) {
      setLastMessage(error instanceof Error ? error.message : '실행 실패');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Orphaned</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{summary?.orphanedCount.toLocaleString() ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Referenced</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{summary?.referencedCount.toLocaleString() ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Stored</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{summary?.totalPathCount.toLocaleString() ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Scheduled</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{summary ? formatDateTime(summary.nextScheduledAt) : '-'}</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">수동 실행</h2>
        <p className="mt-2 text-sm text-slate-600">먼저 Dry-run으로 대상 수를 확인한 후 실제 삭제를 실행하세요.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            disabled={isRunning}
            onClick={() => runManual(true)}
            type="button"
          >
            Dry-run 실행
          </button>
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isRunning}
            onClick={() => runManual(false)}
            type="button"
          >
            실제 삭제 실행
          </button>
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => void loadData()}
            type="button"
          >
            새로고침
          </button>
        </div>
        {lastMessage ? <p className="mt-3 text-sm text-slate-700">{lastMessage}</p> : null}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-950">처리 기록</h2>
          {isLoading ? <p className="text-xs text-slate-500">불러오는 중...</p> : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.15em] text-slate-500">
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Dry-run</th>
                <th className="px-2 py-2">Orphans</th>
                <th className="px-2 py-2">Removed</th>
                <th className="px-2 py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr className="border-b border-slate-100" key={run.id}>
                  <td className="px-2 py-2 text-xs text-slate-600">{formatDateTime(run.createdAt)}</td>
                  <td className="px-2 py-2">{run.runType}</td>
                  <td className="px-2 py-2">{run.status}</td>
                  <td className="px-2 py-2">{run.dryRun ? 'yes' : 'no'}</td>
                  <td className="px-2 py-2">{run.orphanCount}</td>
                  <td className="px-2 py-2">{run.removedCount}</td>
                  <td className="px-2 py-2 text-xs text-slate-600">{run.triggeredBy ?? '-'}</td>
                </tr>
              ))}
              {runs.length === 0 ? (
                <tr>
                  <td className="px-2 py-4 text-sm text-slate-500" colSpan={7}>
                    아직 실행 기록이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
