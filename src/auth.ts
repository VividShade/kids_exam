import NextAuth, { getServerSession, type AuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';

import { env, isGoogleAuthConfigured } from '@/lib/env';
import { upsertUser } from '@/lib/repository';

const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: isGoogleAuthConfigured
    ? [
        Google({
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
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
};

const handler = NextAuth(authOptions);

export const handlers = {
  GET: handler,
  POST: handler,
};

export const auth = () => getServerSession(authOptions);

