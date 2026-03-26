'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { ExamBuilderConfig, ExamSetRecord, ExamSourceImage, GeneratedExamSet, QuestionBlueprint, QuestionKind, UILanguage } from '@/lib/types';

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES_HARD = 18 * 1024 * 1024;
const MAX_LONG_EDGE = 2560;
const MAX_MEGAPIXELS = 8_000_000;
const THUMB_LONG_EDGE = 480;
const QUALITY_STEPS = [0.86, 0.8, 0.74, 0.68];

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

const quickOptionsByLanguage: Record<UILanguage, Array<{ id: string; label: string; prompt: string }>> = {
  en: [
    {
      id: 'vocabulary_mix',
      label: 'Vocabulary mix',
      prompt: 'Create a vocabulary test with meaning matching, fill-in-the-blank multiple choice, and short answer spelling checks.',
    },
    {
      id: 'reading_check',
      label: 'Reading check',
      prompt: 'Create a comprehension quiz with grade-appropriate multiple choice and true/false questions.',
    },
    {
      id: 'grammar_practice',
      label: 'Grammar practice',
      prompt: 'Create a grammar-focused quiz with short context sentences and error-resistant explanations.',
    },
  ],
  ko: [
    {
      id: 'vocabulary_mix',
      label: '어휘 혼합',
      prompt: '어휘 뜻 맞추기, 빈칸 객관식, 철자 주관식을 섞어서 어휘 테스트를 만들어줘.',
    },
    {
      id: 'reading_check',
      label: '독해 확인',
      prompt: '학년 수준에 맞는 객관식과 true/false로 독해 확인 퀴즈를 만들어줘.',
    },
    {
      id: 'grammar_practice',
      label: '문법 연습',
      prompt: '문법 중심의 퀴즈를 만들고 해설은 짧고 명확하게 만들어줘.',
    },
  ],
  es: [
    {
      id: 'vocabulary_mix',
      label: 'Vocabulario mixto',
      prompt: 'Crea una prueba de vocabulario con emparejar significados, opción múltiple con espacios y respuestas cortas.',
    },
    {
      id: 'reading_check',
      label: 'Comprensión lectora',
      prompt: 'Crea un quiz de comprensión con opción múltiple y verdadero/falso acorde al nivel.',
    },
    {
      id: 'grammar_practice',
      label: 'Práctica gramatical',
      prompt: 'Crea un quiz de gramática con explicaciones breves y claras.',
    },
  ],
};

const starterBlueprints: QuestionBlueprint[] = [
  { label: 'Meaning match', format: 'multiple_choice', count: 10, focus: 'Match a word with the correct meaning.' },
  { label: 'Sentence clue', format: 'multiple_choice', count: 10, focus: 'Choose the best word for a blank in a sentence.' },
  { label: 'Short answer recall', format: 'short_answer', count: 5, focus: 'Write the missing word directly.' },
];

const outputLanguageOptions = [
  'English',
  'Korean',
  'Spanish',
  'Japanese',
  'Chinese',
] as const;

type BuilderProps = {
  initialExamSet?: ExamSetRecord | null;
};

type GeneratedPayload = GeneratedExamSet & {
  generationLogId: string;
  error?: string;
};

