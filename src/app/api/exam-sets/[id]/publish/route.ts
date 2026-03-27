import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiErrorResponse } from '@/lib/api-response';
import { publishExamSet } from '@/lib/repository';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const { id } = await context.params;
  await publishExamSet(id, session.user.id);
  return NextResponse.json({ ok: true });
}
