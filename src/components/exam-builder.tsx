'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { ExamBuilderConfig, ExamSetRecord, ExamSourceImage, GeneratedExamSet, OpenAiLogRecord, QuestionBlueprint, QuestionKind, UILanguage } from '@/lib/types';

const MAX_IMAGE_COUNT = 6;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES_HARD = 18 * 1024 * 1024;
const MAX_LONG_EDGE = 2560;
const MAX_MEGAPIXELS = 8_000_000;
const THUMB_LONG_EDGE = 480;
const QUALITY_STEPS = [0.86, 0.8, 0.74, 0.68];
const LAST_GRADE_BAND_KEY = 'exam_builder_last_grade_band';
const APP_UI_LANGUAGE_KEY = 'app_ui_language';

type BuilderImage = {
  id: string;
  originalInput: string;
  thumbnailPreview: string;
  uploadPayload?: {
    originalBase64: string;
    thumbnailBase64: string;
    width: number;
    height: number;
    thumbWidth: number;
    thumbHeight: number;
    sizeBytes: number;
  };
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
    { id: 'vocabulary_mix', label: 'Vocabulary', prompt: 'Create a vocabulary-focused quiz based on the source material.' },
    { id: 'reading_check', label: 'Reading', prompt: 'Create a reading comprehension quiz from the source material.' },
    { id: 'grammar_practice', label: 'Grammar', prompt: 'Create a grammar practice quiz related to the source material.' },
  ],
  ko: [
    { id: 'vocabulary_mix', label: '어휘', prompt: 'Create a vocabulary-focused quiz based on the source material.' },
    { id: 'reading_check', label: '독해', prompt: 'Create a reading comprehension quiz from the source material.' },
    { id: 'grammar_practice', label: '문법', prompt: 'Create a grammar practice quiz related to the source material.' },
  ],
  es: [
    { id: 'vocabulary_mix', label: 'Vocabulario', prompt: 'Create a vocabulary-focused quiz based on the source material.' },
    { id: 'reading_check', label: 'Lectura', prompt: 'Create a reading comprehension quiz from the source material.' },
    { id: 'grammar_practice', label: 'Gramática', prompt: 'Create a grammar practice quiz related to the source material.' },
  ],
};

const blueprintPresetsByCategory: Record<string, QuestionBlueprint[]> = {
  vocabulary_mix: [
    { label: 'Word -> Meaning (MCQ)', format: 'multiple_choice', count: 10, focus: 'Choose the best meaning for each word.' },
    { label: 'Meaning -> Word (MCQ)', format: 'multiple_choice', count: 10, focus: 'Choose the correct word from the meaning clue.' },
    { label: 'Context Fill-in (Short)', format: 'short_answer', count: 5, focus: 'Write the missing word in context.' },
  ],
  reading_check: [
    { label: 'Main Idea (MCQ)', format: 'multiple_choice', count: 6, focus: 'Identify central ideas and key details.' },
    { label: 'True/False Check', format: 'true_false', count: 8, focus: 'Verify factual understanding from the text.' },
    { label: 'Inference (MCQ)', format: 'multiple_choice', count: 6, focus: 'Choose the best inference from context.' },
  ],
  grammar_practice: [
    { label: 'Grammar Choice (MCQ)', format: 'multiple_choice', count: 10, focus: 'Choose grammatically correct options.' },
    { label: 'Error Spotting (MCQ)', format: 'multiple_choice', count: 6, focus: 'Find and fix grammar mistakes.' },
    { label: 'Sentence Rewrite (Short)', format: 'short_answer', count: 4, focus: 'Rewrite to satisfy grammar constraints.' },
  ],
};

const starterBlueprints: QuestionBlueprint[] = [
  { label: 'Meaning match', format: 'multiple_choice', count: 10, focus: 'Match a word with the correct meaning.' },
  { label: 'Sentence clue', format: 'multiple_choice', count: 10, focus: 'Choose the best word for a blank in a sentence.' },
  { label: 'Short answer recall', format: 'short_answer', count: 5, focus: 'Write the missing word directly.' },
];

const outputLanguageOptions = ['English', 'Korean', 'Spanish', 'Japanese', 'Chinese'] as const;
const sourceLanguageOptions = ['auto', 'English', 'Korean', 'Spanish', 'Japanese', 'Chinese'] as const;

type BuilderProps = {
  initialExamSet?: ExamSetRecord | null;
  initialGenerateHistory?: OpenAiLogRecord[];
  generateLimit?: number;
};

type GeneratedPayload = GeneratedExamSet & {
  generationLogId: string;
  error?: string;
};

