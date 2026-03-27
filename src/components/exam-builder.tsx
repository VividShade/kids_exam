'use client';

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { createBuilderSignature, type BuilderSignatureInput } from '@/lib/exam-builder-signature';
import { extractGeneratedExamSetFromResponseJson } from '@/lib/generated-exam-parser';
import { compressImageForUpload, IMAGE_UPLOAD_LIMITS, type UploadImagePayload } from '@/lib/image-processing';
import { getInitialJobPollDelayMs, getJobPollDelayMs, isJobAutoPollingTimedOut } from '@/lib/job-polling';
import type {
  ExamBuilderConfig,
  ExamSetRecord,
  ExamSourceImage,
  GeneratedExamSet,
  OpenAiLogRecord,
  QuestionBlueprint,
  QuestionKind,
  UILanguage,
} from '@/lib/types';

const LAST_GRADE_BAND_KEY = 'exam_builder_last_grade_band';
const LAST_SHORTCUT_ID_KEY = 'exam_builder_last_shortcut_id';
const APP_UI_LANGUAGE_KEY = 'app_ui_language';
const DEFAULT_EXAM_SET_TITLE = 'Untitled Quiz';

type BuilderImage = {
  id: string;
  originalInput: string;
  thumbnailPreview: string;
  uploadPayload?: UploadImagePayload;
  sourceImage?: ExamSourceImage;
};

const gradeBandOptions = [
  'Elementary (Grades 1-3)',
  'Elementary (Grades 4-6)',
  'Middle School (Grades 7-9)',
  'High School (Grades 10-12)',
  'College / Adult',
] as const;

const quickOptionsByLanguage: Record<UILanguage, Array<{ id: string; label: string; prompt: string }>> = {
  en: [
    { id: 'reading_check', label: 'Reading', prompt: 'Create a reading comprehension quiz from the source material.' },
    {
      id: 'vocabulary_mix',
      label: 'Vocabulary',
      prompt: 'Create a vocabulary-focused quiz based on the source material.',
    },
    {
      id: 'grammar_practice',
      label: 'Grammar',
      prompt: 'Create a grammar practice quiz related to the source material.',
    },
  ],
  ko: [
    { id: 'reading_check', label: '독해', prompt: 'Create a reading comprehension quiz from the source material.' },
    { id: 'vocabulary_mix', label: '어휘', prompt: 'Create a vocabulary-focused quiz based on the source material.' },
    { id: 'grammar_practice', label: '문법', prompt: 'Create a grammar practice quiz related to the source material.' },
  ],
  es: [
    { id: 'reading_check', label: 'Lectura', prompt: 'Create a reading comprehension quiz from the source material.' },
    {
      id: 'vocabulary_mix',
      label: 'Vocabulario',
      prompt: 'Create a vocabulary-focused quiz based on the source material.',
    },
    {
      id: 'grammar_practice',
      label: 'Gramática',
      prompt: 'Create a grammar practice quiz related to the source material.',
    },
  ],
};

