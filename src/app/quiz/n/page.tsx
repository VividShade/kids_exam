// app/n/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ChoiceKey = 'A' | 'B' | 'C' | 'D' | 'E';

type ChoiceOption = {
  key: ChoiceKey;
  textEn: string;
  textKo: string;
};

type Question = {
  id: number;
  questionEn: string;
  questionKo: string;
  options: ChoiceOption[];
  correctKey: ChoiceKey;
};

type LanguageMode = 'both' | 'en' | 'ko';

const QUESTIONS: Question[] = [
  {
    id: 1,
    questionEn: 'Where were Dink, Josh, and Ruth Rose traveling for their vacation?',
    questionKo: '딩크, 조쉬, 루스 로즈는 어디로 휴가를 가고 있었나요?',
    options: [
      { key: 'A', textEn: 'Texas Longhorn Ranch', textKo: '텍사스 롱혼 목장' },
      { key: 'B', textEn: 'Western Wheat Dude Ranch', textKo: '웨스턴 위트 듀드 랜치' },
      { key: 'C', textEn: 'Silver Creek Farm', textKo: '실버 크리크 농장' },
      { key: 'D', textEn: 'Montana Mountain Resort', textKo: '몬태나 마운틴 리조트' },
      { key: 'E', textEn: 'Red River Ranch', textKo: '레드 리버 목장' },
    ],
    correctKey: 'B',
  },
  {
    id: 2,
    questionEn: 'What unusual thing happened to Judd at the gas station?',
    questionKo: '주드에게 주유소에서 생긴 이상한 일은?',
    options: [
      { key: 'A', textEn: 'His car broke down', textKo: '차가 고장남' },
      { key: 'B', textEn: 'His wallet was missing money', textKo: '지갑의 돈이 사라짐' },
      { key: 'C', textEn: 'He lost his car keys', textKo: '열쇠를 잃어버림' },
      { key: 'D', textEn: 'He forgot to pay', textKo: '계산을 잊음' },
      { key: 'E', textEn: 'He bought too much candy', textKo: '과자를 너무 많이 삼' },
    ],
    correctKey: 'B',
  },
  {
    id: 3,
    questionEn: 'What does Judd want to study in college?',
    questionKo: '주드는 대학에서 무엇을 전공하고 싶어 했나요?',
    options: [
      { key: 'A', textEn: 'Animal Science', textKo: '동물과학' },
      { key: 'B', textEn: 'Business', textKo: '경영학' },
      { key: 'C', textEn: 'Teaching', textKo: '교육학' },
      { key: 'D', textEn: 'Engineering', textKo: '공학' },
      { key: 'E', textEn: 'Aviation', textKo: '항공학' },
    ],
    correctKey: 'C',
  },
  {
    id: 4,
    questionEn: 'What was strange about Thumbs’ hand?',
    questionKo: '텀즈의 손은 무엇이 이상했나요?',
    options: [
      { key: 'A', textEn: 'It had six fingers', textKo: '손가락이 여섯 개였다' },
      { key: 'B', textEn: 'It was bandaged', textKo: '붕대가 감겨 있었다' },
      { key: 'C', textEn: 'He was missing a thumb', textKo: '엄지가 없었다' },
      { key: 'D', textEn: 'It was tattooed', textKo: '문신이 있었다' },
      { key: 'E', textEn: 'It was swollen', textKo: '손이 부어 있었다' },
    ],
    correctKey: 'C',
  },
  {
    id: 5,
    questionEn: 'What did Lulu ring to signal mealtime?',
    questionKo: '루루는 식사 시간을 알리기 위해 무엇을 울렸나요?',
    options: [
      { key: 'A', textEn: 'A whistle', textKo: '호루라기' },
      { key: 'B', textEn: 'A bell', textKo: '종' },
      { key: 'C', textEn: 'An iron triangle', textKo: '쇠 삼각형' },
      { key: 'D', textEn: 'A gong', textKo: '징' },
      { key: 'E', textEn: 'A cowbell', textKo: '소 방울' },
    ],
    correctKey: 'C',
  },
  {
    id: 6,
    questionEn: 'Who scared the kids with a grizzly bear story?',
    questionKo: '그리즐리 곰 이야기를 하며 모두를 겁준 사람은?',
    options: [
      { key: 'A', textEn: 'Judd', textKo: '주드' },
      { key: 'B', textEn: 'Paul', textKo: '폴' },
      { key: 'C', textEn: 'Thumbs', textKo: '텀즈' },
      { key: 'D', textEn: 'Ed Getz', textKo: '에드 게츠' },
      { key: 'E', textEn: 'Lulu', textKo: '루루' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'What did Dink see outside their cabin during the night?',
    questionKo: '딩크가 밤에 캐빈 밖에서 본 것은?',
    options: [
      { key: 'A', textEn: 'A horse', textKo: '말 한 마리' },
      { key: 'B', textEn: 'A shadow blocking the window', textKo: '창문을 가린 큰 그림자' },
      { key: 'C', textEn: 'A raccoon stealing food', textKo: '음식을 훔치는 너구리' },
      { key: 'D', textEn: 'A falling tree branch', textKo: '떨어지는 나뭇가지' },
      { key: 'E', textEn: 'Thumbs walking around', textKo: '돌아다니는 텀즈' },
    ],
    correctKey: 'B',
  },
  {
    id: 8,
    questionEn: 'What activity did the guests do at the stream?',
    questionKo: '손님들은 시냇가에서 어떤 활동을 했나요?',
    options: [
      { key: 'A', textEn: 'Fishing', textKo: '낚시' },
      { key: 'B', textEn: 'Swimming', textKo: '수영' },
      { key: 'C', textEn: 'Panning for gold', textKo: '사금 채취' },
      { key: 'D', textEn: 'Collecting rocks', textKo: '돌 수집' },
      { key: 'E', textEn: 'Painting scenery', textKo: '풍경 그리기' },
    ],
    correctKey: 'C',
  },
  {
    id: 9,
    questionEn: 'Why did Ed claim he couldn’t ride a horse?',
    questionKo: '에드는 왜 말을 탈 수 없다고 했나요?',
    options: [
      { key: 'A', textEn: 'He had a fever', textKo: '열이 나서' },
      { key: 'B', textEn: 'He sprained his ankle', textKo: '발목을 삐었다고 했기 때문에' },
      { key: 'C', textEn: 'He was afraid of horses', textKo: '말이 무서워서' },
      { key: 'D', textEn: 'He got lost', textKo: '길을 잃어서' },
      { key: 'E', textEn: 'He was needed at the ranch', textKo: '목장에서 도움이 필요해서' },
    ],
    correctKey: 'B',
  },
  {
    id: 10,
    questionEn: 'Who found the largest gold nugget?',
    questionKo: '가장 큰 금덩이를 발견한 사람은?',
    options: [
      { key: 'A', textEn: 'Ruth Rose', textKo: '루스 로즈' },
      { key: 'B', textEn: 'Dink', textKo: '딩크' },
      { key: 'C', textEn: 'Judd', textKo: '주드' },
      { key: 'D', textEn: 'Fiona', textKo: '피오나' },
      { key: 'E', textEn: 'Josh', textKo: '조쉬' },
    ],
    correctKey: 'E',
  },
  {
    id: 11,
    questionEn: 'Where did Judd store Josh’s nugget?',
    questionKo: '주드는 조쉬의 금덩이를 어디에 보관했나요?',
    options: [
      { key: 'A', textEn: "In Josh's backpack", textKo: '조쉬의 배낭' },
      { key: 'B', textEn: 'In the barn', textKo: '외양간' },
      { key: 'C', textEn: 'In the office safe', textKo: '사무실 금고' },
      { key: 'D', textEn: 'In Paul’s truck', textKo: '폴의 트럭' },
      { key: 'E', textEn: 'Under his bed', textKo: '침대 아래' },
    ],
    correctKey: 'C',
  },
  {
    id: 12,
    questionEn: 'What suspicious thing did the kids discover in Thumbs’ cabin?',
    questionKo: '텀즈의 캐빈에서 발견된 수상한 물건은?',
    options: [
      { key: 'A', textEn: 'A gold nugget', textKo: '금덩이' },
      { key: 'B', textEn: 'A map of the ranch', textKo: '목장 지도' },
      { key: 'C', textEn: 'Black clothes and ropes', textKo: '검은 옷과 여러 줄' },
      { key: 'D', textEn: 'Money hidden in a drawer', textKo: '서랍 속 돈' },
      { key: 'E', textEn: 'A broken lockpick', textKo: '부러진 자물쇠 따개' },
    ],
    correctKey: 'C',
  },
  {
    id: 13,
    questionEn: 'What did Ed have in his cabin that suggested he practiced magic?',
    questionKo: '에드가 마술 연습을 한다는 증거는?',
    options: [
      { key: 'A', textEn: 'A wand', textKo: '마술 지팡이' },
      { key: 'B', textEn: 'A rabbit', textKo: '토끼' },
      { key: 'C', textEn: 'Magic Made Easy book', textKo: '‘쉽게 배우는 마술’ 책' },
      { key: 'D', textEn: 'A magician’s cape', textKo: '마술 망토' },
      { key: 'E', textEn: 'A deck of trick cards', textKo: '트릭 카드' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'What did the kids see Ed doing through his window at night?',
    questionKo: '아이들이 밤에 에드를 창문으로 보았을 때 그는 무엇을 하고 있었나요?',
    options: [
      { key: 'A', textEn: 'Feeding a pet', textKo: '애완동물에게 먹이를 줌' },
      { key: 'B', textEn: 'Practicing rope tricks', textKo: '줄 묘기 연습' },
      { key: 'C', textEn: 'Packing his bags', textKo: '짐을 싸고 있었음' },
      { key: 'D', textEn: 'Reading a book', textKo: '책 읽기' },
      { key: 'E', textEn: 'Calling someone', textKo: '누군가에게 전화' },
    ],
    correctKey: 'C',
  },
  {
    id: 15,
    questionEn: 'Where did Ed hide Josh’s stolen gold nugget?',
    questionKo: '에드는 조쉬의 금덩이를 어디에 숨겼나요?',
    options: [
      { key: 'A', textEn: 'Under his bed', textKo: '침대 아래' },
      { key: 'B', textEn: 'In the barn', textKo: '외양간' },
      { key: 'C', textEn: 'Inside his sock', textKo: '양말 속' },
      { key: 'D', textEn: 'In a backpack', textKo: '배낭' },
      { key: 'E', textEn: 'In Lulu’s kitchen', textKo: '루루의 부엌' },
    ],
    correctKey: 'C',
  },
  {
    id: 16,
    questionEn: 'How did Josh stop Ed from escaping?',
    questionKo: '조쉬는 어떻게 에드의 도망을 막았나요?',
    options: [
      { key: 'A', textEn: 'He tackled him', textKo: '몸으로 막아섬' },
      { key: 'B', textEn: 'He yelled for help', textKo: '큰 소리를 질렀음' },
      { key: 'C', textEn: 'He lassoed him from the roof', textKo: '지붕에서 밧줄로 그를 잡음' },
      { key: 'D', textEn: 'He locked the cabin door', textKo: '캐빈 문을 잠금' },
      { key: 'E', textEn: 'He blocked the path', textKo: '길을 막음' },
    ],
    correctKey: 'C',
  },
  {
    id: 17,
    questionEn: 'How did Ed probably open the safe?',
    questionKo: '에드는 금고를 어떻게 열었을 것으로 추정되나요?',
    options: [
      { key: 'A', textEn: 'With a stolen key', textKo: '열쇠를 훔쳐서' },
      { key: 'B', textEn: 'By guessing', textKo: '운 좋게 추측해서' },
      { key: 'C', textEn: 'Using a stethoscope', textKo: '청진기를 사용해서' },
      { key: 'D', textEn: 'Breaking it with a hammer', textKo: '망치로 깨서' },
      { key: 'E', textEn: 'Using magic powder', textKo: '마술 가루로' },
    ],
    correctKey: 'C',
  },
  {
    id: 18,
    questionEn: 'What did Lulu dress up as to scare the kids earlier?',
    questionKo: '루루가 아이들을 놀라게 하기 위해 분장한 것은?',
    options: [
      { key: 'A', textEn: 'A cowboy', textKo: '카우보이' },
      { key: 'B', textEn: 'A ghost', textKo: '유령' },
      { key: 'C', textEn: 'A grizzly bear', textKo: '그리즐리 곰' },
      { key: 'D', textEn: 'A wolf', textKo: '늑대' },
      { key: 'E', textEn: 'A witch', textKo: '마녀' },
    ],
    correctKey: 'C',
  },
  {
    id: 19,
    questionEn: 'What did Josh decide to do with the giant gold nugget?',
    questionKo: '조쉬는 큰 금덩이를 어떻게 하기로 결정했나요?',
    options: [
      { key: 'A', textEn: 'Sell it and buy a car', textKo: '팔아서 자동차를 삼' },
      { key: 'B', textEn: 'Keep it forever', textKo: '간직하기로 함' },
      { key: 'C', textEn: 'Give it to Judd to save the ranch', textKo: '목장을 살리라고 주드에게 기부함' },
      { key: 'D', textEn: 'Send it home to his parents', textKo: '집으로 보냄' },
      { key: 'E', textEn: 'Hide it in his cabin', textKo: '캐빈에 숨김' },
    ],
    correctKey: 'C',
  },
  {
    id: 20,
    questionEn: 'How did Ma and Lulu “thank” Josh at breakfast?',
    questionKo: '아침 식사 때 마와 루루는 조쉬에게 어떻게 감사 인사를 했나요?',
    options: [
      { key: 'A', textEn: 'They baked him a cake', textKo: '케이크를 만들어 줌' },
      { key: 'B', textEn: 'They gave him a certificate', textKo: '감사장을 줌' },
      { key: 'C', textEn: 'They tried to kiss him', textKo: '그에게 키스하려고 함' },
      { key: 'D', textEn: 'They bought him a hat', textKo: '모자를 선물함' },
      { key: 'E', textEn: 'They braided him a rope', textKo: '밧줄을 땋아서 줌' },
    ],
    correctKey: 'C',
  },
];

export default function NinthNuggetQuizPage() {
  const [answers, setAnswers] = useState<Record<number, ChoiceKey | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [langMode, setLangMode] = useState<LanguageMode>('en');

  const handleSelect = (questionId: number, key: ChoiceKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
    if (isSubmitted) {
      setIsSubmitted(false);
      setScore(null);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctKey) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  const baseButton =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition shadow-sm';
  const secondaryButton =
    'border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md';
  const primaryButton = 'bg-indigo-600 text-white hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg';

  const totalQuestions = QUESTIONS.length;

  const resultMessage = useMemo(() => {
    if (!isSubmitted || score === null) return '';
    const ratio = score / totalQuestions;
    if (ratio === 1) return '완벽해요! 모든 문제를 맞췄어요 🎉';
    if (ratio >= 0.8) return '아주 잘했어요! 조금만 더 연습하면 완벽해질 것 같아요 💪';
    if (ratio >= 0.5) return '괜찮아요! 한 번 더 읽어 보고 다시 풀어볼까요? 😊';
    return '처음엔 어려울 수 있어요. 책을 다시 읽고 다시 도전해봐요! 📚';
  }, [isSubmitted, score, totalQuestions]);

  const getQuestionStatus = (q: Question) => {
    if (!isSubmitted || score === null) return 'none' as const;
    const userAnswer = answers[q.id];
    if (!userAnswer) return 'none' as const;
    return userAnswer === q.correctKey ? 'correct' : 'incorrect';
  };

  const renderQuestionText = (q: Question) => {
    switch (langMode) {
      case 'en':
        return (
          <p className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-slate-900">{q.questionEn}</span>
          </p>
        );
      case 'ko':
        return (
          <p className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-slate-900">{q.questionKo}</span>
          </p>
        );
      case 'both':
      default:
        return (
          <p className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-slate-900">{q.questionEn}</span>
            <span className="text-[13px] text-slate-600">{q.questionKo}</span>
          </p>
        );
    }
  };

  const renderOptionText = (o: ChoiceOption) => {
    switch (langMode) {
      case 'en':
        return <span>{o.textEn}</span>;
      case 'ko':
        return <span>{o.textKo}</span>;
      case 'both':
      default:
        return (
          <span>
            {o.textEn}
            <span className="text-xs text-slate-500"> / {o.textKo}</span>
          </span>
        );
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-8">
      <div className="flex justify-start">
        <Link href="/" className={`${baseButton} ${secondaryButton}`}>
          ← 홈으로
        </Link>
      </div>

      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">A to Z Mysteries</p>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Ninth Nugget</h1>
          <p className="text-sm text-slate-600">영어 + 한국어 이중언어 퀴즈로 이야기 내용을 복습해 보세요.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              언어 표시
            </span>
            <div className="flex gap-2">
              {(['both', 'en', 'ko'] as LanguageMode[]).map((mode) => {
                const isActive = langMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                    onClick={() => setLangMode(mode)}
                  >
                    {mode === 'both' ? 'EN + KO' : mode.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              현재 상태
            </span>
            {isSubmitted && score !== null ? (
              <span className="text-sm font-semibold text-slate-800">
                {score} / {totalQuestions} 점
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-500">아직 채점 전이에요</span>
            )}
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {QUESTIONS.map((q, index) => {
          const status = getQuestionStatus(q);
          const userAnswer = answers[q.id];
          const correctOption = q.options.find((o) => o.key === q.correctKey)!;
          const statusStyles =
            status === 'correct' ? 'border-green-500' : status === 'incorrect' ? 'border-red-500' : 'border-slate-200';
          return (
            <article key={q.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition ${statusStyles}`}>
              <div className="flex items-start gap-2">
                <span className="min-w-[36px] font-bold text-indigo-600">Q{index + 1}.</span>
                <div className="flex-1">{renderQuestionText(q)}</div>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {q.options.map((o) => (
                  <label
                    key={o.key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-indigo-50"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={o.key}
                      checked={userAnswer === o.key}
                      onChange={() => handleSelect(q.id, o.key)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">{o.key}.</span>
                    <span className="text-sm text-slate-800">{renderOptionText(o)}</span>
                  </label>
                ))}
              </div>

              {isSubmitted && (
                <div className="mt-2 text-sm">
                  {userAnswer === q.correctKey ? (
                    <span className="font-semibold text-green-600">✅ 정답입니다!</span>
                  ) : (
                    <span className="text-red-600">
                      ❌ 오답이에요. 정답은 <strong>{correctOption.key}</strong>번 ({correctOption.textEn} /{' '}
                      {correctOption.textKo}) 입니다.
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <footer className="mt-4 flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <button type="button" className={`${baseButton} ${primaryButton}`} onClick={handleSubmit}>
            채점하기
          </button>
          <button type="button" className={`${baseButton} ${secondaryButton}`} onClick={handleReset}>
            다시 풀기
          </button>
        </div>
        {resultMessage && <p className="text-sm text-slate-800">{resultMessage}</p>}
      </footer>
    </main>
  );
}