const uiLabel = {
  en: {
    assistant: 'Assistant',
    uploadHelp: 'Upload up to 6 images. They are compressed in-browser before upload.',
    sourceImage: 'Source images (max 6)',
    shortcuts: 'Exam type',
    uiLanguage: 'Builder language',
    sourceLanguage: 'Source language',
    examLanguage: 'Exam output language',
    gradeBand: 'Grade band',
    questionBlueprint: 'Question blueprint',
    addSection: 'Add section',
    addPreset: 'Add preset sections',
    dragHint: 'Drag by handle to reorder sections.',
    teacherNotes: 'Teacher custom instructions (optional)',
  },
  ko: {
    assistant: '도우미',
    uploadHelp: '이미지를 최대 6장까지 업로드할 수 있고, 브라우저에서 먼저 압축됩니다.',
    sourceImage: '기초 이미지 (최대 6장)',
    shortcuts: '시험 유형',
    uiLanguage: '빌더 언어',
    sourceLanguage: '원문 언어',
    examLanguage: '문제 출력 언어',
    gradeBand: '난이도 범위',
    questionBlueprint: '문항 blueprint',
    addSection: '섹션 추가',
    addPreset: '프리셋 섹션 추가',
    dragHint: '핸들을 잡고 드래그해서 순서를 바꿔요.',
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
    questionBlueprint: 'Blueprint de preguntas',
    addSection: 'Agregar sección',
    addPreset: 'Agregar presets',
    dragHint: 'Arrastra con el handle para reordenar.',
    teacherNotes: 'Instrucciones personalizadas del docente (opcional)',
  },
} as const;

function moveItem<T>(array: T[], fromIndex: number, toIndex: number) {
  const next = [...array];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function getScaledDimensions(width: number, height: number, longEdgeLimit: number, pixelLimit: number) {
  let targetWidth = width;
  let targetHeight = height;
  const longEdge = Math.max(width, height);
  if (longEdge > longEdgeLimit) {
    const ratio = longEdgeLimit / longEdge;
    targetWidth = Math.round(width * ratio);
    targetHeight = Math.round(height * ratio);
  }
  const pixels = targetWidth * targetHeight;
  if (pixels > pixelLimit) {
    const ratio = Math.sqrt(pixelLimit / pixels);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }
  return { width: Math.max(1, targetWidth), height: Math.max(1, targetHeight) };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode image.'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', quality);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to convert blob.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBase64(dataUrl: string) {
  const [, base64] = dataUrl.split(',');
  return base64 ?? '';
}

function drawResized(image: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas context unavailable.');
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function compressImage(file: File) {
  const image = await loadImage(file);
  const scaled = getScaledDimensions(image.naturalWidth, image.naturalHeight, MAX_LONG_EDGE, MAX_MEGAPIXELS);
  let canvas = drawResized(image, scaled.width, scaled.height);
  let chosenBlob: Blob | null = null;

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_IMAGE_BYTES) {
      chosenBlob = blob;
      break;
    }
    chosenBlob = blob;
  }

  if (!chosenBlob) {
    throw new Error('Failed to compress image.');
  }

  let currentBlob = chosenBlob;
  let currentWidth = scaled.width;
  let currentHeight = scaled.height;
  while (currentBlob.size > MAX_IMAGE_BYTES && currentWidth > 640 && currentHeight > 640) {
    currentWidth = Math.round(currentWidth * 0.9);
    currentHeight = Math.round(currentHeight * 0.9);
    canvas = drawResized(image, currentWidth, currentHeight);
    currentBlob = await canvasToBlob(canvas, QUALITY_STEPS[QUALITY_STEPS.length - 1]);
  }

  if (currentBlob.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large after compression. Try a smaller image.');
  }

  const thumbScaled = getScaledDimensions(currentWidth, currentHeight, THUMB_LONG_EDGE, THUMB_LONG_EDGE * THUMB_LONG_EDGE);
  const thumbCanvas = drawResized(image, thumbScaled.width, thumbScaled.height);
  const thumbBlob = await canvasToBlob(thumbCanvas, 0.72);
  const originalDataUrl = await blobToDataUrl(currentBlob);
  const thumbnailDataUrl = await blobToDataUrl(thumbBlob);

  return {
    originalInput: originalDataUrl,
    thumbnailPreview: thumbnailDataUrl,
    uploadPayload: {
      originalBase64: dataUrlToBase64(originalDataUrl),
      thumbnailBase64: dataUrlToBase64(thumbnailDataUrl),
      width: currentWidth,
      height: currentHeight,
      thumbWidth: thumbScaled.width,
      thumbHeight: thumbScaled.height,
      sizeBytes: currentBlob.size,
    },
  };
}

