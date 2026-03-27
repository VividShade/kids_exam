'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Bucket = '15m' | '1h' | '6h' | '1d' | '1w';

type ObservabilitySummary = {
  healthStatus: 'healthy' | 'degraded' | 'down';
  totalRequests: number;
  requestFailures: number;
  responseFailures: number;
  failedJobs: number;
  failureRate: number;
  estimatedWeeklyBudgetUsd: number;
  estimatedMonthlyBudgetUsd: number;
  projectedWeeklyCostUsd: number;
  throughputSeries: Array<{
    bucketStart: string;
    requests: number;
    success: number;
    failed: number;
    avgLatencyMs: number;
    tokenTotal: number;
    costUsd: number;
  }>;
  topErrorTypes: Array<{ errorType: string; count: number }>;
  abuseCandidates: Array<{ userId: string; requests: number }>;
};

const bucketOptions: Bucket[] = ['15m', '1h', '6h', '1d', '1w'];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(
    new Date(value),
  );
}

export function AdminObservabilityPanel() {
  const [bucket, setBucket] = useState<Bucket>('1h');
  const [data, setData] = useState<ObservabilitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await fetch(`/api/admin/observability/summary?bucket=${bucket}`, { cache: 'no-store' });
      if (response.ok) {
        setData((await response.json()) as ObservabilitySummary);
      }
      setLoading(false);
    }

    void load();
  }, [bucket]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-2">
        {bucketOptions.map((option) => (
          <button
            className={`rounded-full border px-3 py-1 text-sm ${bucket === option ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
            key={option}
            onClick={() => setBucket(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Health</p>
          <p className="mt-2 text-xl font-black text-slate-950">{data?.healthStatus ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Requests</p>
          <p className="mt-2 text-xl font-black text-slate-950">{data?.totalRequests.toLocaleString() ?? '-'}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Failure rate</p>
          <p className="mt-2 text-xl font-black text-slate-950">{data ? `${data.failureRate}%` : '-'}</p>
          <Link className="mt-3 inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4" href="/admin/logs?status=failed">
            실패 로그 보기
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Projected weekly cost</p>
          <p className="mt-2 text-xl font-black text-slate-950">{data ? `$${data.projectedWeeklyCostUsd}` : '-'}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">실패 유형</h2>
            <Link className="text-sm font-semibold text-slate-700 underline underline-offset-4" href="/admin/logs?status=failed">
              로그 탐색
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(data?.topErrorTypes ?? []).map((item) => (
              <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2" key={item.errorType}>
                <span>{item.errorType}</span>
                <Link className="font-semibold text-slate-700 underline underline-offset-4" href={`/admin/logs?status=failed&errorType=${encodeURIComponent(item.errorType)}`}>
                  {item.count}건
                </Link>
              </li>
            ))}
            {(data?.topErrorTypes.length ?? 0) === 0 ? <li className="text-slate-500">실패 유형 데이터 없음</li> : null}
          </ul>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-950">예산 기준</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>주간 예산: ${data?.estimatedWeeklyBudgetUsd ?? '-'}</p>
            <p>월간 예산: ${data?.estimatedMonthlyBudgetUsd ?? '-'}</p>
            <p>주간 예상 사용: ${data?.projectedWeeklyCostUsd ?? '-'}</p>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">처리량 및 실패 추이</h2>
        {loading ? <p className="mt-2 text-sm text-slate-500">불러오는 중...</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.15em] text-slate-500">
                <th className="px-2 py-2">Bucket</th>
                <th className="px-2 py-2">Req</th>
                <th className="px-2 py-2">Success</th>
                <th className="px-2 py-2">Fail</th>
                <th className="px-2 py-2">Latency</th>
                <th className="px-2 py-2">Tokens</th>
                <th className="px-2 py-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {(data?.throughputSeries ?? []).map((item) => (
                <tr className="border-b border-slate-100" key={item.bucketStart}>
                  <td className="px-2 py-2 text-xs text-slate-600">{formatDateTime(item.bucketStart)}</td>
                  <td className="px-2 py-2">{item.requests}</td>
                  <td className="px-2 py-2">{item.success}</td>
                  <td className="px-2 py-2">{item.failed}</td>
                  <td className="px-2 py-2">{item.avgLatencyMs}ms</td>
                  <td className="px-2 py-2">{item.tokenTotal.toLocaleString()}</td>
                  <td className="px-2 py-2">${item.costUsd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">이상 사용 후보</h2>
        <p className="mt-2 text-sm text-slate-600">최근 24시간 사용자 기준으로 요청이 많은 계정입니다. (50+)</p>
        <ul className="mt-3 space-y-2 text-sm">
          {(data?.abuseCandidates ?? []).map((candidate) => (
            <li className="rounded-xl bg-slate-50 px-3 py-2" key={candidate.userId}>
              <Link className="font-semibold text-slate-700 underline underline-offset-4" href={`/admin/logs?userId=${encodeURIComponent(candidate.userId)}`}>
                {candidate.userId}
              </Link>{' '}
              · {candidate.requests} req
            </li>
          ))}
          {(data?.abuseCandidates.length ?? 0) === 0 ? <li className="text-slate-500">탐지된 후보 없음</li> : null}
        </ul>
      </section>
    </div>
  );
}
