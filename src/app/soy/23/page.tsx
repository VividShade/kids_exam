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

const questions: Question[] = [
  // Part 1 - Multiple Choice
  {
    id: 1,
    type: 'mc',
    text: 'The balloon began to __ as the air escaped.',
    options: ['expand', 'contract', 'assist', 'amble'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'Her main __ was to learn English this year.',
    options: ['wrinkle', 'canine', 'objective', 'slat'],
    correctIndex: 2,
  },
  {
    id: 3,
    type: 'mc',
    text: 'You can __ new skills by practicing every day.',
    options: ['lose', 'acquire', 'hinder', 'wrinkle'],
    correctIndex: 1,
  },
  {
    id: 4,
    type: 'mc',
    text: 'Scientists __ animal movements to learn more about them.',
    options: ['sprint', 'monitor', 'amble', 'wrinkle'],
    correctIndex: 1,
  },
  {
    id: 5,
    type: 'mc',
    text: 'I always __ snow with winter holidays.',
    options: ['assist', 'associate', 'envision', 'contract'],
    correctIndex: 1,
  },
  {
    id: 6,
    type: 'mc',
    text: 'His face began to __ when he frowned.',
    options: ['smooth', 'wrinkle', 'assist', 'expand'],
    correctIndex: 1,
  },
  {
    id: 7,
    type: 'mc',
    text: 'She looked at the photos __, remembering happy times.',
    options: ['hatefully', 'fondly', 'slowly', 'tremendously'],
    correctIndex: 1,
  },
  {
    id: 8,
    type: 'mc',
    text: 'The monkey is very __ and jumps quickly between trees.',
    options: ['placid', 'nimble', 'wistful', 'lumbering'],
    correctIndex: 1,
  },
  {
    id: 9,
    type: 'mc',
    text: 'The tired bear began to __ through the forest.',
    options: ['sprint', 'lumber', 'hurry', 'assist'],
    correctIndex: 1,
  },
  {
    id: 10,
    type: 'mc',
    text: 'The fence was made of wooden __.',
    options: ['canines', 'slats', 'wrinkles', 'objectives'],
    correctIndex: 1,
  },
  {
    id: 11,
    type: 'mc',
    text: 'The lake was calm and __ in the morning.',
    options: ['agitated', 'placid', 'nimble', 'desirable'],
    correctIndex: 1,
  },
  {
    id: 12,
    type: 'mc',
    text: 'The tiger’s sharp __ help it tear meat.',
    options: ['slats', 'canines', 'boards', 'wrinkles'],
    correctIndex: 1,
  },
  {
    id: 13,
    type: 'mc',
    text: 'We __ along the beach at sunset.',
    options: ['sprinted', 'hurried', 'ambled', 'assisted'],
    correctIndex: 2,
  },
  {
    id: 14,
    type: 'mc',
    text: 'He gave a __ smile while thinking of the past.',
    options: ['nimble', 'wistful', 'desirable', 'placid'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: '__ is a grain that can be eaten.',
    options: ['Canine', 'Millet', 'Slat', 'Lipreading'],
    correctIndex: 1,
  },
  {
    id: 16,
    type: 'mc',
    text: 'She tried to __ her future career.',
    options: ['wrinkle', 'envision', 'assist', 'contract'],
    correctIndex: 1,
  },
  {
    id: 17,
    type: 'mc',
    text: 'He improved __ after daily practice.',
    options: ['slightly', 'tremendously', 'sadly', 'calmly'],
    correctIndex: 1,
  },
  {
    id: 18,
    type: 'mc',
    text: '__ helps people understand speech by watching mouths.',
    options: ['Monitor', 'Associate', 'Lipreading', 'Envision'],
    correctIndex: 2,
  },
  {
    id: 19,
    type: 'mc',
    text: 'This toy has many __ qualities.',
    options: ['undesirable', 'desirable', 'wistful', 'placid'],
    correctIndex: 1,
  },
  {
    id: 20,
    type: 'mc',
    text: 'She asked her brother to __ her with the heavy box.',
    options: ['hinder', 'assist', 'wrinkle', 'contract'],
    correctIndex: 1,
  },

  // Part 2 - Synonym / Antonym
  {
    id: 21,
    type: 'mc',
    text: 'A synonym for contract is:',
    options: ['expand', 'reduce', 'sprint', 'smooth'],
    correctIndex: 1,
  },
  {
    id: 22,
    type: 'mc',
    text: 'An antonym for expand is:',
    options: ['acquire', 'contract', 'assist', 'envision'],
    correctIndex: 1,
  },
  {
    id: 23,
    type: 'mc',
    text: 'A synonym for objective is:',
    options: ['slat', 'goal', 'wrinkle', 'canine'],
    correctIndex: 1,
  },
  {
    id: 24,
    type: 'mc',
    text: 'A synonym for acquire is:',
    options: ['lose', 'attain', 'hinder', 'amble'],
    correctIndex: 1,
  },
  {
    id: 25,
    type: 'mc',
    text: 'A synonym for monitor is:',
    options: ['track', 'wrinkle', 'hurry', 'sprint'],
    correctIndex: 0,
  },
  {
    id: 26,
    type: 'mc',
    text: 'A synonym for associate is:',
    options: ['disconnect', 'link', 'lose', 'smooth'],
    correctIndex: 1,
  },
  {
    id: 27,
    type: 'mc',
    text: 'An antonym for wrinkle is:',
    options: ['crease', 'fold', 'smooth', 'bend'],
    correctIndex: 2,
  },
  {
    id: 28,
    type: 'mc',
    text: 'A synonym for fondly is:',
    options: ['hatefully', 'affectionately', 'angrily', 'sadly'],
    correctIndex: 1,
  },
  {
    id: 29,
    type: 'mc',
    text: 'A synonym for nimble is:',
    options: ['slow', 'agile', 'placid', 'wistful'],
    correctIndex: 1,
  },
  {
    id: 30,
    type: 'mc',
    text: 'A synonym for lumber is:',
    options: ['sprint', 'plod', 'hurry', 'jump'],
    correctIndex: 1,
  },
  {
    id: 31,
    type: 'mc',
    text: 'A synonym for slat is:',
    options: ['tooth', 'board', 'goal', 'seed'],
    correctIndex: 1,
  },
  {
    id: 32,
    type: 'mc',
    text: 'A synonym for placid is:',
    options: ['agitated', 'serene', 'fast', 'loud'],
    correctIndex: 1,
  },
  {
    id: 33,
    type: 'mc',
    text: 'An antonym for placid is:',
    options: ['calm', 'serene', 'agitated', 'still'],
    correctIndex: 2,
  },
  {
    id: 34,
    type: 'mc',
    text: 'A synonym for amble is:',
    options: ['hurry', 'sprint', 'saunter', 'race'],
    correctIndex: 2,
  },
  {
    id: 35,
    type: 'mc',
    text: 'An antonym for amble is:',
    options: ['stroll', 'wander', 'hurry', 'walk'],
    correctIndex: 2,
  },
  {
    id: 36,
    type: 'mc',
    text: 'A synonym for wistful is:',
    options: ['joyful', 'melancholy', 'nimble', 'calm'],
    correctIndex: 1,
  },
  {
    id: 37,
    type: 'mc',
    text: 'A synonym for envision is:',
    options: ['forget', 'visualize', 'assist', 'lose'],
    correctIndex: 1,
  },
  {
    id: 38,
    type: 'mc',
    text: 'A synonym for tremendously is:',
    options: ['slightly', 'enormously', 'quietly', 'sadly'],
    correctIndex: 1,
  },
  {
    id: 39,
    type: 'mc',
    text: 'A synonym for desirable is:',
    options: ['appealing', 'useless', 'slow', 'angry'],
    correctIndex: 0,
  },
  {
    id: 40,
    type: 'mc',
    text: 'An antonym for assist is:',
    options: ['help', 'support', 'guide', 'hinder'],
    correctIndex: 3,
  },

  // Part 3 - Spelling
  {
    id: 41,
    type: 'spelling',
    text: 'become smaller → contr__t',
    answer: 'contract',
  },
  {
    id: 42,
    type: 'spelling',
    text: 'something you want to achieve → obj___tive',
    answer: 'objective',
  },
  {
    id: 43,
    type: 'spelling',
    text: 'get or obtain → acq___re',
    answer: 'acquire',
  },
  {
    id: 44,
    type: 'spelling',
    text: 'watch carefully → mon___or',
    answer: 'monitor',
  },
  {
    id: 45,
    type: 'spelling',
    text: 'connect ideas → asso___ate',
    answer: 'associate',
  },
  {
    id: 46,
    type: 'spelling',
    text: 'lines on the face → wr___kle',
    answer: 'wrinkle',
  },
  {
    id: 47,
    type: 'spelling',
    text: 'showing love → affec___nately',
    answer: 'affectionately',
  },
  {
    id: 48,
    type: 'spelling',
    text: 'able to move quickly → n___ble',
    answer: 'nimble',
  },
  {
    id: 49,
    type: 'spelling',
    text: 'move slowly and heavily → lu___er',
    answer: 'lumber',
  },
  {
    id: 50,
    type: 'spelling',
    text: 'calm and peaceful → pl___id',
    answer: 'placid',
  },
  {
    id: 51,
    type: 'spelling',
    text: 'sad and thoughtful → w___tful',
    answer: 'wistful',
  },
  {
    id: 52,
    type: 'spelling',
    text: 'go at a slow pace → a___le',
    answer: 'amble',
  },
  {
    id: 53,
    type: 'spelling',
    text: 'picture mentally → env___ion',
    answer: 'envision',
  },
  {
    id: 54,
    type: 'spelling',
    text: 'in an impressive way → treme___ously',
    answer: 'tremendously',
  },
  {
    id: 55,
    type: 'spelling',
    text: 'understanding speech by watching mouths → lipr___ding',
    answer: 'lipreading',
  },
  {
    id: 56,
    type: 'spelling',
    text: 'thin flat piece of wood → sl__',
    answer: 'slat',
  },
  {
    id: 57,
    type: 'spelling',
    text: 'sharp teeth → can___es',
    answer: 'canines',
  },
  {
    id: 58,
    type: 'spelling',
    text: 'helpful or pleasing → des___able',
    answer: 'desirable',
  },
  {
    id: 59,
    type: 'spelling',
    text: 'give help → ass___t',
    answer: 'assist',
  },
  {
    id: 60,
    type: 'spelling',
    text: 'slow walk → plo__',
    answer: 'plod',
  },
];

const normalizeText = (value: string) => value.trim().toLowerCase();

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
      if (selectedOption === null) {
        alert('보기를 하나 선택해주세요.');
        return;
      }

      const isCorrect = selectedOption === currentQuestion.correctIndex;

      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { choice: selectedOption, text: '', isCorrect };
        return next;
      });

      setShowFeedback(true);
      return;
    }

    if (!spellingInput.trim()) {
      alert('정답을 입력해주세요.');
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 23 Vocabulary Test</h1>
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
              문제 {currentIndex + 1} / {totalQuestions}
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
                width: `${((currentIndex + (isFinished ? 1 : 0)) / totalQuestions) * 100}%`,
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
                        setSelectedOption(index);
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
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ 정답입니다!</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          ❌ 오답입니다. 정답은 {String.fromCharCode(65 + currentQuestion.correctIndex)}.{' '}
                          {currentQuestion.options[currentQuestion.correctIndex]}입니다.
                        </span>
                      )
                    ) : normalizeText(spellingInput) === normalizeText(currentQuestion.answer) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ 정답입니다!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        ❌ 오답입니다. 정답은 {currentQuestion.answer}입니다.
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!showFeedback ? (
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
                ) : (
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
                        👉 내가 입력/선택한 답: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        ✅ 정답: <strong>{correctText}</strong>
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
