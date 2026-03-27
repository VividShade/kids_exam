import { NextResponse } from 'next/server';

import { getAdminApiActor } from '@/lib/admin-auth';
import { listAdminUserSummaries, listRecentFeedback } from '@/lib/repository';

export async function GET() {
  const actor = await getAdminApiActor();
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, feedback] = await Promise.all([listAdminUserSummaries(100), listRecentFeedback(50)]);

  const signedUpUsers = users.length;
  const activeUsers = users.filter((item) => item.recentRequestCount > 0 || item.recentAttemptCount > 0).length;
  const suspendedUsers = users.filter((item) => item.status === 'suspended').length;

  return NextResponse.json({
    summary: {
      signedUpUsers,
      activeUsers,
      suspendedUsers,
    },
    users,
    feedback,
  });
}
