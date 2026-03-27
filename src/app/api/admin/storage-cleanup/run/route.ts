import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAdminApiActor } from '@/lib/admin-auth';
import { scanOrphanStoragePaths } from '@/lib/admin-storage-cleanup';
import { createAdminCleanupRun } from '@/lib/repository';
import { deleteStoragePaths } from '@/lib/storage';

const payloadSchema = z.object({
  dryRun: z.boolean().default(true),
});

export async function POST(request: Request) {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { dryRun } = payloadSchema.parse(body);

  const start = Date.now();

  try {
    const { orphanPaths } = await scanOrphanStoragePaths();
    if (!dryRun && orphanPaths.length > 0) {
      await deleteStoragePaths(orphanPaths);
    }

    const durationMs = Date.now() - start;
    await createAdminCleanupRun({
      runType: 'manual',
      status: 'success',
      triggeredBy: actor.email,
      dryRun,
      orphanCount: orphanPaths.length,
      removedCount: dryRun ? 0 : orphanPaths.length,
      failedCount: 0,
      durationMs,
    });

    return NextResponse.json({
      ok: true,
      dryRun,
      orphanCount: orphanPaths.length,
      removedCount: dryRun ? 0 : orphanPaths.length,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown cleanup error';

    await createAdminCleanupRun({
      runType: 'manual',
      status: 'failed',
      triggeredBy: actor.email,
      dryRun,
      orphanCount: 0,
      removedCount: 0,
      failedCount: 1,
      durationMs,
      errorMessage: message,
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
