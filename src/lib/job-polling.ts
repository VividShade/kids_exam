export const JOB_POLLING_CONFIG = {
  initialDelayByContextMs: {
    builder: 12_000,
    dashboard: 10_000,
  },
  queuedDelayMs: 10_000,
  runningDelayMs: 5_000,
  maxAutoDurationMs: 3 * 60 * 1000,
} as const;

export type PollingContext = keyof typeof JOB_POLLING_CONFIG.initialDelayByContextMs;
export type ActiveJobStatus = 'queued' | 'running';

export function getInitialJobPollDelayMs(context: PollingContext) {
  return JOB_POLLING_CONFIG.initialDelayByContextMs[context];
}

export function getJobPollDelayMs(status: ActiveJobStatus) {
  return status === 'running' ? JOB_POLLING_CONFIG.runningDelayMs : JOB_POLLING_CONFIG.queuedDelayMs;
}

export function isJobAutoPollingTimedOut(startedAtMs: number, nowMs = Date.now()) {
  return nowMs - startedAtMs >= JOB_POLLING_CONFIG.maxAutoDurationMs;
}
