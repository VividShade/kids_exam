import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { generateExamSetFromImages } from '@/lib/openai';
import { createOpenAiLog } from '@/lib/repository';

const requestSchema = z.object({
  imageDataUrls: z.array(z.string().min(1)).min(1).max(5),
  notes: z.string().default(''),
  config: z.object({
    title: z.string().min(1),
    gradeBand: z.string().min(1),
    notes: z.string().default(''),
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
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const result = await generateExamSetFromImages({
      imageDataUrls: parsed.imageDataUrls,
      config: parsed.config,
      notes: parsed.notes,
    });
    const generationLogId = await createOpenAiLog({
      userId: session.user.id,
      ...result.log,
    });

    return NextResponse.json({
      ...result.generated,
      generationLogId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
