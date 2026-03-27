import { NextResponse } from 'next/server';

import { getAdminApiActor } from '@/lib/admin-auth';
import { getNextHourlyScheduleIso, scanOrphanStoragePaths } from '@/lib/admin-storage-cleanup';
import { listRecentCleanupJobs } from '@/lib/repository';

export async function GET() {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ allPaths, referencedPaths, orphanPaths }, jobs] = await Promise.all([scanOrphanStoragePaths(), listRecentCleanupJobs(20)]);
  const lastRun = jobs[0] ?? null;

  return NextResponse.json({
    orphanedCount: orphanPaths.length,
    totalPathCount: allPaths.length,
    referencedCount: referencedPaths.length,
    lastJob: lastRun,
    nextScheduledAt: getNextHourlyScheduleIso(),
  });
}
