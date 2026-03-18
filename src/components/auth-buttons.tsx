import { signIn, signOut } from '@/auth';
import { isGoogleAuthConfigured } from '@/lib/env';

const buttonClassName =
  'inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white';

export function SignInButton() {
  if (!isGoogleAuthConfigured) {
    return (
      <button className={`${buttonClassName} cursor-not-allowed opacity-50`} disabled>
        Configure Google OAuth first
      </button>
    );
  }

  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/dashboard' });
      }}
    >
      <button className={buttonClassName} type="submit">
        Sign in with Google
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/' });
      }}
    >
      <button className={buttonClassName} type="submit">
        Sign out
      </button>
    </form>
  );
}