const uiLabel = {
  en: {
    assistant: 'Assistant',
    uploadHelp: 'Upload up to 5 images. Images are compressed in your browser before upload.',
    sourceImage: 'Source images (max 5)',
    shortcuts: 'Question style',
    uiLanguage: 'Builder language',
    promptLanguage: 'Prompt language (advanced)',
    examLanguage: 'Exam output language',
    questionBlueprint: 'Question blueprint',
    addSection: 'Add section',
    dragHint: 'Drag rows to reorder sections.',
    teacherNotes: 'Teacher custom instructions (optional)',
    advanced: 'Advanced language settings',
    syncPromptLanguage: 'Keep prompt language synced with builder language',
  },
  ko: {
    assistant: '도우미',
    uploadHelp: '이미지를 최대 5장까지 올릴 수 있고, 브라우저에서 먼저 압축됩니다.',
    sourceImage: '기초 이미지 (최대 5장)',
    shortcuts: '문항 스타일',
    uiLanguage: '빌더 언어',
    promptLanguage: '프롬프트 언어 (고급)',
    examLanguage: '문제 출력 언어',
    questionBlueprint: '문항 blueprint',
    addSection: '섹션 추가',
    dragHint: '행을 드래그해서 순서를 변경해요.',
    teacherNotes: '교사 맞춤 지침 (선택)',
    advanced: '고급 언어 설정',
    syncPromptLanguage: '프롬프트 언어를 빌더 언어와 자동 동기화',
  },
  es: {
    assistant: 'Asistente',
    uploadHelp: 'Puedes subir hasta 5 imágenes. Se comprimen en el navegador antes de subir.',
    sourceImage: 'Imágenes fuente (máx. 5)',
    shortcuts: 'Estilo de preguntas',
    uiLanguage: 'Idioma del constructor',
    promptLanguage: 'Idioma del prompt (avanzado)',
    examLanguage: 'Idioma de salida del examen',
    questionBlueprint: 'Blueprint de preguntas',
    addSection: 'Agregar sección',
    dragHint: 'Arrastra filas para reordenar secciones.',
    teacherNotes: 'Instrucciones personalizadas del docente (opcional)',
    advanced: 'Ajustes avanzados de idioma',
    syncPromptLanguage: 'Mantener sincronizado el idioma del prompt con el constructor',
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

  return {
    width: Math.max(1, targetWidth),
    height: Math.max(1, targetHeight),
  };
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

export function ExamBuilder({ initialExamSet }: BuilderProps) {
  const router = useRouter();
  const initialConfig = initialExamSet?.config;
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(initialConfig?.uiLanguage ?? 'en');
  const [promptLanguage, setPromptLanguage] = useState<UILanguage>(initialConfig?.promptLanguage ?? (initialConfig?.uiLanguage ?? 'en'));
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isPromptSynced, setIsPromptSynced] = useState((initialConfig?.promptLanguage ?? initialConfig?.uiLanguage ?? 'en') === (initialConfig?.uiLanguage ?? 'en'));
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
  const [gradeBand, setGradeBand] = useState(initialConfig?.gradeBand ?? 'US Grade 4-5');
  const [notes, setNotes] = useState(initialExamSet?.sourceNotes ?? '');
  const [selectedShortcutId, setSelectedShortcutId] = useState(quickOptionsByLanguage[uiLanguage][0].id);
  const [blueprints, setBlueprints] = useState<QuestionBlueprint[]>(initialConfig?.blueprints ?? starterBlueprints);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [generationLogId, setGenerationLogId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedExamSet | null>(
    initialExamSet
      ? {
          title: initialExamSet.title,
          summary: initialExamSet.summary,
          gradeBand: initialExamSet.config.gradeBand,
          sourceSummary: initialExamSet.summary,
          recommendedPrompts: [],
          questions: initialExamSet.questions,
        }
      : null,
  );
  const [statusMessage, setStatusMessage] = useState('Upload source images and generate your exam set.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const quickOptions = quickOptionsByLanguage[uiLanguage];
  const selectedShortcut = quickOptions.find((option) => option.id === selectedShortcutId) ?? quickOptions[0];
  const labels = uiLabel[uiLanguage];

  const config: ExamBuilderConfig = useMemo(
    () => ({
      title: title || 'Untitled exam set',
      gradeBand,
      notes,
      uiLanguage,
      promptLanguage,
      examLanguage,
      blueprints,
    }),
    [blueprints, examLanguage, gradeBand, notes, promptLanguage, title, uiLanguage],
  );

  const totalQuestions = blueprints.reduce((sum, blueprint) => sum + blueprint.count, 0);

  function updateBlueprint(index: number, patch: Partial<QuestionBlueprint>) {
    setBlueprints((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addBlueprint() {
    setBlueprints((current) => [
      ...current,
      { label: `Section ${current.length + 1}`, format: 'multiple_choice', count: 5, focus: 'Check understanding of the main ideas.' },
    ]);
  }

  function removeBlueprint(index: number) {
    setBlueprints((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleDrop(toIndex: number) {
    if (draggingIndex === null || draggingIndex === toIndex) {
      setDraggingIndex(null);
      return;
    }

    setBlueprints((current) => moveItem(current, draggingIndex, toIndex));
    setDraggingIndex(null);
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
      const nextImages = compressed.map((item) => ({
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: newUploads }),
    });

    const payload = (await response.json()) as { images?: ExamSourceImage[]; error?: string };
    if (!response.ok || !payload.images) {
      throw new Error(payload.error ?? 'Failed to upload source images.');
    }

    return [...existingImages, ...payload.images];
  }

  async function handleGenerate() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
      setTitle(payload.title);
      setStatusMessage(`Generated ${payload.questions.length} questions.`);
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
      const uploadedImages = await ensureUploadedImages();
      const response = await fetch('/api/exam-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialExamSet?.id,
          generationLogId,
          title: title || generated.title,
          summary: generated.summary,
          promptText: selectedShortcut.prompt,
          sourceImages: uploadedImages,
          sourceNotes: notes,
          config,
          questions: generated.questions,
        }),
      });

      const payload = (await response.json()) as { examSetId?: string; error?: string };
      if (!response.ok || !payload.examSetId) {
        throw new Error(payload.error ?? 'Save failed.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Exam builder</p>
          <h1 className="text-3xl font-black text-slate-950">Chat-style exam generation</h1>
        </div>
        <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                {labels.uiLanguage}
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  onChange={(event) => {
                    const next = event.target.value as UILanguage;
                    setUiLanguage(next);
                    if (isPromptSynced) {
                      setPromptLanguage(next);
                    }
                    setSelectedShortcutId(quickOptionsByLanguage[next][0].id);
                  }}
                  value={uiLanguage}
                >
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                {labels.examLanguage}
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setExamLanguage(event.target.value)} value={examLanguage}>
                  {outputLanguageOptions.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700" onClick={() => setIsAdvancedOpen((value) => !value)} type="button">
              {labels.advanced}
            </button>
            {isAdvancedOpen ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    checked={isPromptSynced}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setIsPromptSynced(checked);
                      if (checked) {
                        setPromptLanguage(uiLanguage);
                      }
                    }}
                    type="checkbox"
                  />
                  {labels.syncPromptLanguage}
                </label>
                <label className="text-sm font-semibold text-slate-800">
                  {labels.promptLanguage}
                  <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" disabled={isPromptSynced} onChange={(event) => setPromptLanguage(event.target.value as UILanguage)} value={promptLanguage}>
                    <option value="en">English</option>
                    <option value="ko">Korean</option>
                    <option value="es">Spanish</option>
                  </select>
                </label>
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Exam set title
                <input className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setTitle(event.target.value)} value={title} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Grade band
                <input className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setGradeBand(event.target.value)} value={gradeBand} />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-800">
              {labels.teacherNotes}
              <textarea className="mt-2 min-h-28 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setNotes(event.target.value)} value={notes} />
            </label>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-950">{labels.questionBlueprint}</h3>
                <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" onClick={addBlueprint} type="button">
                  {labels.addSection}
                </button>
              </div>
              <p className="mb-3 text-xs text-slate-500">{labels.dragHint}</p>
              <div className="space-y-3">
                {blueprints.map((blueprint, index) => (
                  <div
                    key={`${blueprint.label}-${index}`}
                    className="grid cursor-grab gap-3 rounded-3xl bg-white p-4 md:grid-cols-[1.2fr_0.9fr_0.6fr_1.4fr_auto]"
                    draggable
                    onDragEnd={() => setDraggingIndex(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={() => setDraggingIndex(index)}
                    onDrop={() => handleDrop(index)}
                  >
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { label: event.target.value })} value={blueprint.label} />
                    <select className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { format: event.target.value as QuestionKind })} value={blueprint.format}>
                      <option value="multiple_choice">Multiple choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short answer</option>
                    </select>
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" min={1} onChange={(event) => updateBlueprint(index, { count: Number(event.target.value) || 1 })} type="number" value={blueprint.count} />
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { focus: event.target.value })} value={blueprint.focus} />
                    <button className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeBlueprint(index)} type="button">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={isGenerating} onClick={handleGenerate} type="button">
                {isGenerating ? 'Generating...' : 'Generate exam set'}
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving || !generated} onClick={handleSave} type="button">
                {isSaving ? 'Saving...' : initialExamSet ? 'Update draft' : 'Save draft'}
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
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Summary</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{generated.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{generated.summary}</p>
                <p className="mt-3 text-sm text-slate-500">Source recap: {generated.sourceSummary}</p>
              </div>

              {generated.recommendedPrompts.length > 0 ? (
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-sm font-bold text-slate-950">Recommended next prompts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {generated.recommendedPrompts.map((prompt) => (
                      <p key={prompt} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                        {prompt}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {generated.questions.map((question, index) => (
                  <article key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                    <p className="mt-2 font-semibold text-slate-950">{question.prompt}</p>
                    {question.choices.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-sm text-slate-600">
                        {question.choices.map((choice) => (
                          <li key={choice}>• {choice}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-3 text-sm text-emerald-700">Answer: {question.answer}</p>
                    <p className="mt-1 text-sm text-slate-500">{question.explanation}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
              Generated questions will appear here after the first multi-modal run.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

