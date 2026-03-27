'use client';

import { LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';

const buttonClassName =
  'inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white';

type SignInButtonProps = {
  isConfigured: boolean;
};

export function SignInButton({ isConfigured }: SignInButtonProps) {
  if (!isConfigured) {
    return (
      <button className={`${buttonClassName} cursor-not-allowed opacity-50`} disabled>
        <ShieldAlert aria-hidden className="mr-2 h-4 w-4" />
        Configure Google OAuth first
      </button>
    );
  }

  return (
    <button
      className={buttonClassName}
      onClick={() => {
        void signIn('google', { callbackUrl: '/dashboard' });
      }}
      type="button"
    >
      <LogIn aria-hidden className="mr-2 h-4 w-4" />
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className={buttonClassName}
      onClick={() => {
        void signOut({ callbackUrl: '/' });
      }}
      type="button"
    >
      <LogOut aria-hidden className="mr-2 h-4 w-4" />
      Sign out
    </button>
  );
}
