import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiErrorFromUnknown, apiErrorResponse } from '@/lib/api-response';
import { attachOpenAiLogToExamSet, saveExamSet } from '@/lib/repository';
import { saveExamSetRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
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
    return apiErrorFromUnknown(error, {
      fallbackMessage: 'Failed to save exam set.',
      code: 'EXAM_SET_SAVE_FAILED',
    });
  }
}