const blueprintPresetsByCategory: Record<string, QuestionBlueprint[]> = {
  reading_check: [
    {
      presetId: 'reading_main_idea',
      label: 'Main Idea (MCQ)',
      description: '글의 중심 생각이나 핵심 주제를 고르는 문제로, 독해의 큰 줄기 파악에 사용합니다.',
      format: 'multiple_choice',
      count: 6,
      focus: 'Identify the main idea or central theme of the passage.',
      enabled: true,
    },
    {
      presetId: 'reading_detail_check',
      label: 'Detail Check (MCQ)',
      description: '본문에 직접 나온 세부 정보를 묻는 문제로, 정확한 내용 이해를 확인합니다.',
      format: 'multiple_choice',
      count: 6,
      focus: 'Ask about specific details that are explicitly stated in the passage.',
      enabled: true,
    },
    {
      presetId: 'reading_true_false',
      label: 'True / False',
      description: '본문 내용과 일치하는지 판단하는 문제로, 사실 확인에 효율적입니다.',
      format: 'true_false',
      count: 4,
      focus: 'Determine whether each statement is true or false based on the passage.',
      enabled: true,
    },
    {
      presetId: 'reading_inference',
      label: 'Inference (MCQ)',
      description: '직접 제시되지 않은 내용을 문맥상 추론하는 문제로, 독해 난이도를 높입니다.',
      format: 'multiple_choice',
      count: 4,
      focus: 'Infer information that is implied by the passage but not directly stated.',
      enabled: true,
    },
    {
      presetId: 'reading_vocab_context',
      label: 'Vocabulary in Context (MCQ)',
      description: '지문 속 단어/표현의 뜻을 문맥으로 해석하는 문제로, 독해와 어휘를 연결합니다.',
      format: 'multiple_choice',
      count: 4,
      focus: 'Interpret the meaning of a word or phrase using context clues in the passage.',
      enabled: true,
    },
  ],
  vocabulary_mix: [
    {
      presetId: 'vocab_word_to_meaning',
      label: 'Word -> Meaning (MCQ)',
      description: '주어진 단어에 맞는 뜻을 고르는 기본 어휘 인지 확인 문제입니다.',
      format: 'multiple_choice',
      count: 6,
      focus: 'Choose the best meaning for the given word.',
      enabled: true,
    },
    {
      presetId: 'vocab_meaning_to_word',
      label: 'Meaning -> Word (MCQ)',
      description: '뜻을 보고 단어를 고르는 문제로, 단순 인식이 아닌 회상 능력을 확인합니다.',
      format: 'multiple_choice',
      count: 6,
      focus: 'Choose the correct word that matches the provided meaning.',
      enabled: true,
    },
    {
      presetId: 'vocab_context_mcq',
      label: 'Context Vocabulary (MCQ)',
      description: '예문 빈칸에 들어갈 단어를 고르는 문제로, 문맥 기반 어휘 사용을 평가합니다.',
      format: 'multiple_choice',
      count: 4,
      focus: 'Select the most appropriate vocabulary word for a sentence context.',
      enabled: true,
    },
    {
      presetId: 'vocab_context_short',
      label: 'Context Vocabulary (Short Answer)',
      description: '문맥 속 빈칸 단어를 직접 쓰는 문제로, 철자와 회상을 동시에 점검합니다.',
      format: 'short_answer',
      count: 3,
      focus: 'Write the missing vocabulary word that best completes the sentence context.',
      enabled: true,
    },
    {
      presetId: 'vocab_syn_ant',
      label: 'Synonym / Antonym (MCQ)',
      description: '유의어/반의어를 묻는 문제로, 어휘망 확장에 유용합니다.',
      format: 'multiple_choice',
      count: 3,
      focus: 'Choose the correct synonym or antonym for the target word.',
      enabled: true,
    },
    {
      presetId: 'vocab_spelling_recall',
      label: 'Spelling Recall (Short Answer)',
      description: '뜻이나 예문을 보고 단어를 직접 입력해 철자 정확도를 확인합니다.',
      format: 'short_answer',
      count: 3,
      focus: 'Write the exact target word from a meaning clue or sentence prompt.',
      enabled: true,
    },
  ],
  grammar_practice: [
    {
      presetId: 'grammar_choice',
      label: 'Grammar Choice (MCQ)',
      description: '문법적으로 올바른 표현을 고르는 가장 범용적인 문제입니다.',
      format: 'multiple_choice',
      count: 6,
      focus: 'Choose the grammatically correct option.',
      enabled: true,
    },
    {
      presetId: 'grammar_error_spotting',
      label: 'Error Spotting (MCQ)',
      description: '문장 내 틀린 부분을 고르는 문제로, 학교 시험 유형과 유사합니다.',
      format: 'multiple_choice',
      count: 4,
      focus: 'Identify the incorrect or most inappropriate grammar usage in the sentence.',
      enabled: true,
    },
    {
      presetId: 'grammar_error_correction',
      label: 'Error Correction (Short Answer)',
      description: '틀린 문장을 바르게 고쳐 쓰며 실제 문법 적용 능력을 확인합니다.',
      format: 'short_answer',
      count: 3,
      focus: 'Correct the grammatical error and rewrite the sentence accurately.',
      enabled: true,
    },
    {
      presetId: 'grammar_rewrite',
      label: 'Sentence Rewrite (Short Answer)',
      description: '시제/수동태/비교급 등 조건에 맞게 문장을 변환하는 문제입니다.',
      format: 'short_answer',
      count: 3,
      focus: 'Rewrite the sentence to meet a grammar condition such as tense, voice, or comparison.',
      enabled: true,
    },
    {
      presetId: 'grammar_context_mcq',
      label: 'Grammar in Context (MCQ)',
      description: '짧은 문맥에서 적절한 문법 형태를 고르는 문제로, 실제 사용에 가깝습니다.',
      format: 'multiple_choice',
      count: 4,
      focus: 'Choose the best grammar form within a short context.',
      enabled: true,
    },
    {
      presetId: 'grammar_fill_short',
      label: 'Grammar Fill by Writing (Short Answer)',
      description: '빈칸에 알맞은 문법 형태를 직접 입력하는 문제입니다.',
      format: 'short_answer',
      count: 3,
      focus: 'Write the correct grammar form to complete the blank.',
      enabled: true,
    },
  ],
};

const starterBlueprints = blueprintPresetsByCategory.reading_check;

const outputLanguageOptions = ['English', 'Korean', 'Spanish', 'Japanese', 'Chinese'] as const;
const sourceLanguageOptions = ['auto', 'English', 'Korean', 'Spanish', 'Japanese', 'Chinese'] as const;

type BuilderProps = {
  initialExamSet?: ExamSetRecord | null;
  initialGenerateHistory?: OpenAiLogRecord[];
  generateLimit?: number;
  initialGenerationJobId?: string | null;
};

type EnqueueGenerationJobPayload = {
  jobId?: string;
  status?: 'queued';
  error?: string;
};

type GenerationJobResult = {
  examSetId: string;
  generationLogId: string;
  title: string;
  generated: GeneratedExamSet;
};

type GenerationJobStatusPayload = {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  errorMessage?: string | null;
  result?: GenerationJobResult | null;
};

type SortableBlueprintRowProps = {
  id: string;
  blueprint: QuestionBlueprint;
  index: number;
  onUpdate: (index: number, patch: Partial<QuestionBlueprint>) => void;
};