function createSignature(input: {
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
}) {
  return JSON.stringify(input);
}

function parseGeneratedFromLog(log: OpenAiLogRecord): GeneratedExamSet | null {
  if (!log.responseJson) {
    return null;
  }
  try {
    const parsed = JSON.parse(log.responseJson) as Partial<GeneratedExamSet> | { generated?: Partial<GeneratedExamSet> };
    const candidate = 'generated' in parsed ? parsed.generated : parsed;
    if (
      candidate &&
      typeof candidate.title === 'string' &&
      (typeof candidate.summary === 'string' || typeof candidate.outputSummary === 'string') &&
      typeof candidate.gradeBand === 'string' &&
      typeof candidate.sourceSummary === 'string' &&
      Array.isArray(candidate.recommendedPrompts) &&
      Array.isArray(candidate.questions)
    ) {
      const normalized = candidate as GeneratedExamSet;
      return {
        ...normalized,
        summary: normalized.summary || normalized.outputSummary || '',
        outputSummary: normalized.outputSummary || normalized.summary || '',
        sourceKeywords: normalized.sourceKeywords ?? [],
        outputKeywords: normalized.outputKeywords ?? [],
      };
    }
  } catch {
    return null;
  }
  return null;
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
    outputSummary: payload.outputSummary || payload.summary,
    sourceSummary: payload.sourceSummary,
    outputKeywords: payload.outputKeywords ?? [],
    sourceKeywords: payload.sourceKeywords ?? [],
    questions: payload.questions,
  });
}

