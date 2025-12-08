// app/m/page.tsx
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
    questionEn: 'Why do Dink, Josh, and Ruth Rose decide to clean Josh’s barn?',
    questionKo: '딩크, 조쉬, 루스로즈가 왜 조쉬네 헛간을 청소하기로 하나요?',
    options: [
      { key: 'A', textEn: 'To help Josh’s parents for free', textKo: '조쉬 부모님을 그냥 도와주려고' },
      { key: 'B', textEn: 'To find hidden treasure', textKo: '숨겨진 보물을 찾으려고' },
      { key: 'C', textEn: 'To earn money for the museum programs', textKo: '박물관 프로그램 참가비를 벌려고' },
      { key: 'D', textEn: 'To punish Josh’s brothers', textKo: '조쉬 동생들을 벌주려고' },
      { key: 'E', textEn: 'To practice for a mystery game', textKo: '미스터리 게임 연습을 하려고' },
    ],
    correctKey: 'C',
  },
  {
    id: 2,
    questionEn: 'How much does each museum program cost per day?',
    questionKo: '박물관의 하루 프로그램 참가 비용은 얼마인가요?',
    options: [
      { key: 'A', textEn: '25 cents', textKo: '25센트' },
      { key: 'B', textEn: '50 cents', textKo: '50센트' },
      { key: 'C', textEn: '75 cents', textKo: '75센트' },
      { key: 'D', textEn: '1 dollar', textKo: '1달러' },
      { key: 'E', textEn: '5 dollars', textKo: '5달러' },
    ],
    correctKey: 'D',
  },
  {
    id: 3,
    questionEn: 'What is the special activity on Monday at the museum?',
    questionKo: '박물관에서 월요일에 하는 특별 활동 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Frog Friday', textKo: '개구리 금요일' },
      { key: 'B', textEn: 'Mummy Monday', textKo: '미라 월요일' },
      { key: 'C', textEn: 'Tyrannosaurus Tuesday', textKo: '티라노사우루스 화요일' },
      { key: 'D', textEn: 'Wet Wednesday', textKo: '젖는 수요일' },
      { key: 'E', textEn: 'Thrilling Thursday', textKo: '짜릿한 목요일' },
    ],
    correctKey: 'B',
  },
  {
    id: 4,
    questionEn: 'What is Dr. Tweed’s full name?',
    questionKo: '박사님의 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Dr. Harry Tweed', textKo: '해리 트위드 박사' },
      { key: 'B', textEn: 'Dr. Henry Tweed', textKo: '헨리 트위드 박사' },
      { key: 'C', textEn: 'Dr. Harris Tweed', textKo: '해리스 트위드 박사' },
      { key: 'D', textEn: 'Dr. Harold Tweed', textKo: '해럴드 트위드 박사' },
      { key: 'E', textEn: 'Dr. Harvey Tweed', textKo: '하비 트위드 박사' },
    ],
    correctKey: 'C',
  },
  {
    id: 5,
    questionEn: 'What is an ancient Egyptian coffin called, according to Dr. Tweed?',
    questionKo: '고대 이집트의 관을 부르는 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Pyramid', textKo: '피라미드' },
      { key: 'B', textEn: 'Crypt', textKo: '지하실' },
      { key: 'C', textEn: 'Sarcophagus', textKo: '사르코파구스' },
      { key: 'D', textEn: 'Vault', textKo: '금고' },
      { key: 'E', textEn: 'Tombstone', textKo: '묘비' },
    ],
    correctKey: 'C',
  },
  {
    id: 6,
    questionEn: 'Why are rich Egyptians buried near their money and treasures?',
    questionKo: '왜 부유한 이집트 사람들은 돈과 보물과 함께 묻혔나요?',
    options: [
      { key: 'A', textEn: 'To show off to visitors', textKo: '방문객들에게 자랑하려고' },
      { key: 'B', textEn: 'Because they were afraid of thieves', textKo: '도둑이 무서워서' },
      { key: 'C', textEn: 'Because they believed they needed them in the next life', textKo: '다음 세상에서도 필요하다고 믿었기 때문에' },
      { key: 'D', textEn: 'To help the museum later', textKo: '나중에 박물관에 주려고' },
      { key: 'E', textEn: 'To make the tomb look beautiful', textKo: '무덤 장식을 화려하게 하려고' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'Who steals the child mummy from the tomb at first?',
    questionKo: '처음에 아이 미라를 훔쳐가는 사람은 누구인가요?',
    options: [
      { key: 'A', textEn: 'A boy with a hat', textKo: '모자를 쓴 남자아이' },
      { key: 'B', textEn: 'A woman with long blonde hair and a baggy dress', textKo: '긴 금발 머리와 헐렁한 원피스를 입은 여자' },
      { key: 'C', textEn: 'A man in a black suit', textKo: '검은 정장을 입은 남자' },
      { key: 'D', textEn: 'A girl with red hair', textKo: '빨간 머리 소녀' },
      { key: 'E', textEn: 'A museum guard', textKo: '박물관 경비원' },
    ],
    correctKey: 'B',
  },
  {
    id: 8,
    questionEn: 'Where is the missing mummy finally found?',
    questionKo: '사라졌던 미라는 어디에서 발견되나요?',
    options: [
      { key: 'A', textEn: 'In the treasure chamber', textKo: '보물 방 안에서' },
      { key: 'B', textEn: 'In the cafeteria', textKo: '카페테리아에서' },
      { key: 'C', textEn: 'In the ladies’ restroom on the changing table', textKo: '여자 화장실의 기저귀 가는 테이블 위에서' },
      { key: 'D', textEn: 'In the parking lot', textKo: '주차장에서' },
      { key: 'E', textEn: 'In the bank', textKo: '은행 안에서' },
    ],
    correctKey: 'C',
  },
  {
    id: 9,
    questionEn: 'Why do the tomb doors close and trap the kids inside?',
    questionKo: '아이들이 무덤에 갇히게 되는 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Someone locks them in on purpose', textKo: '누군가 일부러 문을 잠가서' },
      { key: 'B', textEn: 'The museum closes early', textKo: '박물관이 일찍 문을 닫아서' },
      { key: 'C', textEn: 'An alarm is set off, and the door closes automatically', textKo: '경보가 울리자 문이 자동으로 닫혀서' },
      { key: 'D', textEn: 'A power failure shuts the doors', textKo: '정전이 나서 문이 닫혀서' },
      { key: 'E', textEn: 'A mummy pushes the door shut', textKo: '미라가 문을 밀어서' },
    ],
    correctKey: 'C',
  },
  {
    id: 10,
    questionEn: 'Where do the kids hide when the thieves come into the treasure chamber?',
    questionKo: '도둑들이 보물 방에 들어왔을 때 아이들은 어디에 숨나요?',
    options: [
      { key: 'A', textEn: 'Behind a mummy', textKo: '미라 뒤에' },
      { key: 'B', textEn: 'Under a bench', textKo: '벤치 아래에' },
      { key: 'C', textEn: 'Inside the sarcophagus', textKo: '관 안에' },
      { key: 'D', textEn: 'In a small closet full of chairs and carpet squares', textKo: '접이식 의자와 카펫 조각이 있는 작은 벽장 안에' },
      { key: 'E', textEn: 'Behind the gold cases', textKo: '유리 진열장 뒤에' },
    ],
    correctKey: 'D',
  },
  {
    id: 11,
    questionEn: 'How do the thieves get into the treasure chamber from outside?',
    questionKo: '도둑들은 어떻게 바깥에서 보물 방으로 들어왔나요?',
    options: [
      { key: 'A', textEn: 'Through the museum roof', textKo: '박물관 지붕을 통해' },
      { key: 'B', textEn: 'Through a window', textKo: '창문으로' },
      { key: 'C', textEn: 'Through the front door', textKo: '정문으로' },
      { key: 'D', textEn: 'By digging a tunnel', textKo: '땅 아래로 터널을 파서' },
      { key: 'E', textEn: 'Through a hole blown in the wall', textKo: '폭발로 뚫린 벽의 구멍을 통해' },
    ],
    correctKey: 'E',
  },
  {
    id: 12,
    questionEn: 'What special clue does Dink notice about one of the thieves’ clothes?',
    questionKo: '딩크가 도둑들의 옷에서 눈여겨본 단서는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A blue cap', textKo: '파란 모자' },
      { key: 'B', textEn: 'A white stripe on the front of the pants or jacket', textKo: '무릎 위쪽에 있는 흰 줄무늬' },
      { key: 'C', textEn: 'A red scarf', textKo: '빨간 목도리' },
      { key: 'D', textEn: 'Green shoes', textKo: '초록색 신발' },
      { key: 'E', textEn: 'A shiny belt buckle', textKo: '반짝이는 벨트 버클' },
    ],
    correctKey: 'B',
  },
  {
    id: 13,
    questionEn: 'What special ability of Tyrannosaurus Rex reminds Dink of Josh?',
    questionKo: '티라노사우루스 렉스의 어떤 특별한 능력이 조쉬를 떠올리게 하나요?',
    options: [
      { key: 'A', textEn: 'Its strong legs', textKo: '튼튼한 다리' },
      { key: 'B', textEn: 'Its sharp teeth', textKo: '날카로운 이빨' },
      { key: 'C', textEn: 'Its amazing sense of smell', textKo: '놀라운 후각' },
      { key: 'D', textEn: 'Its long tail', textKo: '긴 꼬리' },
      { key: 'E', textEn: 'Its loud roar', textKo: '큰 울음소리' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'What smell helps Josh remember something about the thieves?',
    questionKo: '조쉬가 도둑에 대해 떠올리게 된 냄새는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Chocolate cake', textKo: '초콜릿 케이크 냄새' },
      { key: 'B', textEn: 'Popcorn', textKo: '팝콘 냄새' },
      { key: 'C', textEn: 'Fried chicken', textKo: '치킨 튀김 냄새' },
      { key: 'D', textEn: 'French fries', textKo: '감자튀김 냄새' },
      { key: 'E', textEn: 'Pizza', textKo: '피자 냄새' },
    ],
    correctKey: 'D',
  },
  {
    id: 15,
    questionEn: 'What is the name of the restaurant next to the bank?',
    questionKo: '은행 옆에 있는 식당 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: "Uncle Joe's Burgers", textKo: '엉클 조 햄버거' },
      { key: 'B', textEn: "Aunt Frida's Fabulous Fries", textKo: '프리다 이모의 환상적인 감자튀김' },
      { key: 'C', textEn: "Mama Mia's Pizza", textKo: '마마미아 피자' },
      { key: 'D', textEn: 'Nile River Café', textKo: '나일강 카페' },
      { key: 'E', textEn: 'Hartford Snack House', textKo: '하트포드 스낵 하우스' },
    ],
    correctKey: 'B',
  },
  {
    id: 16,
    questionEn: 'What object does Josh find on the kitchen floor at Aunt Frida’s that matches something in the tomb?',
    questionKo: '조쉬가 프리다 이모 식당 주방 바닥에서 주워서, 무덤의 것과 똑같다고 말한 것은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A gold coin', textKo: '금화' },
      { key: 'B', textEn: 'A tiny bone', textKo: '작은 뼈' },
      { key: 'C', textEn: 'A smooth pebble', textKo: '매끄러운 조약돌' },
      { key: 'D', textEn: 'A torn ticket', textKo: '찢어진 표' },
      { key: 'E', textEn: 'A piece of cloth', textKo: '천 조각' },
    ],
    correctKey: 'C',
  },
  {
    id: 17,
    questionEn: "Where do the kids think the gold is hidden after Dink’s nightmare?",
    questionKo: '딩크의 악몽 이후, 아이들은 금이 어디에 숨겨져 있다고 생각하나요?',
    options: [
      { key: 'A', textEn: 'Under the museum floor', textKo: '박물관 바닥 밑' },
      { key: 'B', textEn: 'In the cafeteria freezer', textKo: '카페테리아 냉동고 안' },
      { key: 'C', textEn: "Inside the child mummy's sarcophagus", textKo: '아이 미라의 관 안' },
      { key: 'D', textEn: 'In the bank vault', textKo: '은행 금고 안' },
      { key: 'E', textEn: 'In the fish pond', textKo: '연못 속' },
    ],
    correctKey: 'C',
  },
  {
    id: 18,
    questionEn: 'Who are the two main thieves?',
    questionKo: '주요 도둑 두 사람은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Dr. Tweed and Aunt Frida', textKo: '트위드 박사와 프리다 이모' },
      { key: 'B', textEn: 'Dr. Tweed and the woman with short dark hair from the restaurant', textKo: '트위드 박사와 식당의 짧은 검은 머리 여자' },
      { key: 'C', textEn: 'Aunt Frida and Dink', textKo: '프리다 이모와 딩크' },
      { key: 'D', textEn: "Josh's dad and a museum guard", textKo: '조쉬 아빠와 박물관 경비원' },
      { key: 'E', textEn: 'Officer Peters and Officer Washington', textKo: '피터스 경관과 워싱턴 경관' },
    ],
    correctKey: 'B',
  },
  {
    id: 19,
    questionEn: 'How does Dr. Tweed try to escape with the gym bag of gold?',
    questionKo: '트위드 박사는 금이 든 가방을 들고 어떻게 도망치려고 하나요?',
    options: [
      { key: 'A', textEn: 'Through the front doors', textKo: '정문으로 나가려고' },
      { key: 'B', textEn: 'By hiding in the cafeteria', textKo: '카페테리아에 숨으려고' },
      { key: 'C', textEn: 'By jumping out through the plywood-covered hole into the park', textKo: '합판으로 막아 둔 벽 구멍을 통해 공원으로 뛰어나가려고' },
      { key: 'D', textEn: 'By running up the stairs to the roof', textKo: '계단으로 올라가 지붕으로 도망치려고' },
      { key: 'E', textEn: 'By sneaking out a side door to the street', textKo: '옆문으로 나가 길가로 나가려고' },
    ],
    correctKey: 'C',
  },
  {
    id: 20,
    questionEn: 'What happens to Dr. Tweed when he tries to escape?',
    questionKo: '도망치려던 트위드 박사에게 결국 어떤 일이 일어나나요?',
    options: [
      { key: 'A', textEn: 'He gets away in a taxi', textKo: '택시를 타고 도망간다' },
      { key: 'B', textEn: 'He hides in the restroom', textKo: '화장실에 숨는다' },
      { key: 'C', textEn: 'He falls into the goldfish pond and gets soaked', textKo: '금붕어 연못에 빠져 온몸이 흠뻑 젖는다' },
      { key: 'D', textEn: 'He disappears in the crowd', textKo: '사람들 속으로 숨어 사라진다' },
      { key: 'E', textEn: 'He climbs a tree and escapes', textKo: '나무를 타고 올라가서 도망친다' },
    ],
    correctKey: 'C',
  },
];

export default function MummyQuizPage() {
  const [answers, setAnswers] = useState<Record<number, ChoiceKey | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [langMode, setLangMode] = useState<LanguageMode>('both');

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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Missing Mummy</h1>
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
                      ❌ 오답이에요. 정답은 <strong>{correctOption.key}</strong>번 ({correctOption.textEn} / {correctOption.textKo}) 입니다.
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
