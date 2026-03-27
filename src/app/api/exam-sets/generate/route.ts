import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiErrorFromUnknown, apiErrorResponse } from '@/lib/api-response';
import { env } from '@/lib/env';
import { generateExamSetFromImages } from '@/lib/openai';
import { createOpenAiLog, getOwnedExamSetGenerateCount, incrementExamSetGenerateCount } from '@/lib/repository';
import { directGenerateExamSetRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  try {
    const body = await request.json();
    const parsed = directGenerateExamSetRequestSchema.parse(body);
    if (parsed.examSetId) {
      const count = await getOwnedExamSetGenerateCount(parsed.examSetId, session.user.id);
      if (count >= env.examSetGenerateLimit) {
        return apiErrorResponse(
          400,
          `Generation limit reached for this exam set (${env.examSetGenerateLimit}).`,
          'GENERATION_LIMIT_REACHED',
        );
      }
    }
    const result = await generateExamSetFromImages({
      imageDataUrls: parsed.imageDataUrls,
      config: parsed.config,
      notes: parsed.notes,
    });
    const generationLogId = await createOpenAiLog({
      userId: session.user.id,
      examSetId: parsed.examSetId ?? null,
      ...result.log,
    });
    if (parsed.examSetId) {
      await incrementExamSetGenerateCount(parsed.examSetId, session.user.id);
    }

    return NextResponse.json({
      ...result.generated,
      generationLogId,
    });
  } catch (error) {
    return apiErrorFromUnknown(error, {
      fallbackMessage: 'Failed to generate exam set.',
      code: 'EXAM_SET_GENERATION_FAILED',
    });
  }
}
