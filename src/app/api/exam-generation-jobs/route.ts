import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { processExamGenerationJobById } from '@/lib/exam-generation-jobs';
import { env } from '@/lib/env';
import { createExamGenerationJob, getOwnedExamSetGenerateCount } from '@/lib/repository';

const payloadSchema = z.object({
  examSetId: z.string().optional(),
  imageDataUrls: z.array(z.string().min(1)).min(1).max(6),
  notes: z.string().default(''),
  title: z.string().min(1),
  promptText: z.string().min(1),
  sourceImages: z
    .array(
      z.object({
        id: z.string(),
        originalPath: z.string(),
        thumbnailPath: z.string(),
        width: z.number(),
        height: z.number(),
        thumbWidth: z.number(),
        thumbHeight: z.number(),
        sizeBytes: z.number(),
        uploadedAt: z.string(),
      }),
    )
    .max(6),
  config: z.object({
    title: z.string().default(''),
    gradeBand: z.string().min(1),
    notes: z.string().default(''),
    uiLanguage: z.enum(['en', 'ko', 'es']).default('en'),
    promptLanguage: z.enum(['en', 'ko', 'es']).default('en'),
    sourceLanguage: z.string().default('auto'),
    examLanguage: z.string().min(1),
    blueprints: z.array(
      z.object({
        label: z.string().min(1),
        format: z.enum(['multiple_choice', 'true_false', 'short_answer']),
        count: z.number().int().positive(),
        focus: z.string().min(1),
      }),
    ),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
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
