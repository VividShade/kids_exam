'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { OpenAiLogRecord } from '@/lib/types';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value));
}

export function AdminLogsPanel({ logs }: { logs: OpenAiLogRecord[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') ?? 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') ?? 'all');
  const [selectedErrorType, setSelectedErrorType] = useState(searchParams.get('errorType') ?? 'all');
  const [selectedRoute, setSelectedRoute] = useState(searchParams.get('route') ?? 'all');

  const modelOptions = useMemo(() => ['all', ...Array.from(new Set(logs.map((item) => item.model)))], [logs]);
  const errorTypeOptions = useMemo(
    () => ['all', ...Array.from(new Set(logs.map((item) => item.errorType).filter((item): item is string => Boolean(item))))],
    [logs],
  );
  const routeOptions = useMemo(
    () => ['all', ...Array.from(new Set(logs.map((item) => item.route).filter((item): item is string => Boolean(item))))],
    [logs],
  );

  const filtered = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return logs.filter((log) => {
      if (selectedModel !== 'all' && log.model !== selectedModel) {
        return false;
      }
      if (selectedStatus !== 'all' && log.status !== selectedStatus) {
        return false;
      }
      if (selectedErrorType !== 'all' && log.errorType !== selectedErrorType) {
        return false;
      }
      if (selectedRoute !== 'all' && log.route !== selectedRoute) {
        return false;
      }
      const userIdFilter = searchParams.get('userId');
      if (userIdFilter && log.userId !== userIdFilter) {
        return false;
      }
      if (!lower) {
        return true;
      }
      return (
        log.id.toLowerCase().includes(lower) ||
        log.userId.toLowerCase().includes(lower) ||
        (log.correlationId ?? '').toLowerCase().includes(lower) ||
        (log.route ?? '').toLowerCase().includes(lower) ||
        (log.errorType ?? '').toLowerCase().includes(lower) ||
        log.status.toLowerCase().includes(lower) ||
        (log.promptText ?? '').toLowerCase().includes(lower) ||
        (log.responseText ?? '').toLowerCase().includes(lower)
      );
    });
  }, [logs, query, searchParams, selectedErrorType, selectedModel, selectedRoute, selectedStatus]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="min-w-[260px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ID, trace, user, route, prompt/response 검색"
          value={query}
        />
        <select className="rounded-full border border-slate-300 px-3 py-2 text-sm" onChange={(event) => setSelectedModel(event.target.value)} value={selectedModel}>
          {modelOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select className="rounded-full border border-slate-300 px-3 py-2 text-sm" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
          <option value="all">all status</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
        </select>
        <select className="rounded-full border border-slate-300 px-3 py-2 text-sm" onChange={(event) => setSelectedErrorType(event.target.value)} value={selectedErrorType}>
          {errorTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select className="rounded-full border border-slate-300 px-3 py-2 text-sm" onChange={(event) => setSelectedRoute(event.target.value)} value={selectedRoute}>
          {routeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-slate-500">총 {filtered.length.toLocaleString()}건</p>

      <div className="mt-4 space-y-3">
        {filtered.slice(0, 200).map((log) => (
          <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3" key={log.id}>
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{log.model}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(log.createdAt)} · {log.userId} · {log.route ?? 'unknown-route'}
                  </p>
                </div>
                <div className="text-xs text-slate-600">
                  <span className="rounded-full bg-white px-2 py-1">{log.status}</span>
                  {log.errorType ? <span className="ml-2 rounded-full bg-white px-2 py-1">{log.errorType}</span> : null}
                  <span className="rounded-full bg-white px-2 py-1">latency {log.latencyMs ?? 0}ms</span>
                  <span className="ml-2 rounded-full bg-white px-2 py-1">tokens {log.totalTokens ?? 0}</span>
                </div>
              </div>
            </summary>
            <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 md:grid-cols-2">
              <p>log id: {log.id}</p>
              <p>trace: {log.correlationId ?? '-'}</p>
              <p>route: {log.route ?? '-'}</p>
              <p>error: {log.errorType ?? '-'}</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <article className="rounded-xl bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prompt</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{log.promptText}</pre>
              </article>
              <article className="rounded-xl bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Response</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{log.responseText ?? log.responseJson ?? '-'}</pre>
              </article>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
