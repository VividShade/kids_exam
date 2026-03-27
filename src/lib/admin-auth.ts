import 'server-only';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { adminEmailList } from '@/lib/env';

export async function requireAdminPageSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect('/');
  }

  const isAdmin = adminEmailList.includes(session.user.email.toLowerCase());
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return session;
}

export async function getAdminApiActor() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  const isAdmin = adminEmailList.includes(session.user.email.toLowerCase());
  if (!isAdmin) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}
