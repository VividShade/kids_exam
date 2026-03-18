import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { isGoogleAuthConfigured } from '@/lib/env';
import { upsertUser } from '@/lib/repository';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  providers: isGoogleAuthConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.email) {
        const appUser = await upsertUser({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account?.provider ?? 'google',
          providerAccountId: account?.providerAccountId,
        });
        token.appUserId = appUser.id;
        token.providerAccountId = account?.providerAccountId;
      }

      if (!token.appUserId && token.email) {
        const appUser = await upsertUser({
          email: token.email,
          name: token.name,
          image: typeof token.picture === 'string' ? token.picture : null,
          provider: 'google',
          providerAccountId: token.providerAccountId,
        });
        token.appUserId = appUser.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user?.email && token.appUserId) {
        session.user.id = token.appUserId;
      }

      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});
