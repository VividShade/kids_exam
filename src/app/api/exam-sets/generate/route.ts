import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiErrorFromUnknown, apiErrorResponse } from '@/lib/api-response';
import { env } from '@/lib/env';
import { createId } from '@/lib/id';
import { generateExamSetFromImages } from '@/lib/openai';
import { buildExamGenerationPrompt } from '@/lib/prompt-builder';
import { createOpenAiLog, getOwnedExamSetGenerateCount, incrementExamSetGenerateCount } from '@/lib/repository';
import { directGenerateExamSetRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
  }
  const correlationId = createId('trace');
  let rawBody: unknown = null;
  let parsedInput:
    | {
        examSetId?: string | null;
        imageDataUrls: string[];
        config: Parameters<typeof buildExamGenerationPrompt>[0];
        notes: string;
      }
    | null = null;

  try {
    rawBody = await request.json();
    const parsed = directGenerateExamSetRequestSchema.parse(rawBody);
    parsedInput = parsed;
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
      correlationId,
      route: '/api/exam-sets/generate',
      status: 'success',
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
    const message = error instanceof Error ? error.message : 'Failed to generate exam set.';
    const parsed = parsedInput ? { success: true as const, data: parsedInput } : directGenerateExamSetRequestSchema.safeParse(rawBody);
    if (parsed.success) {
      await createOpenAiLog({
        userId: session.user.id,
        examSetId: parsed.data.examSetId ?? null,
        correlationId,
        route: '/api/exam-sets/generate',
        status: 'failed',
        errorType: 'openai_request_failure',
        model: env.openAiModel,
        promptText: buildExamGenerationPrompt(parsed.data.config, parsed.data.notes),
        responseText: message,
      }).catch(() => undefined);
    }
    return apiErrorFromUnknown(error, {
      fallbackMessage: 'Failed to generate exam set.',
      code: 'EXAM_SET_GENERATION_FAILED',
    });
  }
}
