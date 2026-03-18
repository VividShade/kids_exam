import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { generateExamSetFromImage } from '@/lib/openai';

const requestSchema = z.object({
  imageDataUrl: z.string().min(1),
  notes: z.string().default(''),
  config: z.object({
    title: z.string().min(1),
    gradeBand: z.string().min(1),
    notes: z.string().default(''),
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
    const generated = await generateExamSetFromImage({
      imageDataUrl: parsed.imageDataUrl,
      config: parsed.config,
      notes: parsed.notes,
    });

    return NextResponse.json(generated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
