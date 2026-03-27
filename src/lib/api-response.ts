import { NextResponse } from 'next/server';

type ApiErrorPayload = {
  error: string;
  code?: string;
};

export function apiErrorResponse(status: number, error: string, code?: string) {
  const payload: ApiErrorPayload = code ? { error, code } : { error };
  return NextResponse.json(payload, { status });
}

export function apiErrorFromUnknown(
  error: unknown,
  options: {
    status?: number;
    fallbackMessage: string;
    code?: string;
  },
) {
  const message = error instanceof Error ? error.message : options.fallbackMessage;
  return apiErrorResponse(options.status ?? 400, message, options.code);
}
