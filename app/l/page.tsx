// app/l/page.tsx
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
    questionEn: 'At the very beginning of the story, what are Dink, Josh, and Ruth Rose doing?',
    questionKo: '이야기의 맨 처음에 딩크, 조시, 루스 로즈는 무엇을 하고 있나요?',
    options: [
      { key: 'A', textEn: 'Building a snowman', textKo: '눈사람을 만들고 있다' },
      { key: 'B', textEn: 'Having a snowball fight', textKo: '눈싸움을 하고 있다' },
      { key: 'C', textEn: 'Decorating a Christmas tree', textKo: '크리스마스트리를 장식하고 있다' },
      { key: 'D', textEn: 'Walking Pal in the park', textKo: '팰을 산책시키고 있다' },
      { key: 'E', textEn: 'Sledding down a hill', textKo: '언덕에서 썰매를 타고 있다' },
    ],
    correctKey: 'B',
  },
  {
    id: 2,
    questionEn: 'During the snowball fight, who is on Dink’s side?',
    questionKo: '눈싸움에서 딩크 팀에 있는 사람들은 누구인가요?',
    options: [
      { key: 'A', textEn: 'Josh and Pal', textKo: '조시와 팰' },
      { key: 'B', textEn: 'Ruth Rose and Lucky', textKo: '루스 로즈와 럭키' },
      { key: 'C', textEn: 'Ruth Rose and Nate', textKo: '루스 로즈와 네이트' },
      { key: 'D', textEn: 'Ben and Josephine', textKo: '벤과 조제핀' },
      { key: 'E', textEn: 'Hector and Zelda', textKo: '헥터와 젤다' },
    ],
    correctKey: 'C',
  },
  {
    id: 3,
    questionEn: 'Why do Ben and Josephine come to Dink’s house?',
    questionKo: '벤과 조제핀이 딩크 집에 온 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'To invite him to a party', textKo: '그를 파티에 초대하려고' },
      { key: 'B', textEn: 'To return his homework', textKo: '숙제를 돌려주려고' },
      { key: 'C', textEn: 'To bring him a Christmas present', textKo: '크리스마스 선물을 가져오려고' },
      { key: 'D', textEn: 'To bring an urgent message from Lucky', textKo: '럭키의 급한 메시지를 전하려고' },
      { key: 'E', textEn: 'To ask him to walk their dog', textKo: '개 산책을 부탁하려고' },
    ],
    correctKey: 'D',
  },
  {
    id: 4,
    questionEn: 'What special gift does Lucky’s grandfather send every Christmas?',
    questionKo: '럭키의 할아버지는 매년 크리스마스에 어떤 특별한 선물을 보내시나요?',
    options: [
      { key: 'A', textEn: 'A box of cookies', textKo: '쿠키 상자' },
      { key: 'B', textEn: 'A new toy', textKo: '새 장난감' },
      { key: 'C', textEn: 'A Christmas card with seven lottery tickets', textKo: '복권 7장이 들어 있는 크리스마스 카드' },
      { key: 'D', textEn: 'A pair of mittens', textKo: '털장갑 한 켤레' },
      { key: 'E', textEn: 'A book of Christmas stories', textKo: '크리스마스 이야기 책' },
    ],
    correctKey: 'C',
  },
  {
    id: 5,
    questionEn: 'Why is this year’s lottery ticket so important?',
    questionKo: '올해의 복권이 특히 중요한 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'It is Lucky’s first lottery ticket ever', textKo: '럭키가 받은 첫 번째 복권이기 때문에' },
      { key: 'B', textEn: 'The winning numbers are Hector’s birthday', textKo: '당첨 번호가 헥터의 생일이기 때문에' },
      { key: 'C', textEn: 'The ticket is worth seven million dollars', textKo: '복권이 700만 달러짜리 당첨권이기 때문에' },
      { key: 'D', textEn: 'It is the last ticket Hector will ever buy', textKo: '헥터가 마지막으로 산 복권이기 때문에' },
      { key: 'E', textEn: 'It was bought on Christmas Day', textKo: '크리스마스 당일에 산 복권이기 때문에' },
    ],
    correctKey: 'C',
  },
  {
    id: 6,
    questionEn: 'How does the burglar probably learn that one of the tickets is a big winner?',
    questionKo: '도둑은 어떻게 그 복권이 큰 당첨권이라는 것을 알았을 것이라고 아이들은 추측하나요?',
    options: [
      { key: 'A', textEn: 'By reading Hector’s letter', textKo: '헥터의 편지를 읽어서' },
      { key: 'B', textEn: 'By overhearing Lucky on the phone', textKo: '럭키의 전화 통화를 엿들어서' },
      { key: 'C', textEn: 'By watching the winning numbers on TV', textKo: '텔레비전에서 당첨 번호를 보고' },
      { key: 'D', textEn: 'By following the kids to the supermarket', textKo: '아이들을 따라 슈퍼마켓에 가서' },
      { key: 'E', textEn: 'By opening Hector’s wallet', textKo: '헥터의 지갑을 열어 봐서' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'How does the thief get into Lucky’s house?',
    questionKo: '도둑은 럭키의 집에 어떻게 들어갔나요?',
    options: [
      { key: 'A', textEn: 'Through a broken window', textKo: '깨진 창문으로' },
      { key: 'B', textEn: 'Down the chimney', textKo: '굴뚝으로' },
      { key: 'C', textEn: 'Through the unlocked back door', textKo: '잠겨 있지 않은 뒷문으로' },
      { key: 'D', textEn: 'With a stolen key', textKo: '훔친 열쇠로' },
      { key: 'E', textEn: 'Through the basement', textKo: '지하실을 통해' },
    ],
    correctKey: 'C',
  },
  {
    id: 8,
    questionEn: 'What important clue do the kids find in the snow near the back of Lucky’s house?',
    questionKo: '럭키 집 뒤쪽 눈 속에서 아이들이 발견한 중요한 단서는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A glove', textKo: '장갑 한 짝' },
      { key: 'B', textEn: 'A wallet', textKo: '지갑' },
      { key: 'C', textEn: 'A ski mask', textKo: '스키 마스크' },
      { key: 'D', textEn: 'A tinfoil bow tie', textKo: '은박 나비넥타이 모양 조각' },
      { key: 'E', textEn: 'A lottery ticket', textKo: '복권 한 장' },
    ],
    correctKey: 'D',
  },
  {
    id: 9,
    questionEn: 'Where do the kids go to warm up and drink hot chocolate while they plan?',
    questionKo: '아이들이 몸을 녹이고 계획을 세우면서 핫초코를 마신 곳은 어디인가요?',
    options: [
      { key: 'A', textEn: 'The Atrium', textKo: '에이트리엄' },
      { key: 'B', textEn: 'Lucky’s kitchen', textKo: '럭키의 주방' },
      { key: 'C', textEn: 'Ellie’s Diner', textKo: '엘리의 식당(다이너)' },
      { key: 'D', textEn: 'The fitness center', textKo: '피트니스 센터' },
      { key: 'E', textEn: 'The supermarket café', textKo: '슈퍼마켓 카페' },
    ],
    correctKey: 'C',
  },
  {
    id: 10,
    questionEn: 'Where does Hector O’Leary, Lucky’s grandfather, live?',
    questionKo: '럭키의 할아버지 헥터 오리어리는 어디에 살고 있나요?',
    options: [
      { key: 'A', textEn: 'In a cabin in the woods', textKo: '숲 속 오두막' },
      { key: 'B', textEn: 'In Lucky’s house', textKo: '럭키의 집' },
      { key: 'C', textEn: 'In a hotel', textKo: '호텔' },
      { key: 'D', textEn: 'In the Atrium elderly housing building', textKo: '에이트리엄이라는 노인 주택' },
      { key: 'E', textEn: 'In a farm outside town', textKo: '마을 밖 농장' },
    ],
    correctKey: 'D',
  },
  {
    id: 11,
    questionEn: 'What is special about the atrium inside the elderly housing building?',
    questionKo: '노인 주택 안에 있는 에이트리엄(중정)의 특징은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'It is full of Christmas trees', textKo: '크리스마스트리로 가득 차 있다' },
      { key: 'B', textEn: 'It has a swimming pool', textKo: '수영장이 있다' },
      { key: 'C', textEn: 'It is filled with plants and parakeets', textKo: '식물과 잉꼬들로 가득하다' },
      { key: 'D', textEn: 'It is used as a library', textKo: '도서관으로 사용된다' },
      { key: 'E', textEn: 'It is a place for ice skating', textKo: '아이스스케이트장이다' },
    ],
    correctKey: 'C',
  },
  {
    id: 12,
    questionEn: 'What is the name of the parakeet that loves shiny things?',
    questionKo: '반짝이는 물건을 좋아하는 잉꼬의 이름은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'Greenie', textKo: '그리니' },
      { key: 'B', textEn: 'Blue Boy', textKo: '블루 보이' },
      { key: 'C', textEn: 'Sunny', textKo: '써니' },
      { key: 'D', textEn: 'Skipper', textKo: '스키퍼' },
      { key: 'E', textEn: 'Lucky Bird', textKo: '럭키 버드' },
    ],
    correctKey: 'B',
  },
  {
    id: 13,
    questionEn: 'Who is Zelda Zoot?',
    questionKo: '젤다 주트는 누구인가요?',
    options: [
      { key: 'A', textEn: 'The supermarket manager', textKo: '슈퍼마켓 매니저' },
      { key: 'B', textEn: 'The lottery clerk', textKo: '복권 카운터 직원' },
      {
        key: 'C',
        textEn: 'A nosy woman at the Atrium who steals cookies',
        textKo: '에이트리엄에 사는, 남의 일을 캐고 쿠키를 훔쳐 먹는 할머니',
      },
      { key: 'D', textEn: 'Lucky’s mother', textKo: '럭키의 엄마' },
      { key: 'E', textEn: 'A teacher at the kids’ school', textKo: '아이들 학교의 선생님' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'Where did Hector buy the seven lottery tickets?',
    questionKo: '헥터는 복권 7장을 어디에서 샀나요?',
    options: [
      { key: 'A', textEn: 'At a gas station', textKo: '주유소' },
      { key: 'B', textEn: 'At a small kiosk on the street', textKo: '길가의 작은 키오스크' },
      { key: 'C', textEn: 'At the fitness center', textKo: '피트니스 센터' },
      { key: 'D', textEn: 'At the supermarket lottery counter', textKo: '슈퍼마켓 복권 카운터' },
      { key: 'E', textEn: 'At Ellie’s Diner', textKo: '엘리의 식당' },
    ],
    correctKey: 'D',
  },
  {
    id: 15,
    questionEn: 'What information does Dorothy (“Dot”) first tell the kids about a possible suspect?',
    questionKo: '도로시(“닷”)는 처음에 아이들에게 어떤 용의자 정보를 알려 주나요?',
    options: [
      { key: 'A', textEn: 'His name is Sam and he is a mailman', textKo: '이름은 샘이고 우편배달부라고 했다' },
      { key: 'B', textEn: 'His name is Joe and he wore a bowling shirt', textKo: '이름은 조이고 볼링 셔츠를 입고 있었다고 했다' },
      { key: 'C', textEn: 'His name is Mike and he works at Ellie’s', textKo: '이름은 마이크이고 엘리 식당에서 일한다고 했다' },
      { key: 'D', textEn: 'His name is Tom and he lives at the Atrium', textKo: '이름은 톰이고 에이트리엄에 산다고 했다' },
      { key: 'E', textEn: 'His name is George and he owns a dog', textKo: '이름은 조지이고 개를 키운다고 했다' },
    ],
    correctKey: 'B',
  },
  {
    id: 16,
    questionEn: 'What do the kids discover when they show Josh’s drawing at the bowling alley?',
    questionKo: '아이들이 볼링장에서 조시의 그림을 보여 주었을 때 무엇을 알아내나요?',
    options: [
      { key: 'A', textEn: 'The man in the picture is Hector', textKo: '그림 속 남자는 헥터다' },
      { key: 'B', textEn: 'The man in the picture is Officer Fallon', textKo: '그림 속 남자는 폴런 경관이다' },
      { key: 'C', textEn: 'The drawing looks like Lucky', textKo: '그림이 럭키를 닮았다' },
      { key: 'D', textEn: 'The drawing looks like Josh, only older', textKo: '그림이 조시를 나이 든 모습으로 그린 것 같다' },
      { key: 'E', textEn: 'The drawing looks like Eric from the store', textKo: '그림이 가게 점원 에릭을 닮았다' },
    ],
    correctKey: 'D',
  },
  {
    id: 17,
    questionEn: 'What do the many tinfoil bow ties on the supermarket floor show the kids?',
    questionKo: '슈퍼마켓 바닥에 많은 은박 나비넥타이가 흩어져 있는 것을 보고 아이들은 무엇을 알게 되나요?',
    options: [
      { key: 'A', textEn: 'They are decorations for a party', textKo: '파티 장식이라는 것' },
      { key: 'B', textEn: 'Dot makes bow ties from tinfoil gum wrappers', textKo: '닷이 껌 포장지를 은박 나비넥타이 모양으로 접는다는 것' },
      { key: 'C', textEn: 'Hector drops bow ties wherever he goes', textKo: '헥터가 가는 곳마다 나비넥타이를 떨어뜨린다는 것' },
      { key: 'D', textEn: 'Pal likes to chew on tinfoil', textKo: '팰이 은박지를 씹는 것을 좋아한다는 것' },
      { key: 'E', textEn: 'The bow ties belong to Zelda Zoot', textKo: '그 나비넥타이들이 젤다 주트의 것이라는 것' },
    ],
    correctKey: 'B',
  },
  {
    id: 18,
    questionEn: 'What clever idea wakes Dink up early in the morning?',
    questionKo: '어떤 영리한 생각 때문에 딩크는 아침 일찍 깨어나나요?',
    options: [
      { key: 'A', textEn: 'To follow Dot to her house', textKo: '닷을 집까지 몰래 따라가야겠다고' },
      { key: 'B', textEn: 'To send a letter to Hector', textKo: '헥터에게 편지를 써야겠다고' },
      { key: 'C', textEn: 'To use fingerprints on the lottery ticket as proof', textKo: '복권에서 지문을 찾아 증거로 써야겠다고' },
      { key: 'D', textEn: 'To dig in the snow for the ticket', textKo: '눈 속을 파서 복권을 찾아야겠다고' },
      { key: 'E', textEn: 'To ask Ellie to hide Dot’s money', textKo: '엘리에게 닷의 돈을 숨겨 달라고 부탁해야겠다고' },
    ],
    correctKey: 'C',
  },
  {
    id: 19,
    questionEn: 'How do the kids travel to the lottery headquarters in Blue Hills?',
    questionKo: '아이들은 블루 힐스에 있는 복권 본부까지 어떻게 가나요?',
    options: [
      { key: 'A', textEn: 'By car', textKo: '자동차로' },
      { key: 'B', textEn: 'By bus', textKo: '버스로' },
      { key: 'C', textEn: 'On bicycles', textKo: '자전거로' },
      { key: 'D', textEn: 'On cross-country skis', textKo: '크로스컨트리 스키를 타고' },
      { key: 'E', textEn: 'On a sled pulled by Pal', textKo: '팰이 끄는 썰매를 타고' },
    ],
    correctKey: 'D',
  },
  {
    id: 20,
    questionEn: 'How is Dot disguised when she tries to cash in the winning ticket?',
    questionKo: '닷이 당첨 복권을 현금으로 바꾸려고 할 때 어떤 변장을 하고 있었나요?',
    options: [
      { key: 'A', textEn: 'As an old woman with glasses', textKo: '안경 쓴 할머니로' },
      { key: 'B', textEn: 'As a police officer', textKo: '경찰관으로' },
      { key: 'C', textEn: 'As a man with a wig and fake mustache', textKo: '가발과 가짜 콧수염을 한 남자로' },
      { key: 'D', textEn: 'As a supermarket manager', textKo: '슈퍼마켓 매니저로' },
      { key: 'E', textEn: 'As a delivery worker with boxes', textKo: '상자를 든 배달원으로' },
    ],
    correctKey: 'C',
  },
];

export default function LotteryQuizPage() {
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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Lucky Lottery</h1>
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
