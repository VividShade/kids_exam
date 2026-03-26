export const env = {
  authSecret: process.env.AUTH_SECRET ?? '',
  googleClientId: process.env.AUTH_GOOGLE_ID ?? '',
  googleClientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1',
  supabaseDbUrl: process.env.SUPABASE_DB_URL ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'exam-source-images',
  adminEmails: process.env.ADMIN_EMAILS ?? '',
  cronSecret: process.env.CRON_SECRET ?? '',
  examSetGenerateLimit: Number(process.env.EXAM_SET_GENERATE_LIMIT ?? '5'),
  localDbPath: process.env.LOCAL_DB_PATH ?? 'data/app.db',
};

export const isGoogleAuthConfigured =
  env.authSecret.length > 0 && env.googleClientId.length > 0 && env.googleClientSecret.length > 0;

export const isOpenAIConfigured = env.openAiApiKey.length > 0;
export const isSupabaseConfigured = env.supabaseDbUrl.length > 0;
export const isSupabaseStorageConfigured =
  env.supabaseUrl.length > 0 && env.supabaseSecretKey.length > 0 && env.supabaseStorageBucket.length > 0;
export const adminEmailList = env.adminEmails
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
