// app/p/page.tsx
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
    questionEn: 'Why did Ruth Rose bring her dad’s camcorder to Panda Park?',
    questionKo: '루스 로즈가 판다 공원에 아빠의 캠코더를 가져간 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'To film her brother Nate', textKo: '동생 네이트를 촬영하려고' },
      { key: 'B', textEn: 'To record Officer Fallon’s speech', textKo: '팔런 경찰관의 연설을 찍으려고' },
      { key: 'C', textEn: 'To get the pandas on videotape', textKo: '판다들을 비디오로 촬영하려고' },
      { key: 'D', textEn: 'To make a dinosaur movie', textKo: '공룡 영화를 만들려고' },
      { key: 'E', textEn: 'To film the fitness center', textKo: '피트니스 센터를 찍으려고' },
    ],
    correctKey: 'C',
  },
  {
    id: 2,
    questionEn: 'What was special about Ruth Rose’s clothes that day?',
    questionKo: '그날 루스 로즈의 옷차림은 어떤 점이 특별했나요?',
    options: [
      {
        key: 'A',
        textEn: 'She wore all sky blue from head to toe',
        textKo: '머리부터 발끝까지 하늘색 한 가지 색만 입었다',
      },
      { key: 'B', textEn: 'She wore a panda costume', textKo: '판다 의상을 입었다' },
      { key: 'C', textEn: 'She wore her school uniform', textKo: '학교 교복을 입었다' },
      { key: 'D', textEn: 'She wore black and white like a panda', textKo: '판다처럼 검은색과 흰색만 입었다' },
      { key: 'E', textEn: 'She wore Flip’s fitness shirt', textKo: '플립이 입는 피트니스 티셔츠를 입었다' },
    ],
    correctKey: 'A',
  },
  {
    id: 3,
    questionEn: 'Who gave the money that made Panda Park possible?',
    questionKo: '판다 공원을 만들 수 있도록 돈을 기부한 사람은 누구의 돈이었나요?',
    options: [
      { key: 'A', textEn: 'Tom Steele', textKo: '톰 스틸' },
      { key: 'B', textEn: 'Irene Napper', textKo: '아이린 내퍼' },
      { key: 'C', textEn: 'Officer Fallon', textKo: '팔런 경찰관' },
      { key: 'D', textEn: 'Winifred (Granny) Francis', textKo: '위니프레드(그래니) 프랜시스' },
      { key: 'E', textEn: 'Dr. Palio', textKo: '닥터 팔리오' },
    ],
    correctKey: 'D',
  },
  {
    id: 4,
    questionEn: 'What did Dink want to do for the Panda Paper?',
    questionKo: '딩크는 판다 페이퍼에서 무엇을 하고 싶어 했나요?',
    options: [
      { key: 'A', textEn: 'Sell it at school', textKo: '학교에서 신문을 팔고 싶었다' },
      { key: 'B', textEn: 'Draw cartoons about pandas', textKo: '판다 만화를 그리고 싶었다' },
      { key: 'C', textEn: 'Write a story about the baby panda', textKo: '아기 판다에 대한 기사를 쓰고 싶었다' },
      { key: 'D', textEn: 'Deliver it to all the houses', textKo: '집집마다 신문을 배달하고 싶었다' },
      { key: 'E', textEn: 'Stop the paper from printing', textKo: '신문 발행을 멈추게 하고 싶었다' },
    ],
    correctKey: 'C',
  },
  {
    id: 5,
    questionEn: 'What did Officer Fallon say the kidnappers wanted in the ransom note?',
    questionKo: '팔런 경찰관에 따르면 협박 편지에서 유괴범이 요구한 것은 무엇이었나요?',
    options: [
      { key: 'A', textEn: 'Ten thousand dollars and a car', textKo: '만 달러와 자동차' },
      { key: 'B', textEn: 'One million dollars by midnight', textKo: '자정까지 백만 달러' },
      { key: 'C', textEn: 'Two pandas instead of one', textKo: '판다 두 마리와의 교환' },
      { key: 'D', textEn: 'New fences for the petting zoo', textKo: '애완동물원의 새 우리' },
      { key: 'E', textEn: 'A free membership at the fitness center', textKo: '피트니스 센터 무료 회원권' },
    ],
    correctKey: 'B',
  },
  {
    id: 6,
    questionEn: 'Where were the kidnappers supposed to get the ransom money from, according to Officer Fallon?',
    questionKo: '팔런 경찰관은 몸값 돈을 어디에서 가져오려 한다고 말했나요?',
    options: [
      { key: 'A', textEn: 'From Tom Steele’s office', textKo: '톰 스틸의 사무실에서' },
      { key: 'B', textEn: 'From ticket sales at the petting zoo', textKo: '애완동물원 입장료에서' },
      {
        key: 'C',
        textEn: 'From the money Winifred Francis left to Green Lawn',
        textKo: '위니프레드 프랜시스가 그린론에 남긴 돈에서',
      },
      { key: 'D', textEn: 'From the police station’s safe', textKo: '경찰서 금고에서' },
      { key: 'E', textEn: 'From Irene’s savings', textKo: '아이린의 저금에서' },
    ],
    correctKey: 'C',
  },
  {
    id: 7,
    questionEn: 'What important clue did Pal the dog find near the bamboo?',
    questionKo: '개 팔이 대나무 근처에서 찾아낸 중요한 단서는 무엇이었나요?',
    options: [
      { key: 'A', textEn: 'A pair of gloves', textKo: '장갑 한 켤레' },
      { key: 'B', textEn: 'A broken alarm clock', textKo: '고장 난 알람시계' },
      { key: 'C', textEn: 'A fishing knife with a cork handle', textKo: '코르크 손잡이가 달린 낚시칼' },
      { key: 'D', textEn: 'A piece of bamboo with Winnie’s name on it', textKo: '“위니”라고 적힌 대나무 조각' },
      { key: 'E', textEn: 'A panda paw print in the mud', textKo: '진흙 위의 판다 발자국' },
    ],
    correctKey: 'C',
  },
  {
    id: 8,
    questionEn: 'What did the kids discover when they watched Ruth Rose’s video of Ping at Panda Park?',
    questionKo: '루스 로즈가 찍은 영상을 다시 보았을 때, 아이들은 핑에 대해 무엇을 알아냈나요?',
    options: [
      { key: 'A', textEn: 'Ping was afraid of water', textKo: '핑은 물을 무서워했다' },
      {
        key: 'B',
        textEn: 'Ping was looking toward the microphone area',
        textKo: '핑은 마이크가 있는 쪽을 바라보고 있었다',
      },
      { key: 'C', textEn: 'Ping was smiling at the crowd', textKo: '핑은 관중을 향해 웃고 있었다' },
      { key: 'D', textEn: 'Ping was trying to escape from her cave', textKo: '핑은 동굴에서 도망치려고 했다' },
      { key: 'E', textEn: 'Ping was eating bamboo the whole time', textKo: '핑은 내내 대나무만 먹고 있었다' },
    ],
    correctKey: 'B',
  },
  {
    id: 9,
    questionEn: 'Which three people were standing near the microphone during the ceremony?',
    questionKo: '행사 때 마이크 근처에 서 있던 세 사람은 누구였나요?',
    options: [
      { key: 'A', textEn: 'Officer Fallon, Jimmy, and Irene', textKo: '팔런 경찰관, 지미, 아이린' },
      { key: 'B', textEn: 'Flip Francis, Jimmy, and Nate', textKo: '플립 프랜시스, 지미, 네이트' },
      { key: 'C', textEn: 'Tom Steele, Irene Napper, and Flip Francis', textKo: '톰 스틸, 아이린 내퍼, 플립 프랜시스' },
      { key: 'D', textEn: 'Dink, Josh, and Ruth Rose', textKo: '딩크, 조시, 루스 로즈' },
      { key: 'E', textEn: 'Winifred Francis, Irene, and Tom', textKo: '위니프레드 프랜시스, 아이린, 톰' },
    ],
    correctKey: 'C',
  },
  {
    id: 10,
    questionEn: 'According to Irene Napper, how many people had keys to the panda enclosure gate?',
    questionKo: '아이린 내퍼가 말한 판다 우리 열쇠를 가진 사람은 몇 명이었나요?',
    options: [
      { key: 'A', textEn: 'Just Irene', textKo: '아이린 혼자' },
      { key: 'B', textEn: 'Irene and Officer Fallon', textKo: '아이린과 팔런 경찰관' },
      { key: 'C', textEn: 'Everyone who worked at the petting zoo', textKo: '애완동물원에서 일하는 모든 사람' },
      { key: 'D', textEn: 'Irene and Flip Francis', textKo: '아이린과 플립 프랜시스' },
      { key: 'E', textEn: 'Irene, Tom, and Flip', textKo: '아이린, 톰, 플립 세 사람' },
    ],
    correctKey: 'A',
  },
  {
    id: 11,
    questionEn:
      'Why did the kids say they were “writing a story for the Panda Paper” when they questioned Irene and Tom?',
    questionKo: '아이들이 아이린과 톰을 조사할 때 “판다 페이퍼에 실을 기사”를 쓴다고 한 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'They really worked for the newspaper', textKo: '실제로 신문사에서 일하기 때문에' },
      { key: 'B', textEn: 'They wanted free newspapers', textKo: '무료 신문을 받기 위해' },
      {
        key: 'C',
        textEn: 'They wanted to make the suspects feel important',
        textKo: '어른들이 기분이 좋아지게 하려고',
      },
      {
        key: 'D',
        textEn: 'They needed an excuse so the adults wouldn’t be suspicious',
        textKo: '어른들이 의심하지 않도록 핑계가 필요해서',
      },
      { key: 'E', textEn: 'They wanted to win a writing contest', textKo: '글짓기 대회에서 우승하려고' },
    ],
    correctKey: 'D',
  },
  {
    id: 12,
    questionEn: 'What detail in Tom Steele’s office made the kids connect him to the ransom note?',
    questionKo: '톰 스틸의 사무실에서 아이들이 협박 편지를 떠올리게 된 이유가 된 물건은 무엇인가요?',
    options: [
      { key: 'A', textEn: 'A stack of bamboo stalks in the corner', textKo: '구석에 쌓인 대나무' },
      {
        key: 'B',
        textEn: 'Newspapers with holes and scissors and glue on his desk',
        textKo: '책상 위의 구멍 뚫린 신문들과 가위, 풀',
      },
      { key: 'C', textEn: 'A secret map of Goose Island', textKo: '구스 아일랜드 비밀 지도' },
      { key: 'D', textEn: 'A photo of Winnie on the wall', textKo: '벽에 걸린 위니 사진' },
      { key: 'E', textEn: 'A box labeled “ransom letters”', textKo: '“몸값 편지”라고 쓰인 상자' },
    ],
    correctKey: 'B',
  },
  {
    id: 13,
    questionEn: 'Where did the kids meet Flip Francis to interview him?',
    questionKo: '아이들이 플립 프랜시스를 인터뷰한 장소는 어디였나요?',
    options: [
      { key: 'A', textEn: 'In the coal cellar', textKo: '석탄 저장고 안' },
      { key: 'B', textEn: 'At the police station', textKo: '경찰서' },
      { key: 'C', textEn: 'At the fitness center counter near the pool', textKo: '수영장 옆 피트니스 센터 카운터' },
      { key: 'D', textEn: 'Inside the panda enclosure', textKo: '판다 우리 안' },
      { key: 'E', textEn: 'At the Rose Garden', textKo: '장미 정원 안' },
    ],
    correctKey: 'C',
  },
  {
    id: 14,
    questionEn: 'Why did the kids think the fitness center might be a good place to hide Winnie?',
    questionKo: '아이들이 피트니스 센터가 위니를 숨기기 좋은 장소라고 생각한 이유는 무엇인가요?',
    options: [
      { key: 'A', textEn: 'It was far away from Panda Park', textKo: '판다 공원에서 아주 멀리 떨어져 있어서' },
      { key: 'B', textEn: 'It had many empty rooms and a big basement', textKo: '비어 있는 방과 큰 지하실이 많아서' },
      {
        key: 'C',
        textEn: 'It was already noisy and smelly, so a crying panda wouldn’t be noticed',
        textKo: '이미 시끄럽고 냄새도 나서 아기 판다 울음소리가 티 나지 않기 때문에',
      },
      { key: 'D', textEn: 'It belonged to Irene', textKo: '아이린이 그 건물 주인이기 때문에' },
      { key: 'E', textEn: 'It was always closed on Sundays', textKo: '일요일마다 항상 문을 닫기 때문에' },
    ],
    correctKey: 'C',
  },
  {
    id: 15,
    questionEn: 'How did the kids get into the dark stairway inside the fitness center?',
    questionKo: '아이들은 어떻게 해서 피트니스 센터 안의 어두운 계단으로 들어가게 되었나요?',
    options: [
      { key: 'A', textEn: 'Flip invited them in', textKo: '플립이 직접 안으로 초대해서' },
      {
        key: 'B',
        textEn: 'They followed Irene through a secret passage',
        textKo: '아이린을 따라 비밀 통로로 들어가서',
      },
      {
        key: 'C',
        textEn: 'They slipped through an unmarked door during Adult Swim',
        textKo: '어른 수영 시간 동안 표시 없는 문으로 살짝 들어가서',
      },
      { key: 'D', textEn: 'They broke a locked door', textKo: '자물쇠를 부수고 억지로 열어서' },
      { key: 'E', textEn: 'They came in from the bowling alley', textKo: '볼링장에서 올라와서' },
    ],
    correctKey: 'C',
  },
  {
    id: 16,
    questionEn: 'What was hidden under the floor mat at the end of the underground corridor?',
    questionKo: '지하 복도 끝에 있는 바닥 매트 아래에는 무엇이 숨겨져 있었나요?',
    options: [
      { key: 'A', textEn: 'A suitcase full of money', textKo: '돈이 가득 든 여행가방' },
      { key: 'B', textEn: 'A sleeping panda', textKo: '잠 자는 판다' },
      { key: 'C', textEn: 'A metal handle for a trapdoor', textKo: '바닥 문을 여는 금속 손잡이' },
      { key: 'D', textEn: 'A map of the coal cellar', textKo: '석탄 저장고 지도' },
      { key: 'E', textEn: 'Another ransom note', textKo: '또 다른 협박 편지' },
    ],
    correctKey: 'C',
  },
  {
    id: 17,
    questionEn: 'Where was Winnie actually being kept by the kidnapper?',
    questionKo: '위니는 실제로 어디에 감금되어 있었나요?',
    options: [
      { key: 'A', textEn: 'In Tom Steele’s office closet', textKo: '톰 스틸 사무실의 옷장 안' },
      { key: 'B', textEn: 'In Irene’s duck-feeding area', textKo: '아이린이 오리에게 먹이를 주는 곳' },
      {
        key: 'C',
        textEn: 'In an old coal cellar under the fitness center',
        textKo: '피트니스 센터 아래의 오래된 석탄 저장고',
      },
      { key: 'D', textEn: 'In the Book Nook bookstore', textKo: '북 누크 서점 안' },
      { key: 'E', textEn: 'In the hollow tree on Goose Island', textKo: '구스 아일랜드의 속이 빈 나무 안' },
    ],
    correctKey: 'C',
  },
  {
    id: 18,
    questionEn: 'How did the kids make an escape route from the coal cellar?',
    questionKo: '아이들은 석탄 저장고에서 어떻게 탈출구를 만들었나요?',
    options: [
      { key: 'A', textEn: 'They dug a tunnel with their hands', textKo: '손으로 땅을 파서 터널을 만들었다' },
      {
        key: 'B',
        textEn: 'They broke open a coal chute and built a pile of coal to climb up',
        textKo: '석탄 슈트를 부수고 석탄을 쌓아 올라갔다',
      },
      {
        key: 'C',
        textEn: 'They shouted until someone heard them',
        textKo: '계속 소리 질러서 누군가 들을 때까지 기다렸다',
      },
      { key: 'D', textEn: 'They picked the lock on the trapdoor', textKo: '바닥 문 자물쇠를 땄다' },
      { key: 'E', textEn: 'They used a hidden elevator', textKo: '숨겨진 엘리베이터를 사용했다' },
    ],
    correctKey: 'B',
  },
  {
    id: 19,
    questionEn: 'Who turned out to be Winnie’s kidnapper?',
    questionKo: '결국 위니를 납치한 범인은 누구였나요?',
    options: [
      { key: 'A', textEn: 'Irene Napper', textKo: '아이린 내퍼' },
      { key: 'B', textEn: 'Tom Steele', textKo: '톰 스틸' },
      { key: 'C', textEn: 'Officer Fallon', textKo: '팔런 경찰관' },
      { key: 'D', textEn: 'Flip Francis', textKo: '플립 프랜시스' },
      { key: 'E', textEn: 'Jimmy Fallon', textKo: '지미 펠런' },
    ],
    correctKey: 'D',
  },
  {
    id: 20,
    questionEn: 'What kind of community service did the kids suggest Flip could do instead of some jail time?',
    questionKo: '아이들은 플립이 일부 징역 대신 할 수 있는 봉사활동으로 무엇을 제안했나요?',
    options: [
      { key: 'A', textEn: 'Clean the coal cellar and the pool', textKo: '석탄 저장고와 수영장을 청소하게 하기' },
      {
        key: 'B',
        textEn: 'Teach free gymnastics to kids and help seniors exercise',
        textKo: '아이들에게 무료 체조를 가르치고, 노인들에게 운동을 도와주게 하기',
      },
      { key: 'C', textEn: 'Work at the Book Nook bookstore', textKo: '북 누크 서점에서 일하게 하기' },
      { key: 'D', textEn: 'Guard the panda enclosure at night', textKo: '밤마다 판다 우리를 지키게 하기' },
      { key: 'E', textEn: 'Deliver the Panda Paper to every house', textKo: '판다 페이퍼를 집집마다 배달하게 하기' },
    ],
    correctKey: 'B',
  },
];

export default function PandaPuzzleQuizPage() {
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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">The Panda Puzzle</h1>
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
