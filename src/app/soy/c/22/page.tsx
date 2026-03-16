'use client';

import { useState } from 'react';

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

type Answer = {
  selected: number | null;
  isCorrect: boolean;
};

const questions: Question[] = [
  // Part 1
  {
    id: 1,
    text: 'Scientists work together to ______ biodiversity in the country.',
    options: ['abandon', 'maintain', 'damage', 'hide'],
    correctIndex: 1,
  },
  {
    id: 2,
    text: 'The new policy was created to ______ crime in the city.',
    options: ['increase', 'ignore', 'combat', 'allow'],
    correctIndex: 2,
  },
  {
    id: 3,
    text: 'A forest is the natural ______ of many animals.',
    options: ['consumer', 'habitat', 'expanse', 'publicity'],
    correctIndex: 1,
  },
  {
    id: 4,
    text: 'A person who buys goods or services is called a ______.',
    options: ['seller', 'sheriff', 'consumer', 'artist'],
    correctIndex: 2,
  },
  {
    id: 5,
    text: 'The ______ is the top-ranking officer in a county police force.',
    options: ['mayor', 'consumer', 'sheriff', 'judge'],
    correctIndex: 2,
  },
  {
    id: 6,
    text: 'Athletes use ______ to stay smelling fresh.',
    options: ['detergent', 'deodorant', 'medicine', 'lotion'],
    correctIndex: 1,
  },
  {
    id: 7,
    text: 'Someone who gets angry easily is ______.',
    options: ['easygoing', 'temperamental', 'calm', 'gentle'],
    correctIndex: 1,
  },
  {
    id: 8,
    text: 'The ocean felt like a huge ______ with no end.',
    options: ['habitat', 'expanse', 'obligation', 'exclusion'],
    correctIndex: 1,
  },
  {
    id: 9,
    text: 'The ugly, abandoned building was a real ______.',
    options: ['beauty', 'expanse', 'monstrosity', 'shelter'],
    correctIndex: 2,
  },
  {
    id: 10,
    text: 'After crying all day, the baby slept ______.',
    options: ['lightly', 'poorly', 'soundly', 'nervously'],
    correctIndex: 2,
  },
  {
    id: 11,
    text: 'The runner ______ his arms as he crossed the finish line.',
    options: ['draped', 'pumped', 'rested', 'folded'],
    correctIndex: 1,
  },
  {
    id: 12,
    text: 'The movie star received a lot of media ______.',
    options: ['obligation', 'publicity', 'exclusion', 'habitat'],
    correctIndex: 1,
  },
  {
    id: 13,
    text: 'She decided to ______ the scarf around her neck.',
    options: ['pump', 'drape', 'combat', 'maintain'],
    correctIndex: 1,
  },
  {
    id: 14,
    text: 'The professor was well-known and highly ______.',
    options: ['unremarkable', 'distinguished', 'careless', 'unknown'],
    correctIndex: 1,
  },
  {
    id: 15,
    text: 'Wearing formal clothes is ______ for a wedding.',
    options: ['improper', 'appropriate', 'careless', 'strange'],
    correctIndex: 1,
  },
  {
    id: 16,
    text: 'In the movie, the man began to ______ into a monster.',
    options: ['remain', 'morph', 'pump', 'hang'],
    correctIndex: 1,
  },
  {
    id: 17,
    text: 'Parents have an ______ to keep their children safe.',
    options: ['expanse', 'obligation', 'exclusion', 'publicity'],
    correctIndex: 1,
  },
  {
    id: 18,
    text: 'Trash is burned in an ______.',
    options: ['refrigerator', 'incinerator', 'freezer', 'container'],
    correctIndex: 1,
  },
  {
    id: 19,
    text: 'The bottles were reused beyond their ______ purpose.',
    options: ['intended', 'broken', 'hidden', 'damaged'],
    correctIndex: 0,
  },
  {
    id: 20,
    text: 'She felt a sense of ______ when she was not allowed to join.',
    options: ['inclusion', 'celebration', 'exclusion', 'honor'],
    correctIndex: 2,
  },

  // Part 2
  {
    id: 21,
    text: 'A synonym for maintain is:',
    options: ['destroy', 'keep', 'lose', 'abandon'],
    correctIndex: 1,
  },
  {
    id: 22,
    text: 'An antonym for combat is:',
    options: ['fight', 'stop', 'allow', 'battle'],
    correctIndex: 2,
  },
  {
    id: 23,
    text: 'A synonym for habitat is:',
    options: ['enemy', 'environment', 'danger', 'object'],
    correctIndex: 1,
  },
  {
    id: 24,
    text: 'An antonym for consumer is:',
    options: ['buyer', 'customer', 'seller', 'shopper'],
    correctIndex: 2,
  },
  {
    id: 25,
    text: 'A synonym for temperamental is:',
    options: ['moody', 'cheerful', 'patient', 'steady'],
    correctIndex: 0,
  },
  {
    id: 26,
    text: 'A synonym for expanse is:',
    options: ['stretch', 'corner', 'room', 'limit'],
    correctIndex: 0,
  },
  {
    id: 27,
    text: 'An antonym for monstrosity is:',
    options: ['ruin', 'eyesore', 'beauty', 'disaster'],
    correctIndex: 2,
  },
  {
    id: 28,
    text: 'A synonym for soundly is:',
    options: ['lightly', 'deeply', 'briefly', 'barely'],
    correctIndex: 1,
  },
  {
    id: 29,
    text: 'A synonym for pump is:',
    options: ['pull', 'push', 'drop', 'stop'],
    correctIndex: 1,
  },
  {
    id: 30,
    text: 'A synonym for publicity is:',
    options: ['silence', 'exposure', 'hiding', 'privacy'],
    correctIndex: 1,
  },
  {
    id: 31,
    text: 'A synonym for drape is:',
    options: ['fold', 'hang', 'tear', 'throw'],
    correctIndex: 1,
  },
  {
    id: 32,
    text: 'An antonym for distinguished is:',
    options: ['famous', 'respected', 'unremarkable', 'honored'],
    correctIndex: 2,
  },
  {
    id: 33,
    text: 'A synonym for appropriate is:',
    options: ['improper', 'fitting', 'careless', 'rude'],
    correctIndex: 1,
  },
  {
    id: 34,
    text: 'An antonym for morph is:',
    options: ['change', 'alter', 'remain', 'shift'],
    correctIndex: 2,
  },
  {
    id: 35,
    text: 'A synonym for obligation is:',
    options: ['choice', 'responsibility', 'wish', 'dream'],
    correctIndex: 1,
  },
  {
    id: 36,
    text: 'A synonym for incinerator is:',
    options: ['freezer', 'container', 'furnace', 'sink'],
    correctIndex: 2,
  },
  {
    id: 37,
    text: 'A synonym for intended is:',
    options: ['accidental', 'expected', 'damaged', 'lost'],
    correctIndex: 1,
  },
  {
    id: 38,
    text: 'An antonym for intended is:',
    options: ['planned', 'designed', 'unexpected', 'chosen'],
    correctIndex: 2,
  },
  {
    id: 39,
    text: 'A synonym for exclusion is:',
    options: ['inclusion', 'isolation', 'friendship', 'welcome'],
    correctIndex: 1,
  },
  {
    id: 40,
    text: 'An antonym for exclusion is:',
    options: ['separation', 'refusal', 'inclusion', 'distance'],
    correctIndex: 2,
  },
];

