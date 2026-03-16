'use client';

import { useState } from 'react';

type McQuestion = {
  id: number;
  type: 'mc';
  text: string;
  options: string[];
  correctIndex: number;
};

type SpellingQuestion = {
  id: number;
  type: 'spelling';
  text: string;
  answer: string;
};

type Question = McQuestion | SpellingQuestion;

type Answer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type VocabRow = {
  word: string;
  pos: string;
  synonym: string;
  antonym: string;
};

const questions: Question[] = [
  // Part 1 - Multiple Choice
  {
    id: 1,
    type: 'mc',
    text: 'Someone who starts their own business',
    options: ['custodian', 'entrepreneur', 'foundation', 'objective'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'The act of putting money into something to make profit',
    options: ['investment', 'penalty', 'rejection', 'incident'],
    correctIndex: 0,
  },
  {
    id: 3,
    type: 'mc',
    text: 'To refuse an offer',
    options: ['conquer', 'click', 'turn down', 'impact'],
    correctIndex: 2,
  },
  {
    id: 4,
    type: 'mc',
    text: 'The act of refusing to accept something',
    options: ['rejection', 'foundation', 'impact', 'reward'],
    correctIndex: 0,
  },
  {
    id: 5,
    type: 'mc',
    text: 'To suddenly understand something',
    options: ['desensitize', 'click', 'conquer', 'quiver'],
    correctIndex: 1,
  },
  {
    id: 6,
    type: 'mc',
    text: 'In a way that affects your feelings',
    options: ['generally', 'individually', 'personally', 'sly'],
    correctIndex: 2,
  },
  {
    id: 7,
    type: 'mc',
    text: 'To make someone less sensitive to something',
    options: ['impact', 'desensitize', 'conquer', 'quiver'],
    correctIndex: 1,
  },
  {
    id: 8,
    type: 'mc',
    text: 'Likely to cause harm',
    options: ['honorable', 'sly', 'menacing', 'preliminary'],
    correctIndex: 2,
  },
  {
    id: 9,
    type: 'mc',
    text: 'A person who cleans and takes care of a school',
    options: ['custodian', 'entrepreneur', 'maniac', 'judge'],
    correctIndex: 0,
  },
  {
    id: 10,
    type: 'mc',
    text: 'An unpleasant or unusual event',
    options: ['foundation', 'incident', 'investment', 'objective'],
    correctIndex: 1,
  },
  {
    id: 11,
    type: 'mc',
    text: 'Not letting others know your true intentions',
    options: ['honest', 'sly', 'honorable', 'respectable'],
    correctIndex: 1,
  },
  {
    id: 12,
    type: 'mc',
    text: 'A punishment for breaking rules',
    options: ['reward', 'penalty', 'investment', 'objective'],
    correctIndex: 1,
  },
  {
    id: 13,
    type: 'mc',
    text: 'Coming before the final event',
    options: ['preliminary', 'final', 'menacing', 'individual'],
    correctIndex: 0,
  },
  {
    id: 14,
    type: 'mc',
    text: 'Shaking slightly',
    options: ['conquer', 'quivering', 'impact', 'basis'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: 'To take control by force',
    options: ['conquer', 'click', 'reject', 'aim'],
    correctIndex: 0,
  },
  {
    id: 16,
    type: 'mc',
    text: 'A person who behaves in an uncontrolled way',
    options: ['entrepreneur', 'maniac', 'custodian', 'judge'],
    correctIndex: 1,
  },
  {
    id: 17,
    type: 'mc',
    text: 'The base idea something is built on',
    options: ['impact', 'objective', 'foundation', 'investment'],
    correctIndex: 2,
  },
  {
    id: 18,
    type: 'mc',
    text: 'A goal someone plans to achieve',
    options: ['objective', 'basis', 'denial', 'penalty'],
    correctIndex: 0,
  },
  {
    id: 19,
    type: 'mc',
    text: 'A strong effect on someone',
    options: ['impact', 'quiver', 'sly', 'episode'],
    correctIndex: 0,
  },
  {
    id: 20,
    type: 'mc',
    text: 'Honest and fair',
    options: ['dishonorable', 'honorable', 'menacing', 'cunning'],
    correctIndex: 1,
  },

  // Part 2 - Synonym / Antonym
  {
    id: 21,
    type: 'mc',
    text: 'Synonym of entrepreneur',
    options: ['businessman', 'custodian', 'judge', 'janitor'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'Antonym of turn down',
    options: ['reject', 'accept', 'deny', 'refuse'],
    correctIndex: 1,
  },
  {
    id: 23,
    type: 'mc',
    text: 'Synonym of rejection',
    options: ['approval', 'denial', 'reward', 'basis'],
    correctIndex: 1,
  },
  {
    id: 24,
    type: 'mc',
    text: 'Synonym of click',
    options: ['dawn on', 'reject', 'conquer', 'aim'],
    correctIndex: 0,
  },
  {
    id: 25,
    type: 'mc',
    text: 'Antonym of personally',
    options: ['individually', 'generally', 'emotionally', 'sincerely'],
    correctIndex: 1,
  },
  {
    id: 26,
    type: 'mc',
    text: 'Synonym of desensitize',
    options: ['reward', 'deaden', 'accept', 'tremble'],
    correctIndex: 1,
  },
  {
    id: 27,
    type: 'mc',
    text: 'Synonym of menacing',
    options: ['threatening', 'honest', 'honorable', 'final'],
    correctIndex: 0,
  },
  {
    id: 28,
    type: 'mc',
    text: 'Synonym of custodian',
    options: ['janitor', 'businessman', 'judge', 'maniac'],
    correctIndex: 0,
  },
  {
    id: 29,
    type: 'mc',
    text: 'Synonym of incident',
    options: ['effect', 'episode', 'goal', 'basis'],
    correctIndex: 1,
  },
  {
    id: 30,
    type: 'mc',
    text: 'Synonym of sly',
    options: ['honest', 'cunning', 'honorable', 'respectable'],
    correctIndex: 1,
  },
  {
    id: 31,
    type: 'mc',
    text: 'Antonym of sly',
    options: ['cunning', 'honest', 'threatening', 'madman'],
    correctIndex: 1,
  },
  {
    id: 32,
    type: 'mc',
    text: 'Antonym of penalty',
    options: ['reward', 'punishment', 'violation', 'impact'],
    correctIndex: 0,
  },
  {
    id: 33,
    type: 'mc',
    text: 'Synonym of preliminary',
    options: ['final', 'introductory', 'objective', 'episode'],
    correctIndex: 1,
  },
  {
    id: 34,
    type: 'mc',
    text: 'Antonym of preliminary',
    options: ['introductory', 'first', 'final', 'basis'],
    correctIndex: 2,
  },
  {
    id: 35,
    type: 'mc',
    text: 'Synonym of quivering',
    options: ['shivering', 'threatening', 'rejecting', 'aiming'],
    correctIndex: 0,
  },
  {
    id: 36,
    type: 'mc',
    text: 'Synonym of conquer',
    options: ['lose', 'subjugate', 'reward', 'tremble'],
    correctIndex: 1,
  },
  {
    id: 37,
    type: 'mc',
    text: 'Antonym of conquer',
    options: ['subjugate', 'rule', 'lose', 'defeat'],
    correctIndex: 2,
  },
  {
    id: 38,
    type: 'mc',
    text: 'Synonym of maniac',
    options: ['madman', 'judge', 'businessman', 'leader'],
    correctIndex: 0,
  },
  {
    id: 39,
    type: 'mc',
    text: 'Synonym of foundation',
    options: ['basis', 'impact', 'aim', 'episode'],
    correctIndex: 0,
  },
  {
    id: 40,
    type: 'mc',
    text: 'Synonym of honorable',
    options: ['dishonest', 'respectable', 'cunning', 'threatening'],
    correctIndex: 1,
  },

  // Part 3 - Spelling
  {
    id: 41,
    type: 'spelling',
    text: 'Someone who starts a business',
    answer: 'entrepreneur',
  },
  {
    id: 42,
    type: 'spelling',
    text: 'To refuse',
    answer: 'turn down',
  },
  {
    id: 43,
    type: 'spelling',
    text: 'A strong effect',
    answer: 'impact',
  },
  {
    id: 44,
    type: 'spelling',
    text: 'Shaking slightly',
    answer: 'quivering',
  },
  {
    id: 45,
    type: 'spelling',
    text: 'A goal',
    answer: 'objective',
  },
  {
    id: 46,
    type: 'spelling',
    text: 'Not dangerous but seems harmful',
    answer: 'menacing',
  },
  {
    id: 47,
    type: 'spelling',
    text: 'A person who cleans a school',
    answer: 'custodian',
  },
  {
    id: 48,
    type: 'spelling',
    text: 'A punishment',
    answer: 'penalty',
  },
  {
    id: 49,
    type: 'spelling',
    text: 'To suddenly understand',
    answer: 'click',
  },
  {
    id: 50,
    type: 'spelling',
    text: 'An unusual event',
    answer: 'incident',
  },
  {
    id: 51,
    type: 'spelling',
    text: 'A person acting wildly',
    answer: 'maniac',
  },
  {
    id: 52,
    type: 'spelling',
    text: 'To take control by force',
    answer: 'conquer',
  },
  {
    id: 53,
    type: 'spelling',
    text: 'An early round before finals',
    answer: 'preliminary',
  },
  {
    id: 54,
    type: 'spelling',
    text: 'To make less sensitive',
    answer: 'desensitize',
  },
  {
    id: 55,
    type: 'spelling',
    text: 'Honest and fair',
    answer: 'honorable',
  },
  {
    id: 56,
    type: 'spelling',
    text: 'The act of refusing',
    answer: 'rejection',
  },
  {
    id: 57,
    type: 'spelling',
    text: 'The base idea of something',
    answer: 'foundation',
  },
  {
    id: 58,
    type: 'spelling',
    text: 'Putting money into something',
    answer: 'investment',
  },
  {
    id: 59,
    type: 'spelling',
    text: 'Secretly clever',
    answer: 'sly',
  },
  {
    id: 60,
    type: 'spelling',
    text: 'To understand suddenly - synonym phrase',
    answer: 'dawn on',
  },
];

const vocabTable: VocabRow[] = [
  { word: 'entrepreneur', pos: 'noun', synonym: 'businessman', antonym: '' },
  { word: 'investment', pos: 'noun', synonym: '', antonym: '' },
  { word: 'turn down', pos: 'verb', synonym: 'reject', antonym: 'accept' },
  { word: 'rejection', pos: 'noun', synonym: 'denial', antonym: 'approval' },
  { word: 'click', pos: 'verb', synonym: 'dawn on', antonym: '' },
  { word: 'personally', pos: 'adverb', synonym: 'individually', antonym: 'generally' },
  { word: 'desensitize', pos: 'verb', synonym: 'deaden', antonym: '' },
  { word: 'menacing', pos: 'adj', synonym: 'threatening', antonym: '' },
  { word: 'custodian', pos: 'noun', synonym: 'janitor', antonym: '' },
  { word: 'incident', pos: 'noun', synonym: 'episode', antonym: '' },
  { word: 'sly', pos: 'adj', synonym: 'cunning', antonym: 'honest' },
  { word: 'penalty', pos: 'noun', synonym: '', antonym: 'reward' },
  { word: 'preliminary', pos: 'adj', synonym: 'introductory', antonym: 'final' },
  { word: 'quivering', pos: 'adj', synonym: 'shivering', antonym: '' },
  { word: 'conquer', pos: 'verb', synonym: 'subjugate', antonym: 'lose' },
  { word: 'maniac', pos: 'noun', synonym: 'madman', antonym: '' },
  { word: 'foundation', pos: 'noun', synonym: 'basis', antonym: '' },
  { word: 'objective', pos: 'noun', synonym: 'aim', antonym: '' },
  { word: 'impact', pos: 'noun', synonym: 'effect', antonym: '' },
  { word: 'honorable', pos: 'adj', synonym: 'respectable', antonym: 'dishonorable' },
];

const spellingFocusWords = [
  'entrepreneur',
  'preliminary',
  'desensitize',
  'quivering',
  'honorable',
  'foundation',
  'objective',
  'investment',
  'incident',
  'custodian',
];

const misspellings = ['entreprenuer', 'prelimenary', 'desentize', 'quiverng', 'honarable'];

const sentenceChallengeWords = ['entrepreneur', 'impact', 'conquer', 'sly', 'penalty'];

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export default function VocabQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false })),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (currentQuestion.type === 'mc') {
      return;
    }

    const isCorrect = normalizeText(spellingInput) === normalizeText(currentQuestion.answer);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { choice: null, text: spellingInput, isCorrect };
      return next;
    });

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setSpellingInput('');
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSpellingInput('');
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const isAnswered = (q: Question, ans: Answer) => {
    if (q.type === 'mc') {
      return ans.choice !== null;
    }
    return ans.text.trim().length > 0;
  };
  const wrongQuestions = questions.filter((q, idx) => {
    const ans = answers[idx];
    return isAnswered(q, ans) && !ans.isCorrect;
  });
  const completedCount = answers.filter((ans, idx) => isAnswered(questions[idx], ans)).length;
  const wrongCount = answers.filter((ans, idx) => isAnswered(questions[idx], ans) && !ans.isCorrect).length;

  const partLabel = () => {
    if (currentIndex < 20) return 'Part 1 · Multiple Choice';
    if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
    return 'Part 3 · Spelling';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <header
          style={{
            borderBottom: '1px solid #e5e7eb',
            marginBottom: 20,
            paddingBottom: 12,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 3 Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            60문제 · 객관식 40 + 스펠링 20 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기
          </p>
        </header>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            <span>
              문제 {completedCount} / {totalQuestions}
            </span>
            <span>
              정답 {correctCount}개 / 오답 {wrongCount}개
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(completedCount / totalQuestions) * 100}%`,
                maxWidth: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {!isFinished ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {partLabel()}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                {currentQuestion.id}. {currentQuestion.text}
              </h2>
            </div>

            {currentQuestion.type === 'mc' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectOption = showFeedback && index === currentQuestion.correctIndex;
                  const isWrongSelected = showFeedback && isSelected && !isCorrectOption;

                  let borderColor = '#e5e7eb';
                  let background = '#ffffff';

                  if (isCorrectOption) {
                    borderColor = '#16a34a';
                    background = '#dcfce7';
                  } else if (isWrongSelected) {
                    borderColor = '#ef4444';
                    background = '#fee2e2';
                  } else if (isSelected) {
                    borderColor = '#3b82f6';
                    background = '#eff6ff';
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (showFeedback) return;
                        const isCorrect = index === currentQuestion.correctIndex;
                        setSelectedOption(index);
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[currentIndex] = { choice: index, text: '', isCorrect };
                          return next;
                        });
                        setShowFeedback(true);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: `2px solid ${borderColor}`,
                        background,
                        cursor: showFeedback ? 'default' : 'pointer',
                        fontSize: 14,
                      }}
                    >
                      <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={spellingInput}
                  onChange={(event) => {
                    if (showFeedback) return;
                    setSpellingInput(event.target.value);
                  }}
                  placeholder="정답을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    fontSize: 14,
                  }}
                />
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ minHeight: 24, fontSize: 14 }}>
                {showFeedback && (
                  <>
                    {currentQuestion.type === 'mc' ? (
                      selectedOption === currentQuestion.correctIndex ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>정답입니다!</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          오답입니다. 정답은 {String.fromCharCode(65 + currentQuestion.correctIndex)}.{' '}
                          {currentQuestion.options[currentQuestion.correctIndex]}입니다.
                        </span>
                      )
                    ) : normalizeText(spellingInput) === normalizeText(currentQuestion.answer) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>정답입니다!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        오답입니다. 정답은 {currentQuestion.answer}입니다.
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!showFeedback && currentQuestion.type !== 'mc' ? (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: 'none',
                      background: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    정답 확인
                  </button>
                ) : null}
                {showFeedback ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: 'none',
                      background: '#10b981',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {currentIndex === questions.length - 1 ? '결과 보기' : '다음 문제'}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>결과 요약</h2>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              총 {totalQuestions}문제 중 <strong>{correctCount}개 정답</strong>,{' '}
              <strong>{totalQuestions - correctCount}개 오답</strong>
            </p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              점수: <strong>{Math.round((correctCount / totalQuestions) * 100)}점</strong>
            </p>

            <button
              type="button"
              onClick={handleRestart}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                background: '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              다시 풀기
            </button>

            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>내가 틀린 문제 모음</h3>
            {wrongQuestions.length === 0 ? (
              <p style={{ fontSize: 14 }}>틀린 문제가 없습니다. 완벽해요!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrongQuestions.map((q) => {
                  const idx = questions.findIndex((qq) => qq.id === q.id);
                  const ans = answers[idx];

                  const selectedText =
                    q.type === 'mc'
                      ? ans.choice !== null
                        ? q.options[ans.choice]
                        : '선택 안 함'
                      : ans.text.trim() || '미입력';

                  const correctText = q.type === 'mc' ? q.options[q.correctIndex] : q.answer;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 4,
                        }}
                      >
                        문제 {q.id}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{q.text}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        내가 입력/선택한 답: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        정답: <strong>{correctText}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Vocabulary Table</h3>
            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  minWidth: 560,
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Word</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Part of Speech</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Synonym</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Antonym</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabTable.map((row) => (
                    <tr key={row.word}>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.word}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.pos}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.synonym}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.antonym}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Spelling Intensive Review Set</h3>

            <div style={{ fontSize: 14, marginBottom: 10 }}>
              <strong>Step 1 - Look carefully</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {spellingFocusWords.map((word) => (
                <span
                  key={word}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Step 2 - Cover and Write</strong>: Write each word 3 times.
            </div>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Step 3 - Spot the mistake</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {misspellings.map((word) => (
                <span
                  key={word}
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Step 4 - Sentence Challenge</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sentenceChallengeWords.map((word) => (
                <span
                  key={word}
                  style={{
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
