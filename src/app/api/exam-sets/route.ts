import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { saveExamSet } from '@/lib/repository';

const payloadSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  promptText: z.string().min(1),
  sourceImageDataUrl: z.string().nullable().optional(),
  sourceNotes: z.string().nullable().optional(),
  config: z.object({
    title: z.string().min(1),
    gradeBand: z.string().min(1),
    notes: z.string(),
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
    const examSetId = await saveExamSet({
      ...payload,
      ownerId: session.user.id,
    });

    return NextResponse.json({ examSetId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
