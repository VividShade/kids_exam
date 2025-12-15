// app/o/page.tsx
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
    questionEn: 'Where are Dink, Josh, and Ruth Rose at the beginning of the story?',
    questionKo: '이야기의 처음에 Dink, Josh, Ruth Rose는 어디에 있나요?',
    options: [
      { key: 'A', textEn: 'On Uncle Warren’s balcony in New York City', textKo: '뉴욕에 있는 Warren 삼촌의 발코니 위' },
      { key: 'B', textEn: 'In their school library', textKo: '학교 도서관 안' },
      { key: 'C', textEn: 'At a farm in the country', textKo: '시골 농장' },
      { key: 'D', textEn: 'Inside the Central Park Zoo', textKo: '센트럴 파크 동물원 안' },
      { key: 'E', textEn: 'On a speeding train', textKo: '달리는 기차 안' },
    ],
    correctKey: 'A',
  },
  {
    id: 2,
    questionEn: 'Why is the block party being held?',
    questionKo: '블록 파티를 여는 가장 큰 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'To celebrate New Year’s Day', textKo: '새해를 축하하기 위해' },
      { key: 'B', textEn: 'To welcome new neighbors', textKo: '새 이웃을 환영하기 위해' },
      {
        key: 'C',
        textEn: 'To raise money for the Central Park Zoo',
        textKo: '센트럴 파크 동물원을 위한 기금을 모으기 위해',
      },
      { key: 'D', textEn: 'To protest traffic in the city', textKo: '도시의 교통을 항의하기 위해' },
      { key: 'E', textEn: 'To celebrate Uncle Warren’s birthday', textKo: 'Warren 삼촌의 생일을 축하하기 위해' },
    ],
    correctKey: 'C',
  },
  {
    id: 3,
    questionEn: 'Who painted the valuable stolen painting?',
    questionKo: '훔쳐진 귀중한 그림을 그린 화가는 누구인가요?',
    options: [
      { key: 'A', textEn: 'Pablo Picasso', textKo: '파블로 피카소' },
      { key: 'B', textEn: 'Leonardo da Vinci', textKo: '레오나르도 다 빈치' },
      { key: 'C', textEn: 'Claude Monet', textKo: '클로드 모네' },
      { key: 'D', textEn: 'Vincent van Gogh', textKo: '빈센트 반 고흐' },
      { key: 'E', textEn: 'Michelangelo', textKo: '미켈란젤로' },
    ],
    correctKey: 'C',
  },
  {
    id: 4,
    questionEn: 'What is shown in the painting that is stolen?',
    questionKo: '훔쳐진 그림에는 무엇이 그려져 있나요?',
    options: [
      { key: 'A', textEn: 'A tiger in a jungle', textKo: '정글 속 호랑이' },
      {
        key: 'B',
        textEn: 'A rowboat floating on a pond with lily pads',
        textKo: '수련이 있는 연못 위에 떠 있는 조각배',
      },
      { key: 'C', textEn: 'A tall building in New York City', textKo: '뉴욕의 높은 빌딩' },
      { key: 'D', textEn: 'A girl feeding birds in a park', textKo: '공원에서 새에게 먹이를 주는 소녀' },
      { key: 'E', textEn: 'A stormy ocean', textKo: '폭풍우 치는 바다' },
    ],
    correctKey: 'B',
  },
  {
    id: 5,
    questionEn: 'Who is the owner of the Monet painting?',
    questionKo: '그 모네 그림의 주인은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Uncle Warren', textKo: 'Warren 삼촌' },
      { key: 'B', textEn: 'Roger', textKo: 'Roger' },
      { key: 'C', textEn: 'Forrest Evans', textKo: 'Forrest Evans' },
      { key: 'D', textEn: 'Harvey Fowler', textKo: 'Harvey Fowler' },
      { key: 'E', textEn: 'Dr. Ted Parker', textKo: 'Ted Parker 박사' },
    ],
    correctKey: 'C',
  },
  {
    id: 6,
    questionEn: 'What fruit is in the wooden bowl on the kitchen table before the party?',
    questionKo: '파티 전에 부엌 식탁 위의 나무 그릇 안에 있던 과일은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Apples', textKo: '사과' },
      { key: 'B', textEn: 'Bananas', textKo: '바나나' },
      { key: 'C', textEn: 'Oranges', textKo: '오렌지' },
      { key: 'D', textEn: 'Pears', textKo: '배' },
      { key: 'E', textEn: 'Grapes', textKo: '포도' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'What big clue do they find in the kitchen after the painting is stolen?',
    questionKo: '그림이 도난당한 후, 부엌에서 발견한 큰 단서는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A broken window', textKo: '깨진 창문' },
      { key: 'B', textEn: 'A muddy shoe', textKo: '진흙 묻은 신발' },
      { key: 'C', textEn: 'Orange peels and juice everywhere', textKo: '온통 흩어진 오렌지 껍질과 주스' },
      { key: 'D', textEn: 'A dropped wallet', textKo: '떨어진 지갑' },
      { key: 'E', textEn: 'A torn piece of a map', textKo: '찢어진 지도 조각' },
    ],
    correctKey: 'C',
  },
  {
    id: 8,
    questionEn: 'Who is the building manager with wild orange hair?',
    questionKo: '주황색 머리를 가진 건물 관리인은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Mrs. Cornelius', textKo: 'Mrs. Cornelius' },
      { key: 'B', textEn: 'Jenny Fowler', textKo: 'Jenny Fowler' },
      { key: 'C', textEn: 'Miss Booker', textKo: 'Miss Booker' },
      { key: 'D', textEn: 'Detective Frost', textKo: '수사관 Frost' },
      { key: 'E', textEn: 'Mrs. Evans', textKo: 'Mrs. Evans' },
    ],
    correctKey: 'C',
  },
  {
    id: 9,
    questionEn: 'Where does Miss Booker live in the building?',
    questionKo: 'Miss Booker는 건물의 어디에 살고 있나요?',
    options: [
      { key: 'A', textEn: 'On the roof', textKo: '옥상' },
      { key: 'B', textEn: 'In a small basement apartment', textKo: '지하의 작은 아파트' },
      { key: 'C', textEn: 'In the apartment above Uncle Warren', textKo: 'Warren 삼촌 집 위층 아파트' },
      { key: 'D', textEn: 'In an office on the first floor', textKo: '1층의 사무실' },
      { key: 'E', textEn: 'In a house across the street', textKo: '길 건너 집' },
    ],
    correctKey: 'B',
  },
  {
    id: 10,
    questionEn: 'Which neighbor thinks she saw someone on her balcony during the block party?',
    questionKo: '블록 파티 동안 자기 발코니에서 누군가를 봤다고 생각한 이웃은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Miss Booker', textKo: 'Miss Booker' },
      { key: 'B', textEn: 'Roger', textKo: 'Roger' },
      { key: 'C', textEn: 'Mrs. Cornelius', textKo: 'Mrs. Cornelius' },
      { key: 'D', textEn: 'Dr. Parker', textKo: 'Parker 박사' },
      { key: 'E', textEn: 'Jenny Fowler', textKo: 'Jenny Fowler' },
    ],
    correctKey: 'C',
  },
  {
    id: 11,
    questionEn: 'What special tool does Mrs. Cornelius use to watch birds more clearly?',
    questionKo: 'Mrs. Cornelius가 새들을 더 잘 보기 위해 사용하는 특별한 도구는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A telescope', textKo: '망원경' },
      { key: 'B', textEn: 'A pair of binoculars', textKo: '쌍안경' },
      {
        key: 'C',
        textEn: 'A large round magnifying glass on the balcony door',
        textKo: '발코니 문에 붙어 있는 둥근 확대경',
      },
      { key: 'D', textEn: 'A camera with a zoom lens', textKo: '줌 렌즈가 달린 카메라' },
      { key: 'E', textEn: 'A pair of special glasses', textKo: '특별한 안경' },
    ],
    correctKey: 'C',
  },
  {
    id: 12,
    questionEn: 'Whose hair do they compare with the orange hair using Uncle Warren’s microscope?',
    questionKo: 'Warren 삼촌의 현미경으로 주황색 머리카락과 비교한 사람의 머리카락은 누구의 것인가요?',
    options: [
      { key: 'A', textEn: 'Dink’s', textKo: 'Dink' },
      { key: 'B', textEn: 'Ruth Rose’s', textKo: 'Ruth Rose' },
      { key: 'C', textEn: 'Josh’s', textKo: 'Josh' },
      { key: 'D', textEn: 'Roger’s', textKo: 'Roger' },
      { key: 'E', textEn: 'Miss Booker’s', textKo: 'Miss Booker' },
    ],
    correctKey: 'C',
  },
  {
    id: 13,
    questionEn: 'What kind of animal is Ollie?',
    questionKo: 'Ollie는 어떤 동물인가요?',
    options: [
      { key: 'A', textEn: 'A chimpanzee', textKo: '침팬지' },
      { key: 'B', textEn: 'A gorilla', textKo: '고릴라' },
      { key: 'C', textEn: 'An orangutan', textKo: '오랑우탄' },
      { key: 'D', textEn: 'A monkey', textKo: '원숭이' },
      { key: 'E', textEn: 'A lion', textKo: '사자' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'What is the name of the company that owns Ollie and Polly?',
    questionKo: 'Ollie와 Polly를 가지고 있는 회사 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Evans Animal Shows', textKo: 'Evans Animal Shows' },
      { key: 'B', textEn: 'Central Park Animal Acts', textKo: 'Central Park Animal Acts' },
      { key: 'C', textEn: 'Fowler’s Farm Animal Acts', textKo: 'Fowler’s Farm Animal Acts' },
      { key: 'D', textEn: 'Booker’s Circus Animals', textKo: 'Booker’s Circus Animals' },
      { key: 'E', textEn: 'New York Party Animals', textKo: 'New York Party Animals' },
    ],
    correctKey: 'C',
  },
  {
    id: 15,
    questionEn: 'What is the name of the pony in the story?',
    questionKo: '이야기 속 조랑말의 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Dolly', textKo: 'Dolly' },
      { key: 'B', textEn: 'Molly', textKo: 'Molly' },
      { key: 'C', textEn: 'Polly', textKo: 'Polly' },
      { key: 'D', textEn: 'Holly', textKo: 'Holly' },
      { key: 'E', textEn: 'Sally', textKo: 'Sally' },
    ],
    correctKey: 'C',
  },
  {
    id: 16,
    questionEn: 'What is the name of the male detective who comes to Uncle Warren’s apartment?',
    questionKo: 'Warren 삼촌의 아파트에 온 남자 형사의 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Detective James Frost', textKo: 'James Frost 형사' },
      { key: 'B', textEn: 'Detective Ted Parker', textKo: 'Ted Parker 형사' },
      { key: 'C', textEn: 'Detective Frank Costello', textKo: 'Frank Costello 형사' },
      { key: 'D', textEn: 'Detective Harvey Fowler', textKo: 'Harvey Fowler 형사' },
      { key: 'E', textEn: 'Detective Roger Duncan', textKo: 'Roger Duncan 형사' },
    ],
    correctKey: 'C',
  },
  {
    id: 17,
    questionEn: 'What is Dr. Ted Parker’s job?',
    questionKo: 'Ted Parker 박사의 직업은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A building manager', textKo: '건물 관리인' },
      { key: 'B', textEn: 'A curator for primates at the Bronx Zoo', textKo: '브롱크스 동물원의 영장류 큐레이터' },
      { key: 'C', textEn: 'A police detective', textKo: '경찰 형사' },
      { key: 'D', textEn: 'A circus trainer', textKo: '서커스 조련사' },
      { key: 'E', textEn: 'A school teacher', textKo: '학교 선생님' },
    ],
    correctKey: 'B',
  },
  {
    id: 18,
    questionEn: 'Where is the stolen painting finally found?',
    questionKo: '훔쳐진 그림은 결국 어디에서 발견되나요?',
    options: [
      { key: 'A', textEn: 'Under Uncle Warren’s bed', textKo: 'Warren 삼촌 침대 밑' },
      { key: 'B', textEn: 'In Miss Booker’s basement apartment', textKo: 'Miss Booker의 지하 아파트' },
      { key: 'C', textEn: 'In Roger’s desk in the lobby', textKo: '로비에 있는 Roger의 책상 속' },
      {
        key: 'D',
        textEn: 'Under a false bottom in Ollie’s cage in the trailer',
        textKo: '트레일러 안, Ollie 우리 바닥의 가짜 바닥 아래',
      },
      { key: 'E', textEn: 'Behind a picture in Mrs. Cornelius’s living room', textKo: 'Mrs. Cornelius 거실 그림 뒤' },
    ],
    correctKey: 'D',
  },
  {
    id: 19,
    questionEn: 'Where will Ollie go at the end of the story?',
    questionKo: '이야기의 끝에서 Ollie는 어디로 가게 되나요?',
    options: [
      { key: 'A', textEn: 'To a circus in New York', textKo: '뉴욕의 서커스로' },
      { key: 'B', textEn: 'To live in Central Park Zoo', textKo: '센트럴 파크 동물원으로' },
      { key: 'C', textEn: 'Back to Borneo to a special camp', textKo: '보르네오의 특별한 캠프로' },
      { key: 'D', textEn: 'To a farm near Larchmont', textKo: 'Larchmont 근처 농장으로' },
      { key: 'E', textEn: 'To stay with Forrest Evans', textKo: 'Forrest Evans와 함께 지내러' },
    ],
    correctKey: 'C',
  },
  {
    id: 20,
    questionEn: 'Who will probably keep Polly the pony in the end?',
    questionKo: '마지막에 Polly 조랑말을 키우게 될 사람들은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Uncle Warren', textKo: 'Warren 삼촌' },
      { key: 'B', textEn: 'Miss Booker', textKo: 'Miss Booker' },
      { key: 'C', textEn: 'Dink’s family', textKo: 'Dink의 가족' },
      { key: 'D', textEn: 'Ruth Rose and Josh’s family together', textKo: 'Ruth Rose와 Josh의 가족이 함께' },
      { key: 'E', textEn: 'Mrs. Cornelius', textKo: 'Mrs. Cornelius' },
    ],
    correctKey: 'D',
  },
];

export default function OrangeOutlawQuizPage() {
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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Orange Outlaw</h1>
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
