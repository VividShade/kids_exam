import { z } from 'zod';

export const questionKindSchema = z.enum(['multiple_choice', 'true_false', 'short_answer']);
export const uiLanguageSchema = z.enum(['en', 'ko', 'es']);

export const examQuestionSchema = z.object({
  id: z.string().min(1),
  kind: questionKindSchema,
  prompt: z.string().min(1),
  choices: z.array(z.string()),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

export const questionBlueprintSchema = z.object({
  presetId: z.string().min(1).optional(),
  label: z.string().min(1),
  description: z.string().min(1).optional(),
  format: questionKindSchema,
  count: z.number().int().positive(),
  focus: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const examBuilderConfigSchema = z.object({
  title: z.string().default(''),
  gradeBand: z.string().min(1),
  notes: z.string().default(''),
  uiLanguage: uiLanguageSchema.default('en'),
  promptLanguage: uiLanguageSchema.default('en'),
  sourceLanguage: z.string().default('auto'),
  examLanguage: z.string().min(1),
  blueprints: z.array(questionBlueprintSchema),
});

export const examSourceImageSchema = z.object({
  id: z.string(),
  originalPath: z.string(),
  thumbnailPath: z.string(),
  width: z.number(),
  height: z.number(),
  thumbWidth: z.number(),
  thumbHeight: z.number(),
  sizeBytes: z.number(),
  uploadedAt: z.string(),
});

export const generatedExamSetSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  gradeBand: z.string().min(1),
  sourceSummary: z.string().min(1),
  outputSummary: z.string().min(1),
  sourceKeywords: z.array(z.string()),
  outputKeywords: z.array(z.string()),
  recommendedPrompts: z.array(z.string()),
  questions: z.array(examQuestionSchema).min(1),
});

export const examGenerationJobPayloadSchema = z.object({
  examSetId: z.string().optional(),
  imageDataUrls: z.array(z.string().min(1)).min(1).max(6),
  selectedShortcutId: z.string().min(1),
  customPrompt: z.string().default(''),
  title: z.string().min(1),
  sourceImages: z.array(examSourceImageSchema).max(6),
  config: examBuilderConfigSchema,
});

export const examGenerationJobResultSchema = z.object({
  examSetId: z.string().min(1),
  generationLogId: z.string().min(1),
  title: z.string().min(1),
  generated: generatedExamSetSchema,
});

export const saveExamSetRequestSchema = z.object({
  id: z.string().optional(),
  generationLogId: z.string().optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  selectedShortcutId: z.string().min(1),
  customPrompt: z.string().nullable().optional(),
  outputKeywords: z.array(z.string()).optional(),
  sourceImages: z.array(examSourceImageSchema).max(6).optional(),
  sourceNotes: z.string().nullable().optional(),
  config: examBuilderConfigSchema,
  questions: z.array(examQuestionSchema),
});

export const directGenerateExamSetRequestSchema = z.object({
  examSetId: z.string().optional(),
  imageDataUrls: z.array(z.string().min(1)).min(1).max(6),
  notes: z.string().default(''),
  config: examBuilderConfigSchema,
});

export const uploadExamSourceImageInputSchema = z.object({
  originalBase64: z.string().min(1),
  thumbnailBase64: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  thumbWidth: z.number().positive(),
  thumbHeight: z.number().positive(),
  sizeBytes: z.number().int().positive(),
});

export const uploadExamSourceImagesRequestSchema = z.object({
  images: z.array(uploadExamSourceImageInputSchema).min(1).max(6),
});
