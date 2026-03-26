import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { JsonTreeViewer } from '@/components/json-tree-viewer';
import { adminEmailList } from '@/lib/env';
import { listOpenAiLogs } from '@/lib/repository';

function formatCost(value: number) {
  return `$${value.toFixed(4)}`;
}

function parseResponseJson(input: string | null) {
  if (!input) {
    return null;
  }
  try {
    return JSON.parse(input) as unknown as null | boolean | number | string | unknown[] | Record<string, unknown>;
  } catch {
    return null;
  }
}

function parsePositiveInt(input: string | undefined, fallback: number) {
  const parsed = Number(input ?? '');
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export default async function AdminAiLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect('/');
  }

  const isAdmin = adminEmailList.includes(session.user.email.toLowerCase());
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const pageSize = Math.min(100, Math.max(1, parsePositiveInt(resolvedSearchParams.limit, 10)));
  const requestedLogs = await listOpenAiLogs(pageSize + 1, 0);
  const hasMore = requestedLogs.length > pageSize;
  const logs = hasMore ? requestedLogs.slice(0, pageSize) : requestedLogs;

  const totalRequests = logs.length;
  const totalInputTokens = logs.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0);
  const totalOutputTokens = logs.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0);
  const totalTokens = logs.reduce((sum, item) => sum + (item.totalTokens ?? 0), 0);
  const totalCost = logs.reduce((sum, item) => sum + (item.estimatedCostUsd ?? 0), 0);
  const avgLatency =
    totalRequests > 0
      ? Math.round(logs.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0) / totalRequests)
      : 0;

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

        <section className="grid gap-4 md:grid-cols-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Requests</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{totalRequests}</p>
            <p className="mt-1 text-xs text-slate-500">Loaded range only</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Input Tokens</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{totalInputTokens.toLocaleString()}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Output Tokens</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{totalOutputTokens.toLocaleString()}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Tokens</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{totalTokens.toLocaleString()}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Est. Cost / Avg Latency</p>
            <p className="mt-2 text-xl font-black text-slate-950">{formatCost(totalCost)}</p>
            <p className="mt-1 text-sm text-slate-600">{avgLatency} ms</p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-slate-950">Recent requests</h2>
          <p className="mt-2 text-xs text-slate-500">
            Statistics and list are based on currently loaded items (latest {logs.length}).
          </p>
          <div className="mt-4 space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <details key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-950">{log.model}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Input {log.inputTokens ?? 0}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Output {log.outputTokens ?? 0}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Total {log.totalTokens ?? 0}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Latency {log.latencyMs ?? 0}ms</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{formatCost(log.estimatedCostUsd ?? 0)}</span>
                      </div>
                    </div>
                  </summary>
                  {(() => {
                    const parsedResponse = parseResponseJson(log.responseJson);
                    return (
                      <div className="mt-3 space-y-2">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prompt (no images)</p>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{log.promptText}</pre>
                        </div>
                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Response</p>
                          <div className="mt-2">
                            {parsedResponse ? (
                              <JsonTreeViewer value={parsedResponse as never} />
                            ) : (
                              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{log.responseText ?? log.responseJson ?? '-'}</pre>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </details>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No OpenAI logs yet.</p>
            )}
          </div>
          {hasMore ? (
            <div className="mt-4">
              <Link
                className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                href={`/admin/ai-logs?limit=${pageSize + 10}`}
              >
                더 불러오기
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
