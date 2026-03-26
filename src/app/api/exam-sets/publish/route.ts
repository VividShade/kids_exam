import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { publishExamSet } from '@/lib/repository';

const payloadSchema = z.object({
  examSetId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    await publishExamSet(payload.examSetId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish exam set.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
