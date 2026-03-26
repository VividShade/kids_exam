import type { QuestionBlueprint, UILanguage } from '@/lib/types';

export type BuilderSignatureInput = {
  title: string;
  gradeBand: string;
  notes: string;
  uiLanguage: UILanguage;
  promptLanguage: UILanguage;
  sourceLanguage: string;
  examLanguage: string;
  selectedShortcutId: string;
  imageIds: string[];
  blueprints: QuestionBlueprint[];
  generatedQuestionCount: number;
};

export function createBuilderSignature(input: BuilderSignatureInput) {
  return JSON.stringify(input);
}
