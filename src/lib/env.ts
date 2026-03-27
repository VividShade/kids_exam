import { z } from 'zod';

const envUrlSchema = z.string().default('').refine(
  (value) => {
    if (!value) {
      return true;
    }
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid URL when provided.' },
);

const rawEnvSchema = z.object({
  AUTH_SECRET: z.string().default(''),
  AUTH_GOOGLE_ID: z.string().default(''),
  AUTH_GOOGLE_SECRET: z.string().default(''),
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4.1'),
  SUPABASE_DB_URL: envUrlSchema,
  SUPABASE_URL: envUrlSchema,
  SUPABASE_SECRET_KEY: z.string().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('exam-source-images'),
  ADMIN_EMAILS: z.string().default(''),
  CRON_SECRET: z.string().default(''),
  EXAM_SET_GENERATE_LIMIT: z.coerce.number().int().positive().default(5),
  LOCAL_DB_PATH: z.string().min(1).default('data/app.db'),
});

const parsedEnv = rawEnvSchema.parse(process.env);

export const env = {
  authSecret: parsedEnv.AUTH_SECRET,
  googleClientId: parsedEnv.AUTH_GOOGLE_ID,
  googleClientSecret: parsedEnv.AUTH_GOOGLE_SECRET,
  openAiApiKey: parsedEnv.OPENAI_API_KEY,
  openAiModel: parsedEnv.OPENAI_MODEL,
  supabaseDbUrl: parsedEnv.SUPABASE_DB_URL,
  supabaseUrl: parsedEnv.SUPABASE_URL,
  supabaseSecretKey: parsedEnv.SUPABASE_SECRET_KEY,
  supabaseStorageBucket: parsedEnv.SUPABASE_STORAGE_BUCKET,
  adminEmails: parsedEnv.ADMIN_EMAILS,
  cronSecret: parsedEnv.CRON_SECRET,
  examSetGenerateLimit: parsedEnv.EXAM_SET_GENERATE_LIMIT,
  localDbPath: parsedEnv.LOCAL_DB_PATH,
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