export function ExamBuilder({ initialExamSet, initialGenerateHistory = [], generateLimit = 5 }: BuilderProps) {
  const router = useRouter();
  const initialConfig = initialExamSet?.config;
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
    })),
  );
  const [title, setTitle] = useState(initialExamSet?.title ?? '');
  const [gradeBand, setGradeBand] = useState(initialConfig?.gradeBand ?? gradeBandOptions[1]);
  const [notes, setNotes] = useState(initialExamSet?.sourceNotes ?? '');
  const [selectedShortcutId, setSelectedShortcutId] = useState(quickOptionsByLanguage[uiLanguage][0].id);
  const [blueprints, setBlueprints] = useState<QuestionBlueprint[]>(initialConfig?.blueprints ?? starterBlueprints);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [generationLogId, setGenerationLogId] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState(initialExamSet?.generateCount ?? 0);
  const [generatedHistory, setGeneratedHistory] = useState<OpenAiLogRecord[]>(initialGenerateHistory);
  const [selectedHistoryLogId, setSelectedHistoryLogId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedExamSet | null>(
    initialExamSet
      ? {
          title: initialExamSet.title,
          summary: initialExamSet.summary,
          gradeBand: initialExamSet.config.gradeBand,
          sourceSummary: initialExamSet.summary,
          outputSummary: initialExamSet.summary,
          sourceKeywords: [],
          outputKeywords: [],
          recommendedPrompts: [],
          questions: initialExamSet.questions,
        }
      : null,
  );
  const [publishedSignature, setPublishedSignature] = useState<string>(() => {
    if (!initialExamSet || initialExamSet.status !== 'published') {
      return '';
    }
    return editionSignature({
      title: initialExamSet.title,
      summary: initialExamSet.summary,
      gradeBand: initialExamSet.config.gradeBand,
      sourceSummary: initialExamSet.summary,
      outputSummary: initialExamSet.summary,
      sourceKeywords: [],
      outputKeywords: [],
      recommendedPrompts: [],
      questions: initialExamSet.questions,
    });
  });
  const [statusMessage, setStatusMessage] = useState('Upload source images and generate your exam set.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedSignature, setLastSavedSignature] = useState('');

  const quickOptions = quickOptionsByLanguage[uiLanguage];
  const selectedShortcut = quickOptions.find((option) => option.id === selectedShortcutId) ?? quickOptions[0];
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
    [blueprints, examLanguage, gradeBand, notes, sourceLanguage, title, uiLanguage],
  );

  const totalQuestions = blueprints.reduce((sum, blueprint) => sum + blueprint.count, 0);
  const currentSignature = createSignature({
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
    generatedQuestionCount: generated?.questions.length ?? 0,
  });
  const hasUnsavedChanges = lastSavedSignature.length > 0 && currentSignature !== lastSavedSignature;
  const canGenerate = currentExamSetId ? generateCount < generateLimit : true;

  useEffect(() => {
    const preferredLanguage = window.localStorage.getItem(APP_UI_LANGUAGE_KEY) as UILanguage | null;
    if (preferredLanguage && ['en', 'ko', 'es'].includes(preferredLanguage)) {
      setUiLanguage(preferredLanguage);
      setSelectedShortcutId(quickOptionsByLanguage[preferredLanguage][0].id);
    }
  }, []);

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

  function updateBlueprint(index: number, patch: Partial<QuestionBlueprint>) {
    setBlueprints((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addBlueprint() {
    setBlueprints((current) => [
      ...current,
      { label: `Section ${current.length + 1}`, format: 'multiple_choice', count: 5, focus: 'Check understanding of the main ideas.' },
    ]);
  }

  function addPresetBlueprints() {
    const presets = blueprintPresetsByCategory[selectedShortcut.id] ?? [];
    setBlueprints((current) => [...current, ...presets.map((preset) => ({ ...preset }))]);
  }

  function removeBlueprint(index: number) {
    setBlueprints((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleDrop(toIndex: number) {
    if (draggingIndex === null || draggingIndex === toIndex) {
      setDraggingIndex(null);
      setDropIndicatorIndex(null);
      return;
    }
    setBlueprints((current) => moveItem(current, draggingIndex, toIndex));
    setDraggingIndex(null);
    setDropIndicatorIndex(null);
  }

  function getUntitledTitle() {
    const defaultLabelByShortcutId: Record<string, string> = {
      vocabulary_mix: 'Vocabulary',
      reading_check: 'Reading',
      grammar_practice: 'Grammar',
    };
    const label = defaultLabelByShortcutId[selectedShortcutId] ?? 'Practice';
    return `Untitled ${label} Quiz`;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    const remainingSlots = MAX_IMAGE_COUNT - images.length;
    if (remainingSlots <= 0) {
      setStatusMessage(`You can upload up to ${MAX_IMAGE_COUNT} images.`);
      input.value = '';
      return;
    }

    const selected = files.slice(0, remainingSlots);
    try {
      const compressed = await Promise.all(selected.map((file) => compressImage(file)));
      const nextImages: BuilderImage[] = compressed.map((item) => ({
        id: crypto.randomUUID(),
        originalInput: item.originalInput,
        thumbnailPreview: item.thumbnailPreview,
        uploadPayload: item.uploadPayload,
      }));
      const totalBytes = [...images, ...nextImages].reduce((sum, item) => sum + (item.uploadPayload?.sizeBytes ?? item.sourceImage?.sizeBytes ?? 0), 0);
      if (totalBytes > MAX_TOTAL_BYTES_HARD) {
        setStatusMessage(`Total payload is too large. Keep total under ${Math.round(MAX_TOTAL_BYTES_HARD / 1024 / 1024)}MB.`);
        input.value = '';
        return;
      }
      setImages((current) => [...current, ...nextImages]);
      setStatusMessage(`Loaded ${nextImages.length} image(s). ${Math.min(images.length + nextImages.length, MAX_IMAGE_COUNT)}/${MAX_IMAGE_COUNT} ready.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to process images.');
    }
    input.value = '';
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function ensureUploadedImages() {
    const existingImages = images.filter((item) => item.sourceImage).map((item) => item.sourceImage!) as ExamSourceImage[];
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
        promptText: selectedShortcut.prompt,
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
    setLastSavedSignature(createSignature({
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
      generatedQuestionCount: generatedPayload.questions.length,
    }));
    if (!options?.auto) {
      router.push('/dashboard');
      router.refresh();
    }
    return payload.examSetId;
  }

  async function handleGenerate() {
    if (!canGenerate) {
      setStatusMessage(`Generation limit reached (${generateLimit}/${generateLimit}).`);
      return;
    }
    if (images.length === 0) {
      setStatusMessage('At least one image is required before generation.');
      return;
    }
    const imageInputs = images.map((image) => image.originalInput).filter(Boolean);
    if (imageInputs.length === 0) {
      setStatusMessage('Image input is unavailable. Re-upload image files before generating.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Generating exam questions from uploaded images...');
    try {
      const response = await fetch('/api/exam-sets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examSetId: currentExamSetId ?? undefined,
          imageDataUrls: imageInputs,
          notes: [selectedShortcut.prompt, notes].filter(Boolean).join('\n\n'),
          config,
        }),
      });
      const payload = (await response.json()) as GeneratedPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Generation failed.');
      }

      setGenerated(payload);
      setGenerationLogId(payload.generationLogId);
      setSelectedHistoryLogId(payload.generationLogId);
      setGeneratedHistory((current) => [
        {
          id: payload.generationLogId,
          userId: '',
          examSetId: currentExamSetId,
          model: 'openai',
          promptText: `Output language for exam questions and answers: ${examLanguage}.`,
          responseText: null,
          responseJson: JSON.stringify(payload),
          latencyMs: null,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          estimatedCostUsd: null,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setGenerateCount((value) => value + (currentExamSetId ? 1 : 0));
      await saveDraft(payload, { auto: true });
      setStatusMessage('Generated and auto-saved draft.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Generation failed.');
    } finally {
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

  async function publishEdition(payload: GeneratedExamSet, logId: string) {
    setIsSaving(true);
    setStatusMessage('Publishing this edition...');
    try {
      setGenerationLogId(logId);
      setGenerated(payload);
      setSelectedHistoryLogId(logId);
      const examSetId = await saveDraft(payload, { auto: true });
      const response = await fetch('/api/exam-sets/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examSetId }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Publish failed.');
      }
      setPublishedSignature(editionSignature(payload));
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
        <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard" onClick={handleBackToDashboard}>
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Builder conversation</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{totalQuestions} questions planned</span>
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
              <input accept="image/*" className="block w-full text-sm" multiple onChange={handleFileChange} type="file" />
            </label>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((image, index) => (
                  <div key={image.id} className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <img alt={`Uploaded source ${index + 1}`} className="h-32 w-full object-cover" src={image.thumbnailPreview} />
                    <button className="absolute right-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-xs font-semibold text-white" onClick={() => removeImage(index)} type="button">
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
                    className={`rounded-full border px-3 py-2 text-xs font-semibold ${selectedShortcutId === option.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                    onClick={() => setSelectedShortcutId(option.id)}
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
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-950">{labels.questionBlueprint}</h3>
                <div className="flex gap-2">
                  <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" onClick={addPresetBlueprints} type="button">
                    {labels.addPreset}
                  </button>
                  <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" onClick={addBlueprint} type="button">
                    {labels.addSection}
                  </button>
                </div>
              </div>
              <p className="mb-3 text-xs text-slate-500">{labels.dragHint}</p>
              <div className="space-y-3">
                {blueprints.map((blueprint, index) => (
                  <div
                    key={`${blueprint.label}-${index}`}
                    className={`grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[auto_1.15fr_0.9fr_0.6fr_1.4fr_auto] ${
                      dropIndicatorIndex === index ? 'ring-2 ring-sky-400 ring-offset-2' : ''
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (draggingIndex !== null) {
                        setDropIndicatorIndex(index);
                      }
                    }}
                    onDrop={() => handleDrop(index)}
                  >
                    <button
                      className="cursor-grab rounded-xl border border-slate-300 px-2 text-sm text-slate-500"
                      draggable
                      onDragEnd={() => {
                        setDraggingIndex(null);
                        setDropIndicatorIndex(null);
                      }}
                      onDragStart={() => setDraggingIndex(index)}
                      title="Drag handle"
                      type="button"
                    >
                      ::
                    </button>
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { label: event.target.value })} placeholder="Section title" title="Section title" value={blueprint.label} />
                    <select className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { format: event.target.value as QuestionKind })} title="Question type" value={blueprint.format}>
                      <option value="multiple_choice">Multiple choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short answer</option>
                    </select>
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" min={1} onChange={(event) => updateBlueprint(index, { count: Number(event.target.value) || 1 })} placeholder="Count" title="Question count" type="number" value={blueprint.count} />
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { focus: event.target.value })} placeholder="Focus / pattern" title="Question intent or pattern" value={blueprint.focus} />
                    <button className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeBlueprint(index)} type="button">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isGenerating || !canGenerate}
                onClick={handleGenerate}
                type="button"
              >
                {isGenerating ? 'Generating...' : 'Generate exam set'}
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                Generate usage: {currentExamSetId ? `${generateCount}/${generateLimit}` : `0/${generateLimit} (applies after first save)`}
              </span>
              <button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving || !generated} onClick={handleSave} type="button">
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
                        <button
                          key={history.id}
                          className={`w-full rounded-2xl border px-3 py-2 text-left text-xs ${
                            isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                          onClick={() => {
                            setSelectedHistoryLogId(history.id);
                            setGenerationLogId(history.id);
                            if (preview) {
                              setGenerated(preview);
                            }
                          }}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">Edition {editionNumber}</p>
                              <p className="mt-1 text-[11px]">{new Date(history.createdAt).toLocaleString()}</p>
                              <p className="mt-1 text-[11px]">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                  {outputLanguage}
                                </span>
                              </p>
                              <p className="mt-1 text-[11px]">{grade} · {questionCount} questions</p>
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
                        </button>
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
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
                    {question.choices.length === 0 ? <p className="mt-3 text-sm text-emerald-700">Answer: {question.answer}</p> : null}
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
