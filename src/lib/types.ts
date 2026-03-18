export type QuestionKind = 'multiple_choice' | 'true_false' | 'short_answer';

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
  sourceImageDataUrl: string | null;
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
