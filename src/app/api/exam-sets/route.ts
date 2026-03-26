import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { attachOpenAiLogToExamSet, saveExamSet } from '@/lib/repository';
import { saveExamSetRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = saveExamSetRequestSchema.parse(await request.json());
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
