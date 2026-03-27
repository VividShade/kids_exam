import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAdminApiActor } from '@/lib/admin-auth';
import { suspendUser } from '@/lib/repository';

const payloadSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(body);

  await suspendUser({ userId: payload.userId, actorId: actor.userId, reason: payload.reason ?? null });
  return NextResponse.json({ ok: true });
}
