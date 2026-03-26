import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/lib/env';
import { processQueuedExamGenerationJobs } from '@/lib/exam-generation-jobs';

const payloadSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (!env.cronSecret || secret !== env.cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { limit } = payloadSchema.parse(body);
  const processed = await processQueuedExamGenerationJobs(limit);

  return NextResponse.json({
    ok: true,
    processed,
  });
}
