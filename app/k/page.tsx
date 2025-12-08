// app/k/page.tsx
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

const QUESTIONS: Question[] = [
  {
    id: 1,
    questionEn: 'At the beginning of the story, what school subject is Dink working on?',
    questionKo: '이야기의 처음에서 딩크가 풀고 있던 과목은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Science', textKo: '과학' },
      { key: 'B', textEn: 'Reading', textKo: '읽기' },
      { key: 'C', textEn: 'Math', textKo: '수학' },
      { key: 'D', textEn: 'History', textKo: '사회(역사)' },
      { key: 'E', textEn: 'Art', textKo: '미술' },
    ],
    correctKey: 'C',
  },
  {
    id: 2,
    questionEn: 'What does D.E.A.R. time stand for in Mrs. Eagle’s class?',
    questionKo: '이글 선생님 반에서 D.E.A.R. 시간은 무엇의 약자인가요?',
    options: [
      { key: 'A', textEn: 'Do Everything And Rest', textKo: '모든 걸 하고 쉬기' },
      {
        key: 'B',
        textEn: 'Drop Everything And Read',
        textKo: '하던 것을 멈추고 책 읽기',
      },
      { key: 'C', textEn: 'Don’t Eat And Run', textKo: '먹지 말고 뛰기' },
      {
        key: 'D',
        textEn: 'Draw Everything And Relax',
        textKo: '그림 그리고 쉬기',
      },
      { key: 'E', textEn: 'Do Exercises And Run', textKo: '운동하고 뛰기' },
    ],
    correctKey: 'B',
  },
  {
    id: 3,
    questionEn: 'Which book is Dink reading during D.E.A.R. time?',
    questionKo: 'D.E.A.R. 시간에 딩크가 읽고 있던 책은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Treasure Island', textKo: 'Treasure Island' },
      { key: 'B', textEn: 'The Kidnapped King', textKo: 'The Kidnapped King' },
      { key: 'C', textEn: 'Kidnapped', textKo: 'Kidnapped' },
      { key: 'D', textEn: 'The Lost Island', textKo: 'The Lost Island' },
      { key: 'E', textEn: 'The Secret Prince', textKo: 'The Secret Prince' },
    ],
    correctKey: 'C',
  },
  {
    id: 4,
    questionEn: 'Who calls Dink to the principal’s office?',
    questionKo: '누가 딩크를 교장실로 부르나요?',
    options: [
      { key: 'A', textEn: 'Mr. Dillon', textKo: '딜런 교장 선생님' },
      { key: 'B', textEn: 'Mrs. Waters', textKo: '워터스 비서 선생님' },
      { key: 'C', textEn: 'Mrs. Eagle', textKo: '이글 선생님' },
      { key: 'D', textEn: 'Josh', textKo: '조쉬' },
      { key: 'E', textEn: 'Ruth Rose', textKo: '루스 로즈' },
    ],
    correctKey: 'C',
  },
  {
    id: 5,
    questionEn: 'What is Dink’s full name?',
    questionKo: '딩크의 전체 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'David D. Duncan', textKo: 'David D. Duncan' },
      { key: 'B', textEn: 'Donald D. Duncan', textKo: 'Donald D. Duncan' },
      { key: 'C', textEn: 'Daniel D. Duncan', textKo: 'Daniel D. Duncan' },
      { key: 'D', textEn: 'Donny D. Duncan', textKo: 'Donny D. Duncan' },
      { key: 'E', textEn: 'Douglas D. Duncan', textKo: 'Douglas D. Duncan' },
    ],
    correctKey: 'B',
  },
  {
    id: 6,
    questionEn: 'Where is Sammy Ben-Oz from?',
    questionKo: '새미 벤-오즈는 어디 출신인가요?',
    options: [
      { key: 'A', textEn: 'A country in Europe', textKo: '유럽의 한 나라' },
      {
        key: 'B',
        textEn: 'A big city in America',
        textKo: '미국의 큰 도시',
      },
      {
        key: 'C',
        textEn: 'A small island country in the Indian Ocean',
        textKo: '인도양에 있는 작은 섬나라',
      },
      { key: 'D', textEn: 'A village in Africa', textKo: '아프리카의 한 마을' },
      { key: 'E', textEn: 'A desert country in Asia', textKo: '아시아의 사막 국가' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'Why are Sammy’s parents sending him to the United States?',
    questionKo: '왜 새미의 부모님은 새미를 미국으로 보내나요?',
    options: [
      { key: 'A', textEn: 'To learn to swim', textKo: '수영을 배우라고' },
      {
        key: 'B',
        textEn: 'To learn American customs and improve his English',
        textKo: '미국의 문화를 배우고 영어를 더 잘하게 하려고',
      },
      {
        key: 'C',
        textEn: 'To learn to play football',
        textKo: '미식축구를 배우라고',
      },
      {
        key: 'D',
        textEn: 'To visit famous cities',
        textKo: '유명한 도시들을 구경하라고',
      },
      { key: 'E', textEn: 'To go to college', textKo: '대학교에 가라고' },
    ],
    correctKey: 'B',
  },
  {
    id: 8,
    questionEn: 'Where will Sammy stay at first while he is in Green Lawn?',
    questionKo: '그린론에 처음 왔을 때 새미는 어디에서 지내게 되나요?',
    options: [
      {
        key: 'A',
        textEn: 'At the hotel with Ms. Klinker',
        textKo: '호텔에서 클링커 선생님과 함께',
      },
      { key: 'B', textEn: 'At Josh’s house', textKo: '조쉬의 집' },
      { key: 'C', textEn: 'At Ruth Rose’s house', textKo: '루스 로즈의 집' },
      { key: 'D', textEn: 'At Dink’s house', textKo: '딩크의 집' },
      { key: 'E', textEn: 'At Mr. Dillon’s house', textKo: '딜런 교장 선생님의 집' },
    ],
    correctKey: 'D',
  },
  {
    id: 9,
    questionEn: 'What kind of animal is Loretta?',
    questionKo: '로레타는 어떤 동물인가요?',
    options: [
      { key: 'A', textEn: 'A cat', textKo: '고양이' },
      { key: 'B', textEn: 'A dog', textKo: '개' },
      { key: 'C', textEn: 'A hamster', textKo: '햄스터' },
      { key: 'D', textEn: 'A guinea pig', textKo: '기니피그' },
      { key: 'E', textEn: 'A rabbit', textKo: '토끼' },
    ],
    correctKey: 'D',
  },
  {
    id: 10,
    questionEn: 'Why does Sammy jump onto a chair when Pal (Josh’s dog) comes in?',
    questionKo: '왜 새미는 팔(조쉬의 개)이 들어오자 의자 위로 뛰어오르나요?',
    options: [
      { key: 'A', textEn: 'He is scared of big dogs', textKo: '큰 개가 무서워서' },
      { key: 'B', textEn: 'He is allergic', textKo: '알레르기가 있어서' },
      {
        key: 'C',
        textEn: 'He thinks Pal is dangerous',
        textKo: '팔이 위험하다고 생각해서',
      },
      { key: 'D', textEn: 'He doesn’t like animals', textKo: '동물을 싫어해서' },
      { key: 'E', textEn: 'He wants to play a game', textKo: '장난치고 싶어서' },
    ],
    correctKey: 'B',
  },
  {
    id: 11,
    questionEn: 'What special object does Sammy take apart in his room?',
    questionKo: '새미가 자기 방에서 분해한 특별한 물건은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A flashlight', textKo: '손전등' },
      { key: 'B', textEn: 'A toy robot', textKo: '로봇 장난감' },
      { key: 'C', textEn: 'A pair of glasses', textKo: '안경' },
      { key: 'D', textEn: 'A kaleidoscope', textKo: '만화경' },
      { key: 'E', textEn: 'A music box', textKo: '뮤직 박스' },
    ],
    correctKey: 'D',
  },
  {
    id: 12,
    questionEn: 'What color of glass is missing from the piles by Sammy’s kaleidoscope?',
    questionKo: '새미의 만화경 옆에 쌓여 있던 유리 조각 중, 어떤 색이 빠져 있었나요?',
    options: [
      { key: 'A', textEn: 'Red', textKo: '빨간색' },
      { key: 'B', textEn: 'Blue', textKo: '파란색' },
      { key: 'C', textEn: 'Green', textKo: '초록색' },
      { key: 'D', textEn: 'Yellow', textKo: '노란색' },
      { key: 'E', textEn: 'Purple', textKo: '보라색' },
    ],
    correctKey: 'D',
  },
  {
    id: 13,
    questionEn: 'Where does Ron Pankowski find a gold tassel?',
    questionKo: '론 판코스키는 금빛 술 장식을 어디에서 발견하나요?',
    options: [
      { key: 'A', textEn: 'In Dink’s front yard', textKo: '딩크 집 마당에서' },
      { key: 'B', textEn: 'In the school hallway', textKo: '학교 복도에서' },
      {
        key: 'C',
        textEn: 'Near the river by his bait shop',
        textKo: '강가에 있는 자기 미끼 가게 근처에서',
      },
      { key: 'D', textEn: 'At the hotel', textKo: '호텔에서' },
      { key: 'E', textEn: 'Inside the classroom', textKo: '교실 안에서' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'What do the kids first think the kidnappers used to take Sammy away?',
    questionKo: '아이들은 처음에 유괴범들이 새미를 어떻게 데려갔다고 생각하나요?',
    options: [
      { key: 'A', textEn: 'A train', textKo: '기차로' },
      { key: 'B', textEn: 'An airplane', textKo: '비행기로' },
      { key: 'C', textEn: 'A bicycle', textKo: '자전거로' },
      { key: 'D', textEn: 'A rowboat', textKo: '노 젓는 보트(조각배)로' },
      { key: 'E', textEn: 'A taxi', textKo: '택시로' },
    ],
    correctKey: 'D',
  },
  {
    id: 15,
    questionEn: 'Why does Dink suddenly think of the French word for “yellow”?',
    questionKo: '왜 딩크는 갑자기 프랑스어로 ‘노란색’이라는 단어를 떠올리나요?',
    options: [
      { key: 'A', textEn: 'He sees a yellow car outside', textKo: '밖에서 노란 자동차를 봐서' },
      {
        key: 'B',
        textEn: 'He is doing French homework',
        textKo: '프랑스어 숙제를 하고 있어서',
      },
      {
        key: 'C',
        textEn: 'The Jell-O makes him think of “yellow” and then of the French lesson',
        textKo: '젤리가 ‘옐로우(노랑)’을 떠올리게 하고, 그 다음 프랑스어 수업이 떠올라서',
      },
      { key: 'D', textEn: 'Ruth Rose tells him the word', textKo: '루스 로즈가 말해줘서' },
      { key: 'E', textEn: 'Officer Fallon says it', textKo: '패런 형사가 알려줘서' },
    ],
    correctKey: 'C',
  },
  {
    id: 16,
    questionEn: 'What is Dink’s idea about the yellow glass trail?',
    questionKo: '노란 유리 조각 길에 대해 딩크가 한 생각은 무엇인가요?',
    options: [
      {
        key: 'A',
        textEn: 'Sammy chose yellow because it was his favorite color',
        textKo: '노란색은 새미가 가장 좋아하는 색이라서',
      },
      {
        key: 'B',
        textEn: 'Yellow glass was the easiest to see at night',
        textKo: '노란색이 밤에 가장 잘 보이니까',
      },
      {
        key: 'C',
        textEn: 'Sammy accidentally dropped only yellow glass',
        textKo: '새미가 우연히 노란색만 떨어뜨렸으니까',
      },
      {
        key: 'D',
        textEn: 'Sammy used yellow to point to Joan, because “jaune” (yellow in French) sounds like “Joan”',
        textKo:
          '프랑스어로 ‘노랑(jaune)’이 ‘조운(조안, Joan)’과 비슷해서, 새미가 조운 선생님을 가리키려고 노란색을 골랐다고',
      },
      {
        key: 'E',
        textEn: 'Yellow meant “danger” in his country',
        textKo: '새미 나라에서 노란색은 ‘위험’이라는 뜻이라서',
      },
    ],
    correctKey: 'D',
  },
  {
    id: 17,
    questionEn: 'Where do the kids find a piece of yellow glass stuck to gum on a shoe?',
    questionKo: '껌에 붙어 있던 노란 유리 조각은 누구의 신발에서 발견되나요?',
    options: [
      { key: 'A', textEn: 'On Dink’s shoe', textKo: '딩크의 신발' },
      { key: 'B', textEn: 'On Josh’s shoe', textKo: '조쉬의 신발' },
      { key: 'C', textEn: 'On Ruth Rose’s shoe', textKo: '루스 로즈의 신발' },
      { key: 'D', textEn: 'On Officer Fallon’s shoe', textKo: '패런 형사의 신발' },
      { key: 'E', textEn: 'On Mr. Linkletter’s shoe', textKo: '링클레터 씨의 신발' },
    ],
    correctKey: 'E',
  },
  {
    id: 18,
    questionEn: 'Where is Sammy finally found?',
    questionKo: '새미는 결국 어디에서 발견되나요?',
    options: [
      { key: 'A', textEn: 'In Joan Klinker’s car', textKo: '조운 클링커의 차 안' },
      { key: 'B', textEn: 'In the hotel lobby', textKo: '호텔 로비' },
      {
        key: 'C',
        textEn: 'Inside a laundry cart under sheets and towels',
        textKo: '시트와 수건 아래에 숨겨진 세탁 수레(카트) 안',
      },
      { key: 'D', textEn: 'In the bait shop', textKo: '미끼 가게 안' },
      { key: 'E', textEn: 'In the school gym', textKo: '학교 체육관' },
    ],
    correctKey: 'C',
  },
  {
    id: 19,
    questionEn: 'Who is secretly working together to kidnap Sammy?',
    questionKo: '새미를 유괴하기 위해 몰래 함께 일한 사람들은 누구인가요?',
    options: [
      {
        key: 'A',
        textEn: 'Mr. Dillon and Mrs. Eagle',
        textKo: '딜런 교장 선생님과 이글 선생님',
      },
      {
        key: 'B',
        textEn: 'Ron Pankowski and Mr. Linkletter',
        textKo: '론 판코스키와 링클레터 씨',
      },
      {
        key: 'C',
        textEn: 'Dink’s mom and Mrs. Waters',
        textKo: '딩크 엄마와 워터스 비서 선생님',
      },
      {
        key: 'D',
        textEn: 'Joan Klinker and her husband',
        textKo: '조운 클링커와 그녀의 남편',
      },
      { key: 'E', textEn: 'Ellie and Officer Fallon', textKo: '엘리와 패런 형사' },
    ],
    correctKey: 'D',
  },
  {
    id: 20,
    questionEn: 'What gift does Sammy send to Pal at the end of the story?',
    questionKo: '이야기 마지막에 새미가 팔에게 보내 준 선물은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A golden collar', textKo: '금빛 목걸이(목줄)' },
      { key: 'B', textEn: 'A blue leash', textKo: '파란색 목줄' },
      {
        key: 'C',
        textEn: 'A purple velvet doggy sweater with “Good Dog” stitched in gold',
        textKo: '‘Good Dog’라는 글자가 금색으로 수놓인 보라색 벨벳 강아지 스웨터',
      },
      { key: 'D', textEn: 'A new bone', textKo: '새 뼈다귀' },
      { key: 'E', textEn: 'A bag of dog treats', textKo: '강아지 간식 봉지' },
    ],
    correctKey: 'C',
  },
];

type LanguageMode = 'both' | 'en' | 'ko';

export default function HomePage() {
  const [answers, setAnswers] = useState<Record<number, ChoiceKey | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [langMode, setLangMode] = useState<LanguageMode>('both');

  const handleSelect = (questionId: number, key: ChoiceKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: key,
    }));
    if (isSubmitted) {
      // 답을 바꿀 때는 다시 채점하기 전까지 상태 초기화
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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Kidnapped King</h1>
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
                      ❌ 오답이에요. 정답은 <strong>{correctOption.key}</strong>번 ({correctOption.textEn}
                      {' / '}
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