const uiLabel = {
  en: {
    assistant: 'Assistant',
    uploadHelp: 'Upload up to 6 images. They are compressed in-browser before upload.',
    sourceImage: 'Source images (max 6)',
    shortcuts: 'Exam category',
    uiLanguage: 'Builder language',
    sourceLanguage: 'Source language',
    examLanguage: 'Exam output language',
    gradeBand: 'Grade band',
    questionBlueprint: 'Preset sections',
    dragHint: 'Drag by handle to reorder section order.',
    teacherNotes: 'Teacher custom instructions (optional)',
  },
  ko: {
    assistant: '도우미',
    uploadHelp: '이미지를 최대 6장까지 업로드할 수 있고, 브라우저에서 먼저 압축됩니다.',
    sourceImage: '기초 이미지 (최대 6장)',
    shortcuts: '시험 카테고리',
    uiLanguage: '빌더 언어',
    sourceLanguage: '원문 언어',
    examLanguage: '문제 출력 언어',
    gradeBand: '난이도 범위',
    questionBlueprint: '프리셋 문제 유형',
    dragHint: '핸들을 잡고 드래그해서 문제 유형 순서를 바꿔요.',
    teacherNotes: '교사 맞춤 지침 (선택)',
  },
  es: {
    assistant: 'Asistente',
    uploadHelp: 'Puedes subir hasta 6 imágenes. Se comprimen en el navegador antes del envío.',
    sourceImage: 'Imágenes fuente (máx. 6)',
    shortcuts: 'Tipo de examen',
    uiLanguage: 'Idioma del editor',
    sourceLanguage: 'Idioma de origen',
    examLanguage: 'Idioma de salida del examen',
    gradeBand: 'Rango de nivel',
    questionBlueprint: 'Secciones predefinidas',
    dragHint: 'Arrastra desde el handle para reordenar.',
    teacherNotes: 'Instrucciones personalizadas del docente (opcional)',
  },
} as const;

function moveItem<T>(array: T[], fromIndex: number, toIndex: number) {
  const next = [...array];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function cloneBlueprints(items: QuestionBlueprint[]) {
  return items.map((item) => ({ ...item, enabled: item.enabled ?? true }));
}

function getPresetBlueprintsForCategory(shortcutId: string) {
  const presets = blueprintPresetsByCategory[shortcutId] ?? blueprintPresetsByCategory.reading_check;
  return cloneBlueprints(presets);
}

function mergeSavedBlueprintsWithPresets(shortcutId: string, savedBlueprints: QuestionBlueprint[] | null | undefined) {
  const presets = getPresetBlueprintsForCategory(shortcutId);
  if (!savedBlueprints || savedBlueprints.length === 0) {
    return presets;
  }

  const savedByPresetId = new Map(
    savedBlueprints.filter((item) => item.presetId).map((item) => [item.presetId as string, item]),
  );
  const knownPresetIds = new Set(presets.map((item) => item.presetId));
  const orderedPresetIds = savedBlueprints
    .filter((item) => item.presetId && knownPresetIds.has(item.presetId))
    .map((item) => item.presetId as string);
  const remainingPresetIds = presets.map((item) => item.presetId as string).filter((id) => !orderedPresetIds.includes(id));
  const orderedIds = [...orderedPresetIds, ...remainingPresetIds];

  return orderedIds.map((presetId) => {
    const preset = presets.find((item) => item.presetId === presetId)!;
    const saved = savedByPresetId.get(presetId);
    return {
      ...preset,
      count: saved?.count ?? preset.count,
      enabled: saved?.enabled ?? preset.enabled ?? true,
    };
  });
}

function questionKindLabel(kind: QuestionKind) {
  if (kind === 'multiple_choice') {
    return 'Multiple choice';
  }
  if (kind === 'true_false') {
    return 'True / False';
  }
  return 'Short answer';
}

function SortableBlueprintRow({ id, blueprint, index, onUpdate }: SortableBlueprintRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 150ms ease-out',
  };

  return (
    <div
      ref={setNodeRef}
      className={`grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[auto_1.15fr_0.8fr_0.5fr_0.6fr_1.4fr] ${
        isDragging ? 'z-10 ring-1 ring-slate-300/70 ring-offset-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)]' : ''
      }`}
      style={style}
    >
      <button
        className="cursor-grab rounded-xl px-2 text-sm text-slate-500 transition-colors hover:text-slate-800 active:cursor-grabbing"
        title="Drag handle"
        type="button"
        {...attributes}
        {...listeners}
      >
        ::
      </button>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
        {blueprint.label}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {questionKindLabel(blueprint.format)}
      </div>
      <input
        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm"
        min={1}
        onChange={(event) => onUpdate(index, { count: Number(event.target.value) || 1 })}
        placeholder="Count"
        title="Question count"
        type="number"
        value={blueprint.count}
        disabled={blueprint.enabled === false}
      />
      <label className="flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
        Enabled
        <input
          checked={blueprint.enabled ?? true}
          className="h-4 w-4 accent-slate-900"
          onChange={(event) => onUpdate(index, { enabled: event.target.checked })}
          type="checkbox"
        />
      </label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {blueprint.description ?? '-'}
      </div>
    </div>
  );
}

function parseGeneratedFromLog(log: OpenAiLogRecord): GeneratedExamSet | null {
  return extractGeneratedExamSetFromResponseJson(log.responseJson);
}

function inferOutputLanguageFromLog(log: OpenAiLogRecord, fallbackLanguage: string) {
  const matched = log.promptText.match(/Output language for exam questions and answers:\s*([^\n.]+)\.?/i);
  if (matched?.[1]) {
    return matched[1].trim();
  }
  return fallbackLanguage;
}

function editionSignature(payload: GeneratedExamSet) {
  return JSON.stringify({
    gradeBand: payload.gradeBand,
    questions: payload.questions,
  });
}

function generatedFromExamSet(examSet: ExamSetRecord): GeneratedExamSet {
  return {
    title: examSet.title,
    summary: examSet.summary,
    gradeBand: examSet.config.gradeBand,
    sourceSummary: examSet.summary,
    outputSummary: examSet.summary,
    sourceKeywords: [],
    outputKeywords: [],
    recommendedPrompts: [],
    questions: examSet.questions,
  };
}

