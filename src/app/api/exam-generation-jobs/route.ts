import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiErrorFromUnknown, apiErrorResponse } from '@/lib/api-response';
import { processExamGenerationJobById } from '@/lib/exam-generation-jobs';
import { env } from '@/lib/env';
import { createExamGenerationJob, getOwnedExamSetGenerateCount } from '@/lib/repository';
import { examGenerationJobPayloadSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  try {
    const payload = examGenerationJobPayloadSchema.parse(await request.json());
    if (payload.examSetId) {
      const count = await getOwnedExamSetGenerateCount(payload.examSetId, session.user.id);
      if (count >= env.examSetGenerateLimit) {
        return apiErrorResponse(
          400,
          `Generation limit reached for this exam set (${env.examSetGenerateLimit}).`,
          'GENERATION_LIMIT_REACHED',
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
    return apiErrorFromUnknown(error, {
      fallbackMessage: 'Failed to queue generation job.',
      code: 'GENERATION_JOB_ENQUEUE_FAILED',
    });
  }
}
