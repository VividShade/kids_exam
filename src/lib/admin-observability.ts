import 'server-only';

import { dbAll, dbGet } from '@/lib/db';
import { listOpenAiLogs } from '@/lib/repository';

type BucketSize = '15m' | '1h' | '6h' | '1d' | '1w';

const BUCKET_MS: Record<BucketSize, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

function toBucketStart(timestamp: string, size: BucketSize) {
  const ms = new Date(timestamp).getTime();
  const unit = BUCKET_MS[size];
  const rounded = Math.floor(ms / unit) * unit;
  return new Date(rounded).toISOString();
}

function getResolvedErrorType(log: { status: 'success' | 'failed'; errorType: string | null; responseJson: string | null; responseText: string | null }) {
  if (log.errorType) {
    return log.errorType;
  }
  if (log.status === 'failed' && !log.responseJson && !log.responseText) {
    return 'openai_request_failure';
  }
  if (log.status === 'failed') {
    return 'openai_response_failure';
  }
  return null;
}

export async function getObservabilitySummary(bucketSize: BucketSize = '1h') {
  const logs = await listOpenAiLogs(2000, 0);
  const now = Date.now();
  const recentLogs = logs.filter((log) => now - new Date(log.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);

  const buckets = new Map<string, { requests: number; success: number; failed: number; latencyMsTotal: number; tokenTotal: number; costUsd: number }>();

  for (const log of recentLogs) {
    const key = toBucketStart(log.createdAt, bucketSize);
    const current = buckets.get(key) ?? { requests: 0, success: 0, failed: 0, latencyMsTotal: 0, tokenTotal: 0, costUsd: 0 };
    current.requests += 1;
    const isFailure = log.status === 'failed';
    current.failed += isFailure ? 1 : 0;
    current.success += isFailure ? 0 : 1;
    current.latencyMsTotal += log.latencyMs ?? 0;
    current.tokenTotal += log.totalTokens ?? 0;
    current.costUsd += log.estimatedCostUsd ?? 0;
    buckets.set(key, current);
  }

  const throughputSeries = Array.from(buckets.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([bucketStart, value]) => ({
      bucketStart,
      requests: value.requests,
      success: value.success,
      failed: value.failed,
      avgLatencyMs: value.requests > 0 ? Math.round(value.latencyMsTotal / value.requests) : 0,
      tokenTotal: value.tokenTotal,
      costUsd: Number(value.costUsd.toFixed(6)),
    }));

  const totalRequests = recentLogs.length;
  const requestFailures = recentLogs.filter((item) => getResolvedErrorType(item) === 'openai_request_failure').length;
  const responseFailures = recentLogs.filter((item) => getResolvedErrorType(item) === 'openai_response_failure').length;
  const totalFailures = requestFailures + responseFailures;

  const failedJobsRow = await dbGet<{ count: number | string }>(
    `SELECT COUNT(*) as count
     FROM exam_generation_jobs
     WHERE status = 'failed'`,
  );

  const failedJobs = Number(failedJobsRow?.count ?? 0);
  const failureRate = totalRequests > 0 ? Number(((totalFailures / totalRequests) * 100).toFixed(2)) : 0;
  const healthStatus = failureRate < 5 ? 'healthy' : failureRate < 15 ? 'degraded' : 'down';

  const topIpLikeUsers = await dbAll<{ user_id: string; count: number | string }>(
    `SELECT user_id, COUNT(*) as count
     FROM openai_logs
     WHERE created_at >= ?
     GROUP BY user_id
     ORDER BY count DESC
     LIMIT 5`,
    [new Date(now - 24 * 60 * 60 * 1000).toISOString()],
  );

  const abuseCandidates = topIpLikeUsers
    .map((row) => ({ userId: row.user_id, requests: Number(row.count) }))
    .filter((row) => row.requests >= 50);

  const topErrorTypes = Array.from(
    recentLogs.reduce((accumulator, log) => {
      const key = getResolvedErrorType(log);
      if (!key) {
        return accumulator;
      }
      accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
      return accumulator;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([errorType, count]) => ({ errorType, count }));

  return {
    healthStatus,
    totalRequests,
    requestFailures,
    responseFailures,
    failedJobs,
    failureRate,
    estimatedWeeklyBudgetUsd: 25,
    estimatedMonthlyBudgetUsd: 100,
    projectedWeeklyCostUsd: Number((throughputSeries.reduce((sum, item) => sum + item.costUsd, 0) * 7).toFixed(4)),
    throughputSeries,
    topErrorTypes,
    abuseCandidates,
  };
}
