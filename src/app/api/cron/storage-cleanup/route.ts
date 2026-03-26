import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/lib/env';
import { claimCleanupJobs, createCleanupJobForStoragePaths, listReferencedStoragePaths, markCleanupJobDone, markCleanupJobFailed } from '@/lib/repository';
import { deleteStoragePaths, listAllStoragePaths } from '@/lib/storage';

const payloadSchema = z.object({
  mode: z.enum(['run-jobs', 'scan-orphans']).default('run-jobs'),
  limit: z.number().int().min(1).max(100).optional(),
});

const jobPayloadSchema = z.object({
  paths: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (!env.cronSecret || secret !== env.cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { mode, limit = 20 } = payloadSchema.parse(body);

  if (mode === 'scan-orphans') {
    const [allPaths, referencedPaths] = await Promise.all([listAllStoragePaths(), listReferencedStoragePaths()]);
    const referenced = new Set(referencedPaths);
    const orphanPaths = allPaths.filter((path) => !referenced.has(path));
    const chunkSize = 100;
    let createdJobs = 0;
    for (let index = 0; index < orphanPaths.length; index += chunkSize) {
      const chunk = orphanPaths.slice(index, index + chunkSize);
      const jobId = await createCleanupJobForStoragePaths(chunk);
      if (jobId) {
        createdJobs += 1;
      }
    }
    return NextResponse.json({
      ok: true,
      mode,
      allPaths: allPaths.length,
      referencedPaths: referencedPaths.length,
      orphanPaths: orphanPaths.length,
      createdJobs,
    });
  }

  const jobs = await claimCleanupJobs(limit);

  let processed = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      const payload = jobPayloadSchema.parse(JSON.parse(job.payloadJson));
      await deleteStoragePaths(payload.paths);
      await markCleanupJobDone(job.id);
      processed += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown cleanup error';
      await markCleanupJobFailed(job.id, job.retryCount + 1, message);
    }
  }

  return NextResponse.json({
    ok: true,
    claimed: jobs.length,
    processed,
    failed,
  });
}
