'use client';

import { useMemo, useState } from 'react';

import { JsonTreeViewer } from '@/components/json-tree-viewer';
import type { OpenAiLogRecord } from '@/lib/types';

const modelPricingPer1M: Record<string, { input: number; output: number }> = {
  'gpt-5.4': { input: 2.5, output: 15 },
  'gpt-5.4-mini': { input: 0.75, output: 4.5 },
  'gpt-5.4-nano': { input: 0.2, output: 1.25 },
  'gpt-5.4-pro': { input: 30, output: 180 },
  'gpt-5.2': { input: 1.75, output: 14 },
  'gpt-5.2-pro': { input: 21, output: 168 },
  'gpt-5.1': { input: 1.25, output: 10 },
  'gpt-5': { input: 1.25, output: 10 },
  'gpt-5-mini': { input: 0.25, output: 2 },
  'gpt-5-nano': { input: 0.05, output: 0.4 },
  'gpt-5-pro': { input: 15, output: 120 },
};

function formatCost(value: number | null) {
  if (value === null) {
    return '-';
  }
  return `$${value.toFixed(4)}`;
}

function estimateCostUsd(model: string, inputTokens: number | null, outputTokens: number | null) {
  if (inputTokens === null || outputTokens === null) {
    return null;
  }
  const pricing = modelPricingPer1M[model];
  if (!pricing) {
    return null;
  }
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function AdminAiLogsPanel({ logs, initialVisibleCount = 10, loadStep = 10 }: { logs: OpenAiLogRecord[]; initialVisibleCount?: number; loadStep?: number }) {
  const [visibleCount, setVisibleCount] = useState(Math.max(1, initialVisibleCount));
  const visibleLogs = useMemo(() => logs.slice(0, visibleCount), [logs, visibleCount]);
  const logsWithResolvedCost = useMemo(
    () =>
      visibleLogs.map((item) => ({
        ...item,
        resolvedEstimatedCostUsd: item.estimatedCostUsd ?? estimateCostUsd(item.model, item.inputTokens, item.outputTokens),
      })),
    [visibleLogs],
  );

  const totalRequests = logsWithResolvedCost.length;
  const totalInputTokens = logsWithResolvedCost.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0);
  const totalOutputTokens = logsWithResolvedCost.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0);
  const totalTokens = logsWithResolvedCost.reduce((sum, item) => sum + (item.totalTokens ?? 0), 0);
  const knownCostEntries = logsWithResolvedCost.filter((item) => item.resolvedEstimatedCostUsd !== null);
  const totalCost = knownCostEntries.reduce((sum, item) => sum + (item.resolvedEstimatedCostUsd ?? 0), 0);
  const totalCostDisplay = knownCostEntries.length > 0 ? formatCost(totalCost) : '-';
  const avgLatency =
    totalRequests > 0
      ? Math.round(logsWithResolvedCost.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0) / totalRequests)
      : 0;
  const hasMore = visibleCount < logs.length;

  return (
    <>
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
          <p className="mt-2 text-xl font-black text-slate-950">{totalCostDisplay}</p>
          <p className="mt-1 text-sm text-slate-600">{avgLatency.toLocaleString()} ms</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <h2 className="text-xl font-bold text-slate-950">Recent requests</h2>
        <p className="mt-2 text-xs text-slate-500">Statistics and list are based on currently loaded items (latest {logsWithResolvedCost.length}).</p>
        <div className="mt-4 space-y-4">
          {logsWithResolvedCost.length > 0 ? (
            logsWithResolvedCost.map((log) => (
              <details key={log.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer list-none">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex flex-col">
                      <span className="text-sm font-bold text-slate-950">{log.model}</span>
                      <span className="mt-1 text-xs text-slate-500">{formatDateTime(log.createdAt)}</span>
                    </span>
                      <span className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Input {(log.inputTokens ?? 0).toLocaleString()}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Output {(log.outputTokens ?? 0).toLocaleString()}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Total {(log.totalTokens ?? 0).toLocaleString()}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Latency {(log.latencyMs ?? 0).toLocaleString()}ms</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{formatCost(log.resolvedEstimatedCostUsd)}</span>
                    </span>
                  </span>
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
          <div className="mt-4 flex justify-center">
            <button
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setVisibleCount((current) => Math.min(logs.length, current + Math.max(1, loadStep)))}
              type="button"
            >
              더 불러오기
            </button>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-slate-500">더 불러올 로그가 없습니다.</p>
        )}
      </section>
    </>
  );
}
