'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { ExamBuilderConfig, ExamSetRecord, GeneratedExamSet, QuestionBlueprint, QuestionKind, UILanguage } from '@/lib/types';

const quickOptionsByLanguage: Record<UILanguage, Array<{ label: string; prompt: string }>> = {
  en: [
    {
      label: 'Vocabulary mix',
      prompt: 'Create a vocabulary test with meaning matching, fill-in-the-blank multiple choice, and short answer spelling checks.',
    },
    {
      label: 'Reading check',
      prompt: 'Create a comprehension quiz with grade-appropriate multiple choice and true/false questions.',
    },
    {
      label: 'Grammar practice',
      prompt: 'Create a grammar-focused quiz with short context sentences and error-resistant explanations.',
    },
  ],
  ko: [
    {
      label: '어휘 혼합',
      prompt: '어휘 뜻 맞추기, 문장 빈칸 객관식, 철자 주관식을 섞어서 어휘 테스트를 만들어줘.',
    },
    {
      label: '독해 확인',
      prompt: '학년 수준에 맞는 객관식과 true/false로 독해 확인 퀴즈를 만들어줘.',
    },
    {
      label: '문법 연습',
      prompt: '문법 중심의 퀴즈를 만들고 해설은 짧고 정확하게 만들어줘.',
    },
  ],
  es: [
    {
      label: 'Mezcla de vocabulario',
      prompt: 'Crea una prueba de vocabulario con emparejar significados, opción múltiple de espacios en blanco y respuestas cortas.',
    },
    {
      label: 'Comprensión lectora',
      prompt: 'Crea un quiz de comprensión con opción múltiple y verdadero/falso acorde al grado.',
    },
    {
      label: 'Práctica de gramática',
      prompt: 'Crea un quiz centrado en gramática con explicaciones breves y claras.',
    },
  ],
};

const starterBlueprints: QuestionBlueprint[] = [
  { label: 'Meaning match', format: 'multiple_choice', count: 10, focus: 'Match a word with the correct meaning.' },
  { label: 'Sentence clue', format: 'multiple_choice', count: 10, focus: 'Choose the best word for a blank in a sentence.' },
  { label: 'Short answer recall', format: 'short_answer', count: 5, focus: 'Write the missing word directly.' },
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function moveItem<T>(array: T[], fromIndex: number, toIndex: number) {
  const next = [...array];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

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
    uploadHelp: 'Upload up to 5 textbook photos or worksheets, then pick a shortcut or customize the blueprint.',
    sourceImage: 'Source images (max 5)',
    shortcuts: 'Suggested shortcuts',
    uiLanguage: 'UI language',
    promptLanguage: 'Prompt language',
    examLanguage: 'Exam output language',
    questionBlueprint: 'Question blueprint',
    addSection: 'Add section',
    dragHint: 'Drag to reorder',
  },
  ko: {
    assistant: '도우미',
    uploadHelp: '교재/워크시트 사진을 최대 5장까지 올리고, 추천 옵션 또는 blueprint를 조정해줘.',
    sourceImage: '기초 이미지 (최대 5장)',
    shortcuts: '추천 바로가기',
    uiLanguage: 'UI 언어',
    promptLanguage: '프롬프트 언어',
    examLanguage: '문제 출제 언어',
    questionBlueprint: '문항 blueprint',
    addSection: '섹션 추가',
    dragHint: '드래그로 순서 변경',
  },
  es: {
    assistant: 'Asistente',
    uploadHelp: 'Sube hasta 5 fotos del material y luego elige un atajo o ajusta el blueprint.',
    sourceImage: 'Imágenes fuente (máx. 5)',
    shortcuts: 'Atajos sugeridos',
    uiLanguage: 'Idioma de UI',
    promptLanguage: 'Idioma del prompt',
    examLanguage: 'Idioma del examen',
    questionBlueprint: 'Blueprint de preguntas',
    addSection: 'Agregar sección',
    dragHint: 'Arrastra para reordenar',
  },
} as const;

export function ExamBuilder({ initialExamSet }: BuilderProps) {
  const router = useRouter();
  const initialConfig = initialExamSet?.config;
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(initialConfig?.uiLanguage ?? 'en');
  const [promptLanguage, setPromptLanguage] = useState<UILanguage>(initialConfig?.promptLanguage ?? 'en');
  const [examLanguage, setExamLanguage] = useState(initialConfig?.examLanguage ?? 'English');
  const [imageDataUrls, setImageDataUrls] = useState<string[]>(initialExamSet?.sourceImageDataUrls ?? []);
  const [title, setTitle] = useState(initialExamSet?.title ?? '');
  const [gradeBand, setGradeBand] = useState(initialConfig?.gradeBand ?? 'US Grade 4-5');
  const [notes, setNotes] = useState(initialExamSet?.sourceNotes ?? '');
  const [promptText, setPromptText] = useState(initialExamSet?.promptText ?? quickOptionsByLanguage[uiLanguage][0].prompt);
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
  const [statusMessage, setStatusMessage] = useState('Upload images and start generation.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const quickOptions = quickOptionsByLanguage[uiLanguage];
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
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const remainingSlots = 5 - imageDataUrls.length;
    if (remainingSlots <= 0) {
      setStatusMessage('You can upload up to 5 images.');
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const dataUrls = await Promise.all(selected.map((file) => readFileAsDataUrl(file)));
    setImageDataUrls((current) => [...current, ...dataUrls]);
    setStatusMessage(`Loaded ${selected.length} image(s). ${imageDataUrls.length + selected.length}/5 ready.`);
    event.currentTarget.value = '';
  }

  function removeImage(index: number) {
    setImageDataUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleGenerate() {
    if (imageDataUrls.length === 0) {
      setStatusMessage('At least one image is required before generation.');
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
          imageDataUrls,
          notes: [promptText, notes].filter(Boolean).join('\n\n'),
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
          promptText,
          sourceImageDataUrls: imageDataUrls,
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

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                {labels.uiLanguage}
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setUiLanguage(event.target.value as UILanguage)} value={uiLanguage}>
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                {labels.promptLanguage}
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setPromptLanguage(event.target.value as UILanguage)} value={promptLanguage}>
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="es">Spanish</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                {labels.examLanguage}
                <input className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setExamLanguage(event.target.value)} value={examLanguage} />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">{labels.shortcuts}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickOptions.map((option) => (
                  <button
                    key={option.label}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    onClick={() => setPromptText(option.prompt)}
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

            {imageDataUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {imageDataUrls.map((imageDataUrl, index) => (
                  <div key={imageDataUrl} className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <img alt={`Uploaded source ${index + 1}`} className="h-32 w-full object-cover" src={imageDataUrl} />
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
              Prompt for ChatGPT / OpenAI
              <textarea className="mt-2 min-h-32 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm" onChange={(event) => setPromptText(event.target.value)} value={promptText} />
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Teacher notes
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
                      <button key={prompt} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700" onClick={() => setPromptText(prompt)} type="button">
                        {prompt}
                      </button>
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
