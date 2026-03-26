export type QuestionKind = 'multiple_choice' | 'true_false' | 'short_answer';
export type UILanguage = 'en' | 'ko' | 'es';

export type ExamQuestion = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type QuestionBlueprint = {
  label: string;
  format: QuestionKind;
  count: number;
  focus: string;
};

export type ExamBuilderConfig = {
  title: string;
  gradeBand: string;
  notes: string;
  uiLanguage: UILanguage;
  promptLanguage: UILanguage;
  examLanguage: string;
  blueprints: QuestionBlueprint[];
};

export type GeneratedExamSet = {
  title: string;
  summary: string;
  gradeBand: string;
  sourceSummary: string;
  recommendedPrompts: string[];
  questions: ExamQuestion[];
};

export type ExamSetRecord = {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  promptText: string;
  config: ExamBuilderConfig;
  questions: ExamQuestion[];
  sourceImageDataUrls: string[];
  sourceNotes: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AttemptRecord = {
  id: string;
  examSetId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers: Record<string, string>;
  currentIndex: number;
  score: number | null;
  wrongQuestionIds: string[];
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  abandonedAt: string | null;
};

export type DashboardData = {
  examSets: ExamSetRecord[];
  attempts: AttemptRecord[];
};

export type OpenAiLogRecord = {
  id: string;
  userId: string;
  examSetId: string | null;
  model: string;
  promptText: string;
  responseText: string | null;
  responseJson: string | null;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  createdAt: string;
};
