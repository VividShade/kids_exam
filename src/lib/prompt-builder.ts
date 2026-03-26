import type { ExamBuilderConfig } from '@/lib/types';

const promptStartByLanguage = {
  en: 'Create an exam set from the attached image materials.',
  ko: '첨부된 이미지 자료를 바탕으로 시험 세트를 생성해줘.',
  es: 'Crea un conjunto de examen basado en los materiales de imagen adjuntos.',
} as const;

export function buildExamGenerationPrompt(config: ExamBuilderConfig, notes: string) {
  const blueprintLines = config.blueprints
    .map((blueprint, index) => {
      return `${index + 1}. ${blueprint.label}: ${blueprint.count} questions, format=${blueprint.format}, focus=${blueprint.focus}`;
    })
    .join('\n');

  const startLine = promptStartByLanguage[config.promptLanguage] ?? promptStartByLanguage.en;

  return [
    startLine,
    `Target grade band: ${config.gradeBand}.`,
    `Requested title: ${config.title}.`,
    `Prompt language for instruction: ${config.promptLanguage}.`,
    `Output language for exam questions and answers: ${config.examLanguage}.`,
    '',
    'Question blueprint:',
    blueprintLines,
    '',
    'Output rules:',
    `- Write the full exam in ${config.examLanguage}.`,
    '- Match the level and wording to the requested grade band.',
    '- Use only content supported by the uploaded material unless the teacher note explicitly asks for an extension.',
    '- Every question must include a concise explanation for the answer.',
    '- For multiple choice and true/false questions, include the answer choices in the choices array.',
    '- For short answer questions, keep the expected answer short and directly gradable.',
    '',
    'Teacher notes:',
    notes || 'No extra teacher notes were provided.',
    '',
    'Also provide:',
    '- a one-paragraph summary of the source material',
    '- 3 short follow-up prompt suggestions the teacher can reuse for regeneration',
  ].join('\n');
}
