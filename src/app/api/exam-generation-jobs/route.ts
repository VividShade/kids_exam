import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { processExamGenerationJobById } from '@/lib/exam-generation-jobs';
import { env } from '@/lib/env';
import { createExamGenerationJob, getOwnedExamSetGenerateCount } from '@/lib/repository';
import { examGenerationJobPayloadSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = examGenerationJobPayloadSchema.parse(await request.json());
    if (payload.examSetId) {
      const count = await getOwnedExamSetGenerateCount(payload.examSetId, session.user.id);
      if (count >= env.examSetGenerateLimit) {
        return NextResponse.json(
          { error: `Generation limit reached for this exam set (${env.examSetGenerateLimit}).` },
          { status: 400 },
        );
      }
    }

    const jobId = await createExamGenerationJob({
      userId: session.user.id,
      examSetId: payload.examSetId ?? null,
      payloadJson: JSON.stringify(payload),
    });

    void processExamGenerationJobById(jobId);

    return NextResponse.json({ jobId, status: 'queued' as const });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to queue generation job.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
