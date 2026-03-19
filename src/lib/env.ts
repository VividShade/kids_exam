export const env = {
  authSecret: process.env.AUTH_SECRET ?? '',
  googleClientId: process.env.AUTH_GOOGLE_ID ?? '',
  googleClientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1',
  supabaseDbUrl: process.env.SUPABASE_DB_URL ?? '',
  localDbPath: process.env.LOCAL_DB_PATH ?? 'data/app.db',
};

export const isGoogleAuthConfigured =
  env.authSecret.length > 0 && env.googleClientId.length > 0 && env.googleClientSecret.length > 0;

export const isOpenAIConfigured = env.openAiApiKey.length > 0;
export const isSupabaseConfigured = env.supabaseDbUrl.length > 0;
