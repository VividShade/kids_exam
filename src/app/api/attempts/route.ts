import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { createOrResumeAttempt, getPublishedExamSetById } from '@/lib/repository';

const requestSchema = z.object({
  examSetId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { examSetId } = requestSchema.parse(await request.json());
    const examSet = await getPublishedExamSetById(examSetId);

    if (!examSet) {
      return NextResponse.json({ error: 'Published exam set not found.' }, { status: 404 });
    }

    const attempt = await createOrResumeAttempt({
      examSetId,
      userId: session.user.id,
      examTitle: examSet.title,
      questions: examSet.questions,
      publishedAt: examSet.publishedAt,
    });
    return NextResponse.json(attempt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create attempt.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