export default function VocabQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => ({ selected: null, isCorrect: false })));
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      return;
    }
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      // 마지막 문제였다면 결과 화면으로
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers(questions.map(() => ({ selected: null, isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const completedCount = answers.filter((a) => a.selected !== null).length;
  const wrongCount = answers.filter((a) => a.selected !== null && !a.isCorrect).length;
  const wrongQuestions = questions.filter((_, idx) => {
    const ans = answers[idx];
    return ans.selected !== null && !ans.isCorrect;
  });

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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 22 Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            40문제 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기
          </p>
        </header>

        {/* 진행 상태 바 */}
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
            {/* 문제 영역 */}
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
                {currentIndex < 20 ? 'Part 1 · Multiple Choice' : 'Part 2 · Synonym / Antonym'}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                {currentQuestion.id}. {currentQuestion.text}
              </h2>
            </div>

            {/* 보기 영역 */}
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
                        next[currentIndex] = { selected: index, isCorrect };
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

            {/* 피드백 + 버튼 */}
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
                {showFeedback && selectedOption !== null && (
                  <>
                    {selectedOption === currentQuestion.correctIndex ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ 정답입니다!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        ❌ 오답입니다. 정답은 {String.fromCharCode(65 + currentQuestion.correctIndex)}.{' '}
                        {currentQuestion.options[currentQuestion.correctIndex]}
                        입니다.
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {showFeedback && (
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
                )}
              </div>
            </div>
          </>
        ) : (
          // 결과 화면
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
              <p style={{ fontSize: 14 }}>틀린 문제가 없습니다. 완벽해요! 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrongQuestions.map((q) => {
                  const idx = questions.findIndex((qq) => qq.id === q.id);
                  const ans = answers[idx];
                  const selectedText = ans.selected !== null ? q.options[ans.selected] : '선택 안 함';

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
                        👉 내가 선택한 답: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        ✅ 정답: <strong>{q.options[q.correctIndex]}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
