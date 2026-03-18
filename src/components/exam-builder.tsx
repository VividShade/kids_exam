'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { ExamBuilderConfig, ExamSetRecord, GeneratedExamSet, QuestionBlueprint, QuestionKind } from '@/lib/types';

const quickOptions: Array<{ label: string; prompt: string }> = [
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
];

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

type BuilderProps = {
  initialExamSet?: ExamSetRecord | null;
};

export function ExamBuilder({ initialExamSet }: BuilderProps) {
  const router = useRouter();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initialExamSet?.sourceImageDataUrl ?? null);
  const [title, setTitle] = useState(initialExamSet?.title ?? '');
  const [gradeBand, setGradeBand] = useState(initialExamSet?.config.gradeBand ?? 'US Grade 4-5');
  const [notes, setNotes] = useState(initialExamSet?.sourceNotes ?? '');
  const [promptText, setPromptText] = useState(initialExamSet?.promptText ?? quickOptions[0].prompt);
  const [blueprints, setBlueprints] = useState<QuestionBlueprint[]>(initialExamSet?.config.blueprints ?? starterBlueprints);
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
  const [statusMessage, setStatusMessage] = useState('Upload an image and choose a prompt shortcut or write your own teacher note.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config: ExamBuilderConfig = useMemo(
    () => ({
      title: title || 'Untitled exam set',
      gradeBand,
      notes,
      blueprints,
    }),
    [blueprints, gradeBand, notes, title],
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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageDataUrl(dataUrl);
    setStatusMessage(`Loaded ${file.name}. The image is ready for multi-modal generation.`);
  }

  async function handleGenerate() {
    if (!imageDataUrl) {
      setStatusMessage('An image is required before generation.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Generating exam questions from the uploaded image...');

    try {
      const response = await fetch('/api/exam-sets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUrl,
          notes: [promptText, notes].filter(Boolean).join('\n\n'),
          config,
        }),
      });

      const payload = (await response.json()) as GeneratedExamSet & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Generation failed.');
      }

      setGenerated(payload);
      setTitle(payload.title);
      setStatusMessage(`Generated ${payload.questions.length} questions. Review and save when ready.`);
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
          title: title || generated.title,
          summary: generated.summary,
          promptText,
          sourceImageDataUrl: imageDataUrl,
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
              <p className="font-semibold">Assistant</p>
              <p className="mt-2 text-slate-200">Upload a textbook photo or worksheet, then pick a shortcut or customize the blueprint below.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">Suggested shortcuts</p>
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
              <span className="mb-3 block font-semibold text-slate-950">Source image</span>
              <input accept="image/*" capture="environment" className="block w-full text-sm" onChange={handleFileChange} type="file" />
              {imageDataUrl ? <img alt="Uploaded source" className="mt-4 max-h-80 rounded-2xl object-contain" src={imageDataUrl} /> : null}
            </label>

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
                <h3 className="text-sm font-bold text-slate-950">Question blueprint</h3>
                <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700" onClick={addBlueprint} type="button">
                  Add section
                </button>
              </div>
              <div className="space-y-3">
                {blueprints.map((blueprint, index) => (
                  <div key={`${blueprint.label}-${index}`} className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[1.2fr_0.9fr_0.6fr_1.4fr]">
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { label: event.target.value })} value={blueprint.label} />
                    <select className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { format: event.target.value as QuestionKind })} value={blueprint.format}>
                      <option value="multiple_choice">Multiple choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short answer</option>
                    </select>
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" min={1} onChange={(event) => updateBlueprint(index, { count: Number(event.target.value) || 1 })} type="number" value={blueprint.count} />
                    <input className="rounded-2xl border border-slate-300 px-3 py-2 text-sm" onChange={(event) => updateBlueprint(index, { focus: event.target.value })} value={blueprint.focus} />
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
