import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { env, isOpenAIConfigured } from '@/lib/env';
import { buildExamGenerationPrompt } from '@/lib/prompt-builder';
import type { ExamBuilderConfig, GeneratedExamSet } from '@/lib/types';

const QuestionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  prompt: z.string().min(1),
  choices: z.array(z.string()).default([]),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

const GeneratedExamSetSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  gradeBand: z.string().min(1),
  sourceSummary: z.string().min(1),
  outputSummary: z.string().min(1),
  sourceKeywords: z.array(z.string()).min(3).max(30),
  outputKeywords: z.array(z.string()).min(3).max(30),
  recommendedPrompts: z.array(z.string()).min(3).max(5),
  questions: z.array(QuestionSchema).min(1),
});

let openaiClient: OpenAI | null = null;

const modelPricingPer1M: Record<string, { input: number; output: number }> = {
  'gpt-4.1': { input: 2, output: 8 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4 },
};

function getClient() {
  if (!isOpenAIConfigured) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return openaiClient;
}

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const pricing = modelPricingPer1M[model];
  if (!pricing) {
    return null;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}

export async function generateExamSetFromImages(input: {
  imageDataUrls: string[];
  config: ExamBuilderConfig;
  notes: string;
}) {
  const promptText = buildExamGenerationPrompt(input.config, input.notes);
  const startedAt = Date.now();

  const response = await getClient().responses.parse({
    model: env.openAiModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: promptText,
          },
          ...input.imageDataUrls.map((imageDataUrl) => ({
            type: 'input_image' as const,
            image_url: imageDataUrl,
            detail: 'auto' as const,
          })),
        ],
      },
    ],
    text: {
      format: zodTextFormat(GeneratedExamSetSchema, 'generated_exam_set'),
    },
  });

  if (!response.output_parsed) {
    throw new Error('OpenAI did not return structured exam data.');
  }

  const latencyMs = Date.now() - startedAt;
  const inputTokens = response.usage?.input_tokens ?? null;
  const outputTokens = response.usage?.output_tokens ?? null;
  const totalTokens = response.usage?.total_tokens ?? null;
  const estimatedCostUsd =
    inputTokens !== null && outputTokens !== null
      ? estimateCostUsd(env.openAiModel, inputTokens, outputTokens)
      : null;

  const parsed = response.output_parsed as GeneratedExamSet;
  const normalized = {
    ...parsed,
    summary: parsed.summary ?? parsed.outputSummary,
    questions: parsed.questions.map((question, index) => ({
      ...question,
      id: question.id || `q_${index + 1}`,
      choices: question.choices ?? [],
    })),
  };

  return {
    generated: normalized,
    log: {
      model: env.openAiModel,
      promptText,
      responseText: response.output_text ?? null,
      responseJson: JSON.stringify(normalized),
      latencyMs,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd,
    },
  };
}
