import type { GeneratedExamSet } from '@/lib/types';

function extractGeneratedNode(responseJson: string | null): unknown | null {
  if (!responseJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(responseJson) as unknown;
    if (parsed && typeof parsed === 'object' && 'generated' in parsed) {
      return (parsed as { generated?: unknown }).generated ?? null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function extractGeneratedExamSetFromResponseJson(responseJson: string | null): GeneratedExamSet | null {
  const extracted = extractGeneratedNode(responseJson);
  if (!extracted || typeof extracted !== 'object') {
    return null;
  }

  const candidate = extracted as Partial<GeneratedExamSet>;
  if (
    typeof candidate.title !== 'string' ||
    typeof candidate.gradeBand !== 'string' ||
    typeof candidate.sourceSummary !== 'string' ||
    !Array.isArray(candidate.recommendedPrompts) ||
    !Array.isArray(candidate.questions)
  ) {
    return null;
  }

  const summary = typeof candidate.summary === 'string' ? candidate.summary : '';
  const outputSummary = typeof candidate.outputSummary === 'string' ? candidate.outputSummary : '';

  if (!summary && !outputSummary) {
    return null;
  }

  return {
    title: candidate.title,
    summary: summary || outputSummary,
    gradeBand: candidate.gradeBand,
    sourceSummary: candidate.sourceSummary,
    outputSummary: outputSummary || summary,
    sourceKeywords: Array.isArray(candidate.sourceKeywords) ? candidate.sourceKeywords : [],
    outputKeywords: Array.isArray(candidate.outputKeywords) ? candidate.outputKeywords : [],
    recommendedPrompts: candidate.recommendedPrompts,
    questions: candidate.questions,
  };
}

export function extractOutputKeywordsFromResponseJson(responseJson: string | null) {
  const extracted = extractGeneratedNode(responseJson);
  if (!extracted || typeof extracted !== 'object') {
    return null;
  }

  const candidate = extracted as { outputKeywords?: unknown };
  if (!Array.isArray(candidate.outputKeywords)) {
    return null;
  }

  const values = candidate.outputKeywords.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  return values.length > 0 ? values : null;
}

export function extractQuestionsSignatureFromResponseJson(responseJson: string | null) {
  const extracted = extractGeneratedNode(responseJson);
  if (!extracted || typeof extracted !== 'object') {
    return null;
  }

  const candidate = extracted as { questions?: unknown };
  if (!Array.isArray(candidate.questions)) {
    return null;
  }

  return JSON.stringify(candidate.questions);
}
