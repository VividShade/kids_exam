import { NextResponse } from 'next/server';

import { getAdminApiActor } from '@/lib/admin-auth';
import { listAdminCleanupRuns, listRecentCleanupJobs } from '@/lib/repository';

export async function GET() {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [manualRuns, scheduledJobs] = await Promise.all([listAdminCleanupRuns(30), listRecentCleanupJobs(30)]);

  const scheduledRuns = scheduledJobs.map((job) => ({
    id: `scheduled-${job.id}`,
    runType: 'scheduled' as const,
    status: job.status === 'failed' ? 'failed' : 'success',
    triggeredBy: 'system',
    dryRun: false,
    orphanCount: 0,
    removedCount: 0,
    failedCount: job.status === 'failed' ? 1 : 0,
    durationMs: null,
    errorMessage: job.lastError,
    createdAt: job.updatedAt,
  }));

  const runs = [...manualRuns, ...scheduledRuns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  return NextResponse.json({ runs });
}
