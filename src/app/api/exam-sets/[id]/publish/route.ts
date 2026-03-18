import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { publishExamSet } from '@/lib/repository';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  await publishExamSet(id, session.user.id);
  return NextResponse.json({ ok: true });
}
