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
  sourceLanguage: string;
  examLanguage: string;
  blueprints: QuestionBlueprint[];
};

export type ExamSourceImage = {
  id: string;
  originalPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  thumbWidth: number;
  thumbHeight: number;
  sizeBytes: number;
  uploadedAt: string;
  originalSignedUrl?: string;
  thumbnailSignedUrl?: string;
};

export type GeneratedExamSet = {
  title: string;
  summary: string;
  gradeBand: string;
  sourceSummary: string;
  outputSummary: string;
  sourceKeywords: string[];
  outputKeywords: string[];
  recommendedPrompts: string[];
  questions: ExamQuestion[];
};

export type ExamSetRecord = {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  generateCount: number;
  lastGeneratedAt: string | null;
  promptText: string;
  config: ExamBuilderConfig;
  questions: ExamQuestion[];
  sourceImages: ExamSourceImage[];
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
  examTitleSnapshot: string;
  questionsSnapshot: ExamQuestion[];
  publishedAtSnapshot: string | null;
  answers: Record<string, string>;
  currentIndex: number;
  score: number | null;
  wrongQuestionIds: string[];
  shuffleSeed: string;
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

export type CleanupJobRecord = {
  id: string;
  jobType: 'delete_storage_paths';
  payloadJson: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  retryCount: number;
  runAfter: string;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExamGenerationJobRecord = {
  id: string;
  userId: string;
  examSetId: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  payloadJson: string;
  resultJson: string | null;
  errorMessage: string | null;
  retryCount: number;
  runAfter: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};
