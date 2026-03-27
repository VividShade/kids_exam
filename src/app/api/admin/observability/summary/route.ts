import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAdminApiActor } from '@/lib/admin-auth';
import { getObservabilitySummary } from '@/lib/admin-observability';

const querySchema = z.object({
  bucket: z.enum(['15m', '1h', '6h', '1d', '1w']).default('1h'),
});

export async function GET(request: Request) {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.parse({ bucket: searchParams.get('bucket') ?? undefined });
  const summary = await getObservabilitySummary(parsed.bucket);
  return NextResponse.json(summary);
}