function findPublishedEditionFromHistory(examSet: ExamSetRecord | null | undefined, logs: OpenAiLogRecord[]) {
  if (!examSet || examSet.status !== 'published') {
    return null;
  }
  const publishedSignature = editionSignature(generatedFromExamSet(examSet));
  for (const log of logs) {
    const parsed = parseGeneratedFromLog(log);
    if (parsed && editionSignature(parsed) === publishedSignature) {
      return { logId: log.id, generated: parsed };
    }
  }
  return null;
}

function findLatestGeneratedEditionFromHistory(logs: OpenAiLogRecord[]) {
  for (const log of logs) {
    const parsed = parseGeneratedFromLog(log);
    if (parsed) {
      return { logId: log.id, generated: parsed };
    }
  }
  return null;
}

export function ExamBuilder({
  initialExamSet,
  initialGenerateHistory = [],
  generateLimit = 5,
  initialGenerationJobId = null,
}: BuilderProps) {
  const router = useRouter();
  const initialConfig = initialExamSet?.config;
  const initialShortcutId = initialExamSet?.selectedShortcutId ?? quickOptionsByLanguage[initialConfig?.uiLanguage ?? 'en'][0].id;
  const initialBlueprintValues = mergeSavedBlueprintsWithPresets(initialShortcutId, initialConfig?.blueprints ?? starterBlueprints);
  const initialPublishedEdition = findPublishedEditionFromHistory(initialExamSet, initialGenerateHistory);
  const initialSelectedEdition = initialPublishedEdition ?? findLatestGeneratedEditionFromHistory(initialGenerateHistory);
  const [currentExamSetId, setCurrentExamSetId] = useState<string | null>(initialExamSet?.id ?? null);
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(initialConfig?.uiLanguage ?? 'en');
  const [sourceLanguage, setSourceLanguage] = useState(initialConfig?.sourceLanguage ?? 'auto');
  const [examLanguage, setExamLanguage] = useState(initialConfig?.examLanguage ?? 'English');
  const [images, setImages] = useState<BuilderImage[]>(
    (initialExamSet?.sourceImages ?? []).map((image) => ({
      id: image.id,
      originalInput: image.originalSignedUrl ?? '',
      thumbnailPreview: image.thumbnailSignedUrl ?? image.originalSignedUrl ?? '',
      sourceImage: image,
    }))
  );
  const [title, setTitle] = useState(initialExamSet?.title ?? '');
  const [gradeBand, setGradeBand] = useState(initialConfig?.gradeBand ?? gradeBandOptions[1]);
  const [notes, setNotes] = useState(initialExamSet?.sourceNotes ?? '');
  const [selectedShortcutId, setSelectedShortcutId] = useState(
    initialShortcutId
  );
  const [blueprints, setBlueprints] = useState<QuestionBlueprint[]>(initialBlueprintValues);
  const [blueprintIds, setBlueprintIds] = useState<string[]>(() =>
    initialBlueprintValues.map(() => crypto.randomUUID())
  );
  const [generationLogId, setGenerationLogId] = useState<string | null>(initialSelectedEdition?.logId ?? null);
  const [generateCount, setGenerateCount] = useState(initialExamSet?.generateCount ?? 0);
  const [generatedHistory, setGeneratedHistory] = useState<OpenAiLogRecord[]>(initialGenerateHistory);
  const [selectedHistoryLogId, setSelectedHistoryLogId] = useState<string | null>(initialSelectedEdition?.logId ?? null);
  const [generated, setGenerated] = useState<GeneratedExamSet | null>(
    initialSelectedEdition?.generated ?? (initialExamSet ? generatedFromExamSet(initialExamSet) : null)
  );
  const [publishedSignature, setPublishedSignature] = useState<string>(() => {
    if (!initialExamSet || initialExamSet.status !== 'published') {
      return '';
    }
    return editionSignature(generatedFromExamSet(initialExamSet));
  });
  const [statusMessage, setStatusMessage] = useState('Upload source images and generate your exam set.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeGenerationJobId, setActiveGenerationJobId] = useState<string | null>(initialGenerationJobId);
  const [autoPollingEnabled, setAutoPollingEnabled] = useState(true);
  const [isCheckingJobStatus, setIsCheckingJobStatus] = useState(false);
  const [lastSavedSignature, setLastSavedSignature] = useState('');
  const autoPollingStartedAtRef = useRef<number | null>(initialGenerationJobId ? Date.now() : null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const quickOptions = quickOptionsByLanguage[uiLanguage];
  const labels = uiLabel[uiLanguage];

  const config: ExamBuilderConfig = useMemo(
    () => ({
      title: title.trim(),
      gradeBand,
      notes,
      uiLanguage,
      promptLanguage: uiLanguage,
      sourceLanguage,
      examLanguage,
      blueprints,
    }),
    [blueprints, examLanguage, gradeBand, notes, sourceLanguage, title, uiLanguage]
  );

  function buildSignatureInput(generatedQuestionCount: number, overrides?: Partial<BuilderSignatureInput>): BuilderSignatureInput {
    return {
      title,
      gradeBand,
      notes,
      uiLanguage,
      promptLanguage: uiLanguage,
      sourceLanguage,
      examLanguage,
      selectedShortcutId,
      imageIds: images.map((image) => image.id),
      blueprints,
      generatedQuestionCount,
      ...overrides,
    };
  }

  const enabledBlueprints = blueprints.filter((blueprint) => blueprint.enabled ?? true);
  const totalQuestions = enabledBlueprints.reduce((sum, blueprint) => sum + blueprint.count, 0);
  const currentSignature = createBuilderSignature(buildSignatureInput(generated?.questions.length ?? 0));
  const hasUnsavedChanges = lastSavedSignature.length > 0 && currentSignature !== lastSavedSignature;
  const canGenerate = currentExamSetId ? generateCount < generateLimit : true;
  const showManualRefreshButton = !!activeGenerationJobId && !autoPollingEnabled;
  const showGenerateButton = !showManualRefreshButton;
  const showGeneratingState = isGenerating || (!!activeGenerationJobId && autoPollingEnabled);

  useEffect(() => {
    if (initialExamSet) {
      return;
    }
    const preferredLanguage = window.localStorage.getItem(APP_UI_LANGUAGE_KEY) as UILanguage | null;
    if (preferredLanguage && ['en', 'ko', 'es'].includes(preferredLanguage)) {
      setUiLanguage(preferredLanguage);
      const savedShortcutId = window.localStorage.getItem(LAST_SHORTCUT_ID_KEY);
      if (savedShortcutId && quickOptionsByLanguage[preferredLanguage].some((option) => option.id === savedShortcutId)) {
        setSelectedShortcutId(savedShortcutId);
        setBlueprints(getPresetBlueprintsForCategory(savedShortcutId));
        setBlueprintIds(getPresetBlueprintsForCategory(savedShortcutId).map(() => crypto.randomUUID()));
      } else {
        const defaultShortcutId = quickOptionsByLanguage[preferredLanguage][0].id;
        setSelectedShortcutId(defaultShortcutId);
        setBlueprints(getPresetBlueprintsForCategory(defaultShortcutId));
        setBlueprintIds(getPresetBlueprintsForCategory(defaultShortcutId).map(() => crypto.randomUUID()));
      }
    }
  }, [initialExamSet]);

  useEffect(() => {
    if (quickOptionsByLanguage[uiLanguage].some((option) => option.id === selectedShortcutId)) {
      return;
    }
    const savedShortcutId = window.localStorage.getItem(LAST_SHORTCUT_ID_KEY);
    if (savedShortcutId && quickOptionsByLanguage[uiLanguage].some((option) => option.id === savedShortcutId)) {
      setSelectedShortcutId(savedShortcutId);
      setBlueprints(getPresetBlueprintsForCategory(savedShortcutId));
      setBlueprintIds(getPresetBlueprintsForCategory(savedShortcutId).map(() => crypto.randomUUID()));
      return;
    }
    const defaultShortcutId = quickOptionsByLanguage[uiLanguage][0].id;
    setSelectedShortcutId(defaultShortcutId);
    setBlueprints(getPresetBlueprintsForCategory(defaultShortcutId));
    setBlueprintIds(getPresetBlueprintsForCategory(defaultShortcutId).map(() => crypto.randomUUID()));
  }, [selectedShortcutId, uiLanguage]);

  useEffect(() => {
    if (!initialExamSet) {
      const saved = window.localStorage.getItem(LAST_GRADE_BAND_KEY);
      if (saved && gradeBandOptions.includes(saved as (typeof gradeBandOptions)[number])) {
        setGradeBand(saved as (typeof gradeBandOptions)[number]);
      }
    }
  }, [initialExamSet]);

  useEffect(() => {
    window.localStorage.setItem(LAST_GRADE_BAND_KEY, gradeBand);
  }, [gradeBand]);

  useEffect(() => {
    window.localStorage.setItem(LAST_SHORTCUT_ID_KEY, selectedShortcutId);
  }, [selectedShortcutId]);

  useEffect(() => {
    if (!lastSavedSignature) {
      setLastSavedSignature(currentSignature);
    }
  }, [currentSignature, lastSavedSignature]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  function applyGenerationJobStatus(payload: GenerationJobStatusPayload) {
    if (payload.status === 'completed' && payload.result) {
      const result = payload.result;
      const nextGenerated = result.generated;
      setTitle(result.title);
      setGenerated(nextGenerated);
      setCurrentExamSetId(result.examSetId);
      setGenerationLogId(result.generationLogId);
      setSelectedHistoryLogId(result.generationLogId);
      setGeneratedHistory((current) => {
        const exists = current.some((item) => item.id === result.generationLogId);
        if (exists) {
          return current;
        }
        return [
          {
            id: result.generationLogId,
            userId: '',
            examSetId: result.examSetId,
            model: 'openai',
            promptText: `Output language for exam questions and answers: ${examLanguage}.`,
            responseText: null,
            responseJson: JSON.stringify(nextGenerated),
            latencyMs: null,
            inputTokens: null,
            outputTokens: null,
            totalTokens: null,
            estimatedCostUsd: null,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ];
      });
      setGenerateCount((value) => value + 1);
      setLastSavedSignature(
        createBuilderSignature(buildSignatureInput(nextGenerated.questions.length, { title: result.title })),
      );
      setStatusMessage('Generated and auto-saved draft.');
      setIsGenerating(false);
      setAutoPollingEnabled(true);
      setActiveGenerationJobId(null);
      autoPollingStartedAtRef.current = null;
      return;
    }

    if (payload.status === 'failed') {
      setStatusMessage(payload.errorMessage || 'Generation job failed.');
      setIsGenerating(false);
      setAutoPollingEnabled(true);
      setActiveGenerationJobId(null);
      autoPollingStartedAtRef.current = null;
      return;
    }

    setIsGenerating(true);
    setStatusMessage(
      payload.status === 'running'
        ? 'Generating exam questions in background...'
        : 'Generation queued. Waiting for worker...'
    );
  }

  async function checkGenerationJobStatusNow() {
    if (!activeGenerationJobId) {
      return;
    }
    setIsCheckingJobStatus(true);
    try {
      const response = await fetch(`/api/exam-generation-jobs/${activeGenerationJobId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const payload = (await response.json()) as GenerationJobStatusPayload & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to read generation job status.');
      }
      applyGenerationJobStatus(payload);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to poll generation job.');
    } finally {
      setIsCheckingJobStatus(false);
    }
  }

  useEffect(() => {
    if (!activeGenerationJobId || !autoPollingEnabled) {
      return;
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = (delayMs: number) => {
      timer = setTimeout(() => {
        void poll();
      }, delayMs);
    };

    const poll = async () => {
      try {
        const startedAt = autoPollingStartedAtRef.current ?? Date.now();
        autoPollingStartedAtRef.current = startedAt;
        if (isJobAutoPollingTimedOut(startedAt)) {
          setAutoPollingEnabled(false);
          setIsGenerating(false);
          setStatusMessage(
            'Generation is still in progress. Auto status checks paused after 3 minutes. Click "Check status now".'
          );
          return;
        }

        const response = await fetch(`/api/exam-generation-jobs/${activeGenerationJobId}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = (await response.json()) as GenerationJobStatusPayload & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to read generation job status.');
        }
        if (stopped) {
          return;
        }

        applyGenerationJobStatus(payload);
        if (payload.status === 'completed' || payload.status === 'failed') {
          return;
        }
        schedule(getJobPollDelayMs(payload.status));
      } catch (error) {
        if (!stopped) {
          setStatusMessage(error instanceof Error ? error.message : 'Failed to poll generation job.');
          setIsGenerating(false);
          setAutoPollingEnabled(true);
          setActiveGenerationJobId(null);
          autoPollingStartedAtRef.current = null;
        }
      }
    };

    schedule(getInitialJobPollDelayMs('builder'));

    return () => {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    activeGenerationJobId,
    autoPollingEnabled,
    blueprints,
    examLanguage,
    gradeBand,
    images,
    notes,
    selectedShortcutId,
    sourceLanguage,
    uiLanguage,
  ]);

  function updateBlueprint(index: number, patch: Partial<QuestionBlueprint>) {
    setBlueprints((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function applyShortcut(shortcutId: string) {
    if (shortcutId === selectedShortcutId) {
      return;
    }
    setSelectedShortcutId(shortcutId);
    const nextBlueprints = getPresetBlueprintsForCategory(shortcutId);
    setBlueprints(nextBlueprints);
    setBlueprintIds(nextBlueprints.map(() => crypto.randomUUID()));
  }

  function handleBlueprintDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = blueprintIds.indexOf(String(active.id));
    const newIndex = blueprintIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return;
    }
    setBlueprints((current) => moveItem(current, oldIndex, newIndex));
    setBlueprintIds((current) => moveItem(current, oldIndex, newIndex));
  }

  function getUntitledTitle() {
    return DEFAULT_EXAM_SET_TITLE;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    const remainingSlots = IMAGE_UPLOAD_LIMITS.maxCount - images.length;
    if (remainingSlots <= 0) {
      setStatusMessage(`You can upload up to ${IMAGE_UPLOAD_LIMITS.maxCount} images.`);
      input.value = '';
      return;
    }

    const selected = files.slice(0, remainingSlots);
    try {
      const compressed = await Promise.all(selected.map((file) => compressImageForUpload(file)));
      const nextImages: BuilderImage[] = compressed.map((item) => ({
        id: crypto.randomUUID(),
        originalInput: item.originalInput,
        thumbnailPreview: item.thumbnailPreview,
        uploadPayload: item.uploadPayload,
      }));
      const totalBytes = [...images, ...nextImages].reduce(
        (sum, item) => sum + (item.uploadPayload?.sizeBytes ?? item.sourceImage?.sizeBytes ?? 0),
        0
      );
      if (totalBytes > IMAGE_UPLOAD_LIMITS.maxTotalBytesHard) {
        setStatusMessage(
          `Total payload is too large. Keep total under ${Math.round(IMAGE_UPLOAD_LIMITS.maxTotalBytesHard / 1024 / 1024)}MB.`
        );
        input.value = '';
        return;
      }
      setImages((current) => [...current, ...nextImages]);
      setStatusMessage(
        `Loaded ${nextImages.length} image(s). ${Math.min(
          images.length + nextImages.length, IMAGE_UPLOAD_LIMITS.maxCount
        )}/${IMAGE_UPLOAD_LIMITS.maxCount} ready.`
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to process images.');
    }
    input.value = '';
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function ensureUploadedImages() {
    const existingImages = images
      .filter((item) => item.sourceImage)
      .map((item) => item.sourceImage!) as ExamSourceImage[];
    const newUploads = images.filter((item) => item.uploadPayload).map((item) => item.uploadPayload!);
    if (newUploads.length === 0) {
      return existingImages;
    }

    const response = await fetch('/api/storage/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: newUploads }),
    });
    const payload = (await response.json()) as { images?: ExamSourceImage[]; error?: string };
    if (!response.ok || !payload.images) {
      throw new Error(payload.error ?? 'Failed to upload source images.');
    }
    return [...existingImages, ...payload.images];
  }

  async function saveDraft(generatedPayload: GeneratedExamSet, options?: { auto?: boolean }) {
    const uploadedImages = await ensureUploadedImages();
    const response = await fetch('/api/exam-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentExamSetId ?? undefined,
        generationLogId: generationLogId ?? undefined,
        title: title.trim().length > 0 ? title.trim() : getUntitledTitle(),
        summary: generatedPayload.summary,
        selectedShortcutId,
        customPrompt: notes,
        outputKeywords: generatedPayload.outputKeywords ?? [],
        sourceImages: uploadedImages,
        sourceNotes: notes,
        config,
        questions: generatedPayload.questions,
      }),
    });
    const payload = (await response.json()) as { examSetId?: string; error?: string };
    if (!response.ok || !payload.examSetId) {
      throw new Error(payload.error ?? 'Save failed.');
    }
    if (!currentExamSetId && generationLogId) {
      setGenerateCount(1);
    }
    setCurrentExamSetId(payload.examSetId);
    setLastSavedSignature(createBuilderSignature(buildSignatureInput(generatedPayload.questions.length)));
    if (!options?.auto) {
      router.push('/dashboard');
      router.refresh();
    }
    return payload.examSetId;
  }

  async function handleGenerate() {
    if (isGenerating || activeGenerationJobId) {
      return;
    }
    if (!canGenerate) {
      setStatusMessage(`Generation limit reached (${generateLimit}/${generateLimit}).`);
      return;
    }
    if (images.length === 0) {
      setStatusMessage('At least one image is required before generation.');
      return;
    }
    if (enabledBlueprints.length === 0) {
      setStatusMessage('Enable at least one preset section before generation.');
      return;
    }
    const imageInputs = images.map((image) => image.originalInput).filter(Boolean);
    if (imageInputs.length === 0) {
      setStatusMessage('Image input is unavailable. Re-upload image files before generating.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Uploading images and queueing generation job...');
    try {
      const uploadedImages = await ensureUploadedImages();
      let targetExamSetId = currentExamSetId;
      if (!targetExamSetId) {
        const draftResponse = await fetch('/api/exam-sets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim().length > 0 ? title.trim() : getUntitledTitle(),
            summary: 'Generating exam set in background...',
            selectedShortcutId,
            customPrompt: notes,
            outputKeywords: [],
            sourceImages: uploadedImages,
            sourceNotes: notes,
            config,
            questions: [],
          }),
        });
        const draftPayload = (await draftResponse.json()) as { examSetId?: string; error?: string };
        if (!draftResponse.ok || !draftPayload.examSetId) {
          throw new Error(draftPayload.error ?? 'Failed to create draft slot.');
        }
        targetExamSetId = draftPayload.examSetId;
        setCurrentExamSetId(targetExamSetId);
      }

      const response = await fetch('/api/exam-generation-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examSetId: targetExamSetId ?? undefined,
          imageDataUrls: imageInputs,
          selectedShortcutId,
          customPrompt: notes,
          title: title.trim().length > 0 ? title.trim() : getUntitledTitle(),
          sourceImages: uploadedImages,
          config,
        }),
      });
      const payload = (await response.json()) as EnqueueGenerationJobPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Generation failed.');
      }
      if (!payload.jobId) {
        throw new Error('Generation job was not created.');
      }
      autoPollingStartedAtRef.current = Date.now();
      setAutoPollingEnabled(true);
      setActiveGenerationJobId(payload.jobId);
      setStatusMessage('Generation queued. You can leave this page and come back later.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Generation failed.');
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generated) {
      setStatusMessage('Generate questions before saving the exam set.');
      return;
    }
    setIsSaving(true);
    setStatusMessage('Saving exam set draft...');
    try {
      await saveDraft(generated);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  async function publishEdition(edition: GeneratedExamSet, logId: string) {
    setIsSaving(true);
    setStatusMessage('Publishing this edition...');
    try {
      setGenerationLogId(logId);
      setGenerated(edition);
      setSelectedHistoryLogId(logId);
      const examSetId = await saveDraft(edition, { auto: true });
      const response = await fetch('/api/exam-sets/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examSetId }),
      });
      const publishResult = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !publishResult.ok) {
        throw new Error(publishResult.error ?? 'Publish failed.');
      }
      setPublishedSignature(editionSignature(edition));
      setStatusMessage('Published selected edition.');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Publish failed.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleBackToDashboard(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasUnsavedChanges) {
      return;
    }
    const confirmed = window.confirm('You have unsaved changes. Leave this page?');
    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Exam builder</p>
          <h1 className="text-3xl font-black text-slate-950">Chat-style exam generation</h1>
        </div>
        <Link
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          href="/dashboard"
          onClick={handleBackToDashboard}
        >
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Builder conversation</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {totalQuestions} questions planned
            </span>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-white">
              <p className="font-semibold">{labels.assistant}</p>
              <p className="mt-2 text-slate-200">{labels.uploadHelp}</p>
            </div>

            <label className="text-sm font-semibold text-slate-800">
              Exam set title
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Leave blank to auto-generate title from content."
                title="Optional. If empty, AI will generate a suitable title."
                value={title}
              />
            </label>

            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-700">
              <span className="mb-3 block font-semibold text-slate-950">{labels.sourceImage}</span>
              <input
                accept="image/*"
                className="block w-full text-sm"
                multiple
                onChange={handleFileChange}
                type="file"
              />
            </label>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((image, index) => (
                  <div key={image.id} className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <img
                      alt={`Uploaded source ${index + 1}`}
                      className="h-32 w-full object-cover"
                      src={image.thumbnailPreview}
                    />
                    <button
                      className="absolute right-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-xs font-semibold text-white"
                      onClick={() => removeImage(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">{labels.shortcuts}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                      selectedShortcutId === option.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                    onClick={() => applyShortcut(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                {labels.sourceLanguage}
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  onChange={(event) => setSourceLanguage(event.target.value)}
                  title="Language of source materials. Auto will detect from uploaded content."
                  value={sourceLanguage}
                >
                  {sourceLanguageOptions.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                {labels.examLanguage}
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  onChange={(event) => setExamLanguage(event.target.value)}
                  title="Final language for questions and answers."
                  value={examLanguage}
                >
                  {outputLanguageOptions.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                {labels.gradeBand}
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  onChange={(event) => setGradeBand(event.target.value)}
                  title="Difficulty level for generated questions."
                  value={gradeBand}
                >
                  {gradeBandOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-800">
              {labels.teacherNotes}
              <textarea
                className="mt-2 min-h-28 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Example: Keep vocabulary from this chapter only. Add 3 inference questions."
                title="Additional custom constraints or instructions."
                value={notes}
              />
            </label>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-950">{labels.questionBlueprint}</h3>
              </div>
              <p className="mb-3 text-xs text-slate-500">{labels.dragHint}</p>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleBlueprintDragEnd} sensors={sensors}>
                <SortableContext items={blueprintIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {blueprintIds.map((id, index) => {
                      const blueprint = blueprints[index];
                      if (!blueprint) {
                        return null;
                      }
                      return (
                        <SortableBlueprintRow
                          blueprint={blueprint}
                          id={id}
                          index={index}
                          key={id}
                          onUpdate={updateBlueprint}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {showGenerateButton ? (
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={showGeneratingState || !canGenerate || !!activeGenerationJobId}
                  onClick={handleGenerate}
                  type="button"
                >
                  {showGeneratingState ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : null}
                  {showGeneratingState ? 'Generating...' : 'Generate exam set'}
                </button>
              ) : null}
              {showManualRefreshButton ? (
                <button
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isCheckingJobStatus}
                  onClick={checkGenerationJobStatusNow}
                  type="button"
                >
                  {isCheckingJobStatus ? 'Checking...' : 'Manual refresh'}
                </button>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                Generate usage:{' '}
                {currentExamSetId
                  ? `${generateCount}/${generateLimit}`
                  : `0/${generateLimit} (applies after first save)`}
              </span>
              <button
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving || !generated}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? 'Saving...' : currentExamSetId ? 'Save draft' : 'Create draft'}
              </button>
            </div>
            <p className="rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{statusMessage}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-[#fffef8] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-bold text-slate-950">Generated preview</h2>
          {generated ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-3xl bg-white p-4">
                <p className="text-sm font-bold text-slate-950">Generated exam history</p>
                <div className="mt-3 space-y-2">
                  {generatedHistory.length > 0 ? (
                    generatedHistory.map((history, index) => {
                      const isSelected = selectedHistoryLogId === history.id;
                      const preview = parseGeneratedFromLog(history);
                      const outputLanguage = inferOutputLanguageFromLog(history, examLanguage);
                      const questionCount = preview?.questions.length ?? 0;
                      const grade = preview?.gradeBand ?? '-';
                      const editionNumber = generatedHistory.length - index;
                      const isPublished = preview ? editionSignature(preview) === publishedSignature : false;
                      return (
                        <div
                          key={history.id}
                          className={`w-full cursor-pointer rounded-2xl border px-3 py-2 text-left text-xs ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                          onClick={() => {
                            setSelectedHistoryLogId(history.id);
                            setGenerationLogId(history.id);
                            if (preview) {
                              setGenerated(preview);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedHistoryLogId(history.id);
                              setGenerationLogId(history.id);
                              if (preview) {
                                setGenerated(preview);
                              }
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">Edition {editionNumber}</p>
                              <p className="mt-1 text-[11px]">{new Date(history.createdAt).toLocaleString()}</p>
                              <p className="mt-1 text-[11px]">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {outputLanguage}
                                </span>
                              </p>
                              <p className="mt-1 text-[11px]">
                                {grade} · {questionCount} questions
                              </p>
                            </div>
                            <div className="pt-0.5">
                              <button
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                  isPublished
                                    ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500'
                                    : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                }`}
                                disabled={isSaving || !preview || isPublished}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  if (!preview || isPublished) {
                                    return;
                                  }
                                  void publishEdition(preview, history.id);
                                }}
                                type="button"
                              >
                                {isPublished ? '현재 발행됨' : '이 에디션 발행'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500">No history yet for this exam set.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">History detail</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Summary</p>
                <p className="mt-1 text-sm text-slate-600">{generated.outputSummary || generated.summary}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Keywords</p>
                <p className="mt-1 text-sm text-slate-600">{(generated.outputKeywords ?? []).join(', ') || '-'}</p>
              </div>

              <div className="space-y-3">
                {generated.questions.map((question, index) => (
                  <article key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Question {index + 1}
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">{question.prompt}</p>
                    {question.choices.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-sm text-slate-600">
                        {question.choices.map((choice) => (
                          <li
                            key={choice}
                            className={choice === question.answer ? 'font-semibold text-emerald-700' : undefined}
                          >
                            <span className="inline-block w-5">{choice === question.answer ? '✅' : '⚪️'}</span>
                            {choice}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {question.choices.length === 0 ? (
                      <p className="mt-3 text-sm text-emerald-700">Answer: {question.answer}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-500">{question.explanation}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
              Generated questions will appear here after generation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
