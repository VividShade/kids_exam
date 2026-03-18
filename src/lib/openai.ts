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
  summary: z.string().min(1),
  gradeBand: z.string().min(1),
  sourceSummary: z.string().min(1),
  recommendedPrompts: z.array(z.string()).min(3).max(5),
  questions: z.array(QuestionSchema).min(1),
});

let openaiClient: OpenAI | null = null;

function getClient() {
  if (!isOpenAIConfigured) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return openaiClient;
}

export async function generateExamSetFromImage(input: {
  imageDataUrl: string;
  config: ExamBuilderConfig;
  notes: string;
}) {
  const response = await getClient().responses.parse({
    model: env.openAiModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: buildExamGenerationPrompt(input.config, input.notes),
          },
          {
            type: 'input_image',
            image_url: input.imageDataUrl,
          },
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

  const parsed = response.output_parsed as GeneratedExamSet;
  return {
    ...parsed,
    questions: parsed.questions.map((question, index) => ({
      ...question,
      id: question.id || `q_${index + 1}`,
      choices: question.choices ?? [],
    })),
  };
}
