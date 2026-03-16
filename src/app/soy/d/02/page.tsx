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
    text: 'When the singer appeared, there was a loud ______ in the crowd.',
    options: ['directory', 'commotion', 'burden', 'access'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'The hotel staff were very ______ and polite to the guests.',
    options: ['revolting', 'courteous', 'exclusive', 'improper'],
    correctIndex: 1,
  },
  {
    id: 3,
    type: 'mc',
    text: 'The athlete was so ______ that she trained every day.',
    options: ['disciplined', 'ignorant', 'logical', 'clueless'],
    correctIndex: 0,
  },
  {
    id: 4,
    type: 'mc',
    text: 'The coach used a ______ to make his voice louder.',
    options: ['directory', 'huddle', 'bullhorn', 'burden'],
    correctIndex: 2,
  },
  {
    id: 5,
    type: 'mc',
    text: 'He was ______ of the rules and did not know what to do.',
    options: ['knowledgeable', 'exclusive', 'ignorant', 'rational'],
    correctIndex: 2,
  },
  {
    id: 6,
    type: 'mc',
    text: 'The smell was so ______ that everyone covered their noses.',
    options: ['revolting', 'courteous', 'unlimited', 'logical'],
    correctIndex: 0,
  },
  {
    id: 7,
    type: 'mc',
    text: 'The players stood in a small ______ before the game started.',
    options: ['directory', 'huddle', 'commotion', 'access'],
    correctIndex: 1,
  },
  {
    id: 8,
    type: 'mc',
    text: 'I found her phone number in the school ______.',
    options: ['directory', 'burden', 'role', 'declaration'],
    correctIndex: 0,
  },
  {
    id: 9,
    type: 'mc',
    text: 'She plans to ______ her own company next year.',
    options: ['declare', 'found', 'access', 'huddle'],
    correctIndex: 1,
  },
  {
    id: 10,
    type: 'mc',
    text: 'He is a ______ businessman who built everything himself.',
    options: ['revolting', 'self-made', 'improper', 'ignorant'],
    correctIndex: 1,
  },
  {
    id: 11,
    type: 'mc',
    text: 'The test was ______ difficult for most students.',
    options: ['ordinarily', 'incredibly', 'improperly', 'politely'],
    correctIndex: 1,
  },
  {
    id: 12,
    type: 'mc',
    text: 'This club is ______ and only members can enter.',
    options: ['public', 'logical', 'exclusive', 'endless'],
    correctIndex: 2,
  },
  {
    id: 13,
    type: 'mc',
    text: 'She was given ______ access to the library.',
    options: ['restricted', 'improper', 'unlimited', 'rational'],
    correctIndex: 2,
  },
  {
    id: 14,
    type: 'mc',
    text: 'Students do not have ______ to that website.',
    options: ['burden', 'access', 'role', 'commotion'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: 'Winning at age five is an ______ achievement.',
    options: ['average', 'improper', 'extraordinary', 'logical'],
    correctIndex: 2,
  },
  {
    id: 16,
    type: 'mc',
    text: 'Hard work can ______ in your success.',
    options: ['found', 'declare', 'play a role', 'revolt'],
    correctIndex: 2,
  },
  {
    id: 17,
    type: 'mc',
    text: 'His argument was clear and ______.',
    options: ['logical', 'revolting', 'clueless', 'improper'],
    correctIndex: 0,
  },
  {
    id: 18,
    type: 'mc',
    text: 'In court, the ______ is on the prosecutor.',
    options: ['huddle', 'burden of proof', 'directory', 'access'],
    correctIndex: 1,
  },
  {
    id: 19,
    type: 'mc',
    text: 'The president will ______ the new policy tomorrow.',
    options: ['declare', 'access', 'huddle', 'found'],
    correctIndex: 0,
  },
  {
    id: 20,
    type: 'mc',
    text: 'If you use the machine ______, it may break.',
    options: ['logically', 'improperly', 'courteously', 'extraordinarily'],
    correctIndex: 1,
  },

  // Part 2 - Synonym / Antonym
  {
    id: 21,
    type: 'mc',
    text: 'Synonym of commotion:',
    options: ['uproar', 'silence', 'directory', 'logic'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'Antonym of courteous:',
    options: ['polite', 'well-mannered', 'impolite', 'rational'],
    correctIndex: 2,
  },
  {
    id: 23,
    type: 'mc',
    text: 'Synonym of disciplined:',
    options: ['restrained', 'wild', 'ignorant', 'revolting'],
    correctIndex: 0,
  },
  {
    id: 24,
    type: 'mc',
    text: 'Synonym of bullhorn:',
    options: ['microphone', 'megaphone', 'directory', 'access'],
    correctIndex: 1,
  },
  {
    id: 25,
    type: 'mc',
    text: 'Synonym of ignorant:',
    options: ['knowledgeable', 'clueless', 'logical', 'disciplined'],
    correctIndex: 1,
  },
  {
    id: 26,
    type: 'mc',
    text: 'Antonym of ignorant:',
    options: ['clueless', 'revolting', 'knowledgeable', 'improper'],
    correctIndex: 2,
  },
  {
    id: 27,
    type: 'mc',
    text: 'Synonym of revolting:',
    options: ['sickening', 'pleasing', 'polite', 'ordinary'],
    correctIndex: 0,
  },
  {
    id: 28,
    type: 'mc',
    text: 'Antonym of revolting:',
    options: ['disgusting', 'sickening', 'pleasing', 'improper'],
    correctIndex: 2,
  },
  {
    id: 29,
    type: 'mc',
    text: 'Synonym of found:',
    options: ['establish', 'destroy', 'declare', 'access'],
    correctIndex: 0,
  },
  {
    id: 30,
    type: 'mc',
    text: 'Antonym of self-made:',
    options: ['independent', 'dependent', 'disciplined', 'rational'],
    correctIndex: 1,
  },
  {
    id: 31,
    type: 'mc',
    text: 'Synonym of incredibly:',
    options: ['ordinarily', 'extremely', 'improperly', 'politely'],
    correctIndex: 1,
  },
  {
    id: 32,
    type: 'mc',
    text: 'Synonym of exclusive:',
    options: ['restricted', 'public', 'ordinary', 'unlimited'],
    correctIndex: 0,
  },
  {
    id: 33,
    type: 'mc',
    text: 'Antonym of exclusive:',
    options: ['restricted', 'limited', 'public', 'extraordinary'],
    correctIndex: 2,
  },
  {
    id: 34,
    type: 'mc',
    text: 'Synonym of unlimited:',
    options: ['endless', 'restricted', 'public', 'ordinary'],
    correctIndex: 0,
  },
  {
    id: 35,
    type: 'mc',
    text: 'Synonym of access:',
    options: ['entry', 'denial', 'burden', 'commotion'],
    correctIndex: 0,
  },
  {
    id: 36,
    type: 'mc',
    text: 'Synonym of extraordinary:',
    options: ['average', 'exceptional', 'ordinary', 'logical'],
    correctIndex: 1,
  },
  {
    id: 37,
    type: 'mc',
    text: 'Synonym of logical:',
    options: ['rational', 'illogical', 'clueless', 'revolting'],
    correctIndex: 0,
  },
  {
    id: 38,
    type: 'mc',
    text: 'Antonym of logical:',
    options: ['rational', 'illogical', 'reasonable', 'disciplined'],
    correctIndex: 1,
  },
  {
    id: 39,
    type: 'mc',
    text: 'Synonym of declare:',
    options: ['proclaim', 'whisper', 'deny', 'restrict'],
    correctIndex: 0,
  },
  {
    id: 40,
    type: 'mc',
    text: 'Synonym of improperly:',
    options: ['properly', 'incorrectly', 'logically', 'politely'],
    correctIndex: 1,
  },

  // Part 3 - Spelling
  {
    id: 41,
    type: 'spelling',
    text: 'comotion → ______',
    answer: 'commotion',
  },
  {
    id: 42,
    type: 'spelling',
    text: 'couragous → ______',
    answer: 'courteous',
  },
  {
    id: 43,
    type: 'spelling',
    text: 'disipplined → ______',
    answer: 'disciplined',
  },
  {
    id: 44,
    type: 'spelling',
    text: 'ignorent → ______',
    answer: 'ignorant',
  },
  {
    id: 45,
    type: 'spelling',
    text: 'revolting → ______',
    answer: 'revolting',
  },
  {
    id: 46,
    type: 'spelling',
    text: 'diractory → ______',
    answer: 'directory',
  },
  {
    id: 47,
    type: 'spelling',
    text: 'extrordinary → ______',
    answer: 'extraordinary',
  },
  {
    id: 48,
    type: 'spelling',
    text: 'unlimitted → ______',
    answer: 'unlimited',
  },
  {
    id: 49,
    type: 'spelling',
    text: 'acces → ______',
    answer: 'access',
  },
  {
    id: 50,
    type: 'spelling',
    text: 'increadibly → ______',
    answer: 'incredibly',
  },
  {
    id: 51,
    type: 'spelling',
    text: 'exclussive → ______',
    answer: 'exclusive',
  },
  {
    id: 52,
    type: 'spelling',
    text: 'logicle → ______',
    answer: 'logical',
  },
  {
    id: 53,
    type: 'spelling',
    text: 'burdon of proof → ______',
    answer: 'burden of proof',
  },
  {
    id: 54,
    type: 'spelling',
    text: 'declaire → ______',
    answer: 'declare',
  },
  {
    id: 55,
    type: 'spelling',
    text: 'improperley → ______',
    answer: 'improperly',
  },
  {
    id: 56,
    type: 'spelling',
    text: 'huddle → ______',
    answer: 'huddle',
  },
  {
    id: 57,
    type: 'spelling',
    text: 'selfmade → ______',
    answer: 'self-made',
  },
  {
    id: 58,
    type: 'spelling',
    text: 'megafone → ______',
    answer: 'megaphone',
  },
  {
    id: 59,
    type: 'spelling',
    text: 'knowledgable → ______',
    answer: 'knowledgeable',
  },
  {
    id: 60,
    type: 'spelling',
    text: 'extraordinery → ______',
    answer: 'extraordinary',
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 02 Vocabulary Test</h1>
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
          </div>
        )}
      </div>
    </div>
  );
}
