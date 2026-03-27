import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { apiErrorFromUnknown, apiErrorResponse } from '@/lib/api-response';
import { publishExamSet } from '@/lib/repository';

const payloadSchema = z.object({
  examSetId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    await publishExamSet(payload.examSetId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorFromUnknown(error, {
      fallbackMessage: 'Failed to publish exam set.',
      code: 'EXAM_SET_PUBLISH_FAILED',
    });
  }
}
