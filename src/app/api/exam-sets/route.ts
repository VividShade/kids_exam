import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { attachOpenAiLogToExamSet, saveExamSet } from '@/lib/repository';

const payloadSchema = z.object({
  id: z.string().optional(),
  generationLogId: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
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
    .max(5)
    .optional(),
  sourceNotes: z.string().nullable().optional(),
  config: z.object({
    title: z.string().min(1),
    gradeBand: z.string().min(1),
    notes: z.string(),
    uiLanguage: z.enum(['en', 'ko', 'es']).default('en'),
    promptLanguage: z.enum(['en', 'ko', 'es']).default('en'),
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
  questions: z.array(
    z.object({
      id: z.string().min(1),
      kind: z.enum(['multiple_choice', 'true_false', 'short_answer']),
      prompt: z.string().min(1),
      choices: z.array(z.string()),
      answer: z.string().min(1),
      explanation: z.string().min(1),
    }),
  ),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const { generationLogId, ...examPayload } = payload;
    const examSetId = await saveExamSet({
      ...examPayload,
      ownerId: session.user.id,
    });
    if (generationLogId) {
      await attachOpenAiLogToExamSet(generationLogId, examSetId, session.user.id);
    }

    return NextResponse.json({ examSetId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
