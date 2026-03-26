'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const QUEUED_POLL_DELAY_MS = 10_000;
const RUNNING_POLL_DELAY_MS = 5_000;
const MAX_AUTO_POLL_DURATION_MS = 3 * 60 * 1000;

type ActiveJobStatusPayload = {
  jobs?: Array<{
    id: string;
    examSetId: string | null;
    status: 'queued' | 'running';
    updatedAt: string;
  }>;
  error?: string;
};

export function DashboardGeneratingPoller({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const startedAt = Date.now();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = (delayMs: number) => {
      timer = setTimeout(() => {
        void poll();
      }, delayMs);
    };

    const poll = async () => {
      if (stopped) {
        return;
      }
      const elapsed = Date.now() - startedAt;
      if (elapsed >= MAX_AUTO_POLL_DURATION_MS) {
        return;
      }

      try {
        const response = await fetch('/api/exam-generation-jobs/active', {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = (await response.json()) as ActiveJobStatusPayload;
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to poll generation jobs.');
        }

        const activeJobs = payload.jobs ?? [];
        if (activeJobs.length === 0) {
          router.refresh();
          return;
        }

        router.refresh();
        const hasRunning = activeJobs.some((job) => job.status === 'running');
        schedule(hasRunning ? RUNNING_POLL_DELAY_MS : QUEUED_POLL_DELAY_MS);
      } catch {
        schedule(QUEUED_POLL_DELAY_MS);
      }
    };

    schedule(QUEUED_POLL_DELAY_MS);

    return () => {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [enabled, router]);

  return null;
}
