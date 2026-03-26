import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { env } from '@/lib/env';
import { generateExamSetFromImages } from '@/lib/openai';
import { createOpenAiLog, getOwnedExamSetGenerateCount, incrementExamSetGenerateCount } from '@/lib/repository';
import { directGenerateExamSetRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = directGenerateExamSetRequestSchema.parse(body);
    if (parsed.examSetId) {
      const count = await getOwnedExamSetGenerateCount(parsed.examSetId, session.user.id);
      if (count >= env.examSetGenerateLimit) {
        return NextResponse.json(
          { error: `Generation limit reached for this exam set (${env.examSetGenerateLimit}).` },
          { status: 400 },
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
    const message = error instanceof Error ? error.message : 'Failed to generate exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
