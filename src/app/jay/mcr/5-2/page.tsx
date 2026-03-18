'use client';

import { useState } from 'react';

type McQuestion = {
  id: number;
  type: 'mc';
  text: string;
  options: string[];
  correctIndex: number;
};

type ShortAnswerQuestion = {
  id: number;
  type: 'short';
  text: string;
  answer: string;
};

type Question = McQuestion | ShortAnswerQuestion;

type Answer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type QuestionChecker = (q: Question, a: Answer) => boolean;

type KeyItem = {
  id: number;
  answer: string;
  explanation: string;
};

const questions: Question[] = [
  // Part 1 · Choose the correct meaning
  {
    id: 1,
    type: 'mc',
    text: 'What does "commotion" mean?',
    options: ['quiet place', 'noisy excitement and confusion', 'deep sleep', 'strong wind'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'What does "nasty" mean?',
    options: ['very bad to look at, smell, or taste', 'very clean', 'very expensive', 'very fast'],
    correctIndex: 0,
  },
  {
    id: 3,
    type: 'mc',
    text: 'What is a "wart"?',
    options: ['a big animal', 'a small hard lump on the skin', 'a type of food', 'a soft pillow'],
    correctIndex: 1,
  },
  {
    id: 4,
    type: 'mc',
    text: 'How do you feel if you are "annoyed"?',
    options: ['feeling very happy', 'feeling excited', 'feeling hungry', 'feeling slightly angry'],
    correctIndex: 3,
  },
  {
    id: 5,
    type: 'mc',
    text: 'What does "oath" mean?',
    options: ['a joke', 'a game', 'a promise', 'a story'],
    correctIndex: 2,
  },
  {
    id: 6,
    type: 'mc',
    text: 'What does "obey" mean?',
    options: ['to break rules', 'to run away', 'to do what someone tells you', 'to forget'],
    correctIndex: 2,
  },
  {
    id: 7,
    type: 'mc',
    text: 'What is a "tantrum"?',
    options: ['a childish burst of anger', 'a quiet talk', 'a long trip', 'a loud song'],
    correctIndex: 0,
  },
  {
    id: 8,
    type: 'mc',
    text: 'Who is an "elder"?',
    options: ['a teacher', 'a person of higher age', 'a stranger', 'a student'],
    correctIndex: 1,
  },
  {
    id: 9,
    type: 'mc',
    text: 'What does "puzzled" mean?',
    options: ['being confused', 'being excited', 'being bored', 'being tired'],
    correctIndex: 0,
  },
  {
    id: 10,
    type: 'mc',
    text: 'What is "specialty"?',
    options: ['something you dislike', 'something broken', 'something lost', 'something you are known for doing well'],
    correctIndex: 3,
  },

  // Part 2 · Choose the correct word
  {
    id: 11,
    type: 'mc',
    text: 'Noisy excitement and confusion',
    options: ['oath', 'elder', 'commotion', 'puzzled'],
    correctIndex: 2,
  },
  {
    id: 12,
    type: 'mc',
    text: 'Very bad to look at, smell, or taste',
    options: ['obey', 'wart', 'specialty', 'nasty'],
    correctIndex: 3,
  },
  {
    id: 13,
    type: 'mc',
    text: 'A small hard lump on the skin',
    options: ['tantrum', 'oath', 'wart', 'elder'],
    correctIndex: 2,
  },
  {
    id: 14,
    type: 'mc',
    text: 'Feeling slightly angry',
    options: ['puzzled', 'annoyed', 'nasty', 'obey'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: 'A formal promise',
    options: ['oath', 'commotion', 'tantrum', 'specialty'],
    correctIndex: 0,
  },
  {
    id: 16,
    type: 'mc',
    text: 'To do what someone tells you',
    options: ['puzzled', 'nasty', 'specialty', 'obey'],
    correctIndex: 3,
  },
  {
    id: 17,
    type: 'mc',
    text: 'A childish burst of anger',
    options: ['tantrum', 'oath', 'wart', 'specialty'],
    correctIndex: 0,
  },
  {
    id: 18,
    type: 'mc',
    text: 'A person of higher age',
    options: ['puzzled', 'annoyed', 'elder', 'obey'],
    correctIndex: 2,
  },
  {
    id: 19,
    type: 'mc',
    text: 'Being confused or unable to understand',
    options: ['nasty', 'puzzled', 'oath', 'tantrum'],
    correctIndex: 1,
  },
  {
    id: 20,
    type: 'mc',
    text: 'Something a person is known for doing well',
    options: ['nasty', 'wart', 'annoyed', 'specialty'],
    correctIndex: 3,
  },

  // Part 3 · Fill in the blank (multiple choice)
  {
    id: 21,
    type: 'mc',
    text: 'I went outside to see why there was a ______.',
    options: ['commotion', 'oath', 'elder', 'puzzled'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'This food looks ______.',
    options: ['oath', 'nasty', 'puzzled', 'obey'],
    correctIndex: 1,
  },
  {
    id: 23,
    type: 'mc',
    text: 'He had a ______ on his finger.',
    options: ['tantrum', 'oath', 'wart', 'specialty'],
    correctIndex: 2,
  },
  {
    id: 24,
    type: 'mc',
    text: 'She was ______ by the loud noise.',
    options: ['oath', 'elder', 'nasty', 'annoyed'],
    correctIndex: 3,
  },
  {
    id: 25,
    type: 'mc',
    text: 'They took an ______ to tell the truth.',
    options: ['commotion', 'wart', 'tantrum', 'oath'],
    correctIndex: 3,
  },
  {
    id: 26,
    type: 'mc',
    text: 'You must ______ your teacher.',
    options: ['obey', 'specialty', 'nasty', 'elder'],
    correctIndex: 0,
  },
  {
    id: 27,
    type: 'mc',
    text: 'The child had a ______ in the store.',
    options: ['tantrum', 'oath', 'specialty', 'wart'],
    correctIndex: 0,
  },
  {
    id: 28,
    type: 'mc',
    text: 'The ______ told many stories.',
    options: ['nasty', 'annoyed', 'elder', 'commotion'],
    correctIndex: 2,
  },
  {
    id: 29,
    type: 'mc',
    text: 'I was ______ by the difficult question.',
    options: ['annoyed', 'obey', 'puzzled', 'oath'],
    correctIndex: 2,
  },
  {
    id: 30,
    type: 'mc',
    text: 'Cooking pasta is her ______.',
    options: ['commotion', 'specialty', 'wart', 'tantrum'],
    correctIndex: 1,
  },

  // Part 4 · Fill in the blank (short answer)
  {
    id: 31,
    type: 'short',
    text: 'I went outside to see why there was a ______.',
    answer: 'commotion',
  },
  {
    id: 32,
    type: 'short',
    text: 'This food looks ______.',
    answer: 'nasty',
  },
  {
    id: 33,
    type: 'short',
    text: 'He had a ______ on his finger.',
    answer: 'wart',
  },
  {
    id: 34,
    type: 'short',
    text: 'She was ______ by the loud noise.',
    answer: 'annoyed',
  },
  {
    id: 35,
    type: 'short',
    text: 'They took an ______ to tell the truth.',
    answer: 'oath',
  },
  {
    id: 36,
    type: 'short',
    text: 'You must ______ your teacher.',
    answer: 'obey',
  },
  {
    id: 37,
    type: 'short',
    text: 'The child had a ______ in the store.',
    answer: 'tantrum',
  },
  {
    id: 38,
    type: 'short',
    text: 'The ______ told many stories.',
    answer: 'elder',
  },
  {
    id: 39,
    type: 'short',
    text: 'I was ______ by the difficult question.',
    answer: 'puzzled',
  },
  {
    id: 40,
    type: 'short',
    text: 'Cooking pasta is her ______.',
    answer: 'specialty',
  },
];

const answerKey: KeyItem[] = [
  { id: 1, answer: 'B', explanation: '"Commotion" means noisy excitement and confusion.' },
  { id: 2, answer: 'A', explanation: '"Nasty" means very bad to look at, smell, or taste.' },
  { id: 3, answer: 'B', explanation: 'A "wart" is a small, hard lump on the skin.' },
  { id: 4, answer: 'D', explanation: '"Annoyed" means slightly angry.' },
  { id: 5, answer: 'C', explanation: 'An "oath" is a promise.' },
  { id: 6, answer: 'C', explanation: '"Obey" means to do what someone tells you.' },
  { id: 7, answer: 'A', explanation: 'A "tantrum" is a childish burst of anger.' },
  { id: 8, answer: 'B', explanation: 'An "elder" is a person of higher age.' },
  { id: 9, answer: 'A', explanation: '"Puzzled" means being confused.' },
  { id: 10, answer: 'D', explanation: 'A "specialty" is something you are known for doing well.' },
  { id: 11, answer: 'C', explanation: 'Noisy excitement and confusion is a commotion.' },
  { id: 12, answer: 'D', explanation: 'Very bad to look at, smell, or taste is nasty.' },
  { id: 13, answer: 'C', explanation: 'A small hard lump on the skin is a wart.' },
  { id: 14, answer: 'B', explanation: 'Feeling slightly angry is annoyed.' },
  { id: 15, answer: 'A', explanation: 'A formal promise is an oath.' },
  { id: 16, answer: 'D', explanation: 'To do what someone tells you is to obey.' },
  { id: 17, answer: 'A', explanation: 'A childish burst of anger is a tantrum.' },
  { id: 18, answer: 'C', explanation: 'A person of higher age is an elder.' },
  { id: 19, answer: 'B', explanation: 'Being confused or unable to understand is puzzled.' },
  { id: 20, answer: 'D', explanation: 'Something a person is known for doing well is a specialty.' },
  { id: 21, answer: 'A', explanation: 'I went outside to see why there was a commotion.' },
  { id: 22, answer: 'B', explanation: 'This food looks nasty.' },
  { id: 23, answer: 'C', explanation: 'He had a wart on his finger.' },
  { id: 24, answer: 'D', explanation: 'She was annoyed by the loud noise.' },
  { id: 25, answer: 'D', explanation: 'They took an oath to tell the truth.' },
  { id: 26, answer: 'A', explanation: 'You must obey your teacher.' },
  { id: 27, answer: 'A', explanation: 'The child had a tantrum in the store.' },
  { id: 28, answer: 'C', explanation: 'The elder told many stories.' },
  { id: 29, answer: 'C', explanation: 'I was puzzled by the difficult question.' },
  { id: 30, answer: 'B', explanation: 'Cooking pasta is her specialty.' },
  { id: 31, answer: 'commotion', explanation: 'Noisy excitement and confusion is a commotion.' },
  { id: 32, answer: 'nasty', explanation: 'Very bad to look at, smell, or taste is nasty.' },
  { id: 33, answer: 'wart', explanation: 'A small hard lump on the skin is a wart.' },
  { id: 34, answer: 'annoyed', explanation: 'Being slightly angry is annoyed.' },
  { id: 35, answer: 'oath', explanation: 'A formal promise is an oath.' },
  { id: 36, answer: 'obey', explanation: 'To do what someone tells you is to obey.' },
  { id: 37, answer: 'tantrum', explanation: 'A childish burst of anger is a tantrum.' },
  { id: 38, answer: 'elder', explanation: 'An older person is an elder.' },
  { id: 39, answer: 'puzzled', explanation: 'If you cannot understand, you are puzzled.' },
  { id: 40, answer: 'specialty', explanation: 'What you are known for doing well is your specialty.' },
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function isCorrect(question: Question, answer: Answer): boolean {
  if (question.type === 'mc') {
    return answer.choice === question.correctIndex;
  }

  return normalize(answer.text) === normalize(question.answer);
}

export default function VocabularyTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
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

    const isCorrectAnswer = normalize(shortAnswer) === normalize(currentQuestion.answer);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { choice: null, text: shortAnswer, isCorrect: isCorrectAnswer };
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
    setShortAnswer('');
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShortAnswer('');
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const isAnswered: QuestionChecker = (q, ans) =>
    q.type === 'mc' ? ans.choice !== null : ans.text.trim().length > 0;

  const correctCount = answers.filter((ans, index) => isCorrect(questions[index], ans)).length;
  const completedCount = answers.filter((ans, index) => isAnswered(questions[index], ans)).length;
  const wrongCount = answers.filter(
    (ans, index) => isAnswered(questions[index], ans) && !isCorrect(questions[index], ans),
  ).length;

  const partLabel = () => {
    if (currentIndex < 10) return 'Part 1 · Choose the correct meaning';
    if (currentIndex < 20) return 'Part 2 · Choose the correct word';
    if (currentIndex < 30) return 'Part 3 · Fill in the blank (Multiple Choice)';
    return 'Part 4 · Fill in the blank (Short Answer)';
  };

  const wrongQuestions = questions
    .map((q, idx) => ({ question: q, index: idx, answer: answers[idx] }))
    .filter(({ question, answer }) => answer.isCorrect === false && (answer.choice !== null || answer.text.trim().length > 0));

  const getCorrectLabel = (question: Question): string =>
    question.type === 'mc' ? String.fromCharCode(65 + question.correctIndex) : answerKey.find((k) => k.id === question.id)?.answer || '';

  const getSelectedLabel = (question: Question, answer: Answer): string => {
    if (question.type === 'mc') {
      if (answer.choice === null) return 'No answer';
      return String.fromCharCode(65 + answer.choice) + '. ' + question.options[answer.choice];
    }

    if (!answer.text.trim()) return 'No answer';
    return answer.text;
  };

  const currentCorrectAnswerText =
    currentQuestion.type === 'mc'
      ? `${String.fromCharCode(65 + currentQuestion.correctIndex)}. ${currentQuestion.options[currentQuestion.correctIndex]}`
      : answerKey.find((item) => item.id === currentQuestion.id)?.answer ?? '';

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
          maxWidth: 820,
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Total 40 Questions · Part 1 10 + Part 2 10 + Part 3 10 + Part 4 10 · One by one review mode</p>
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
              Question {completedCount} / {totalQuestions}
            </span>
            <span>
              Correct {correctCount} / Wrong {wrongCount}
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
                        const isCorrectAnswer = index === currentQuestion.correctIndex;
                        setSelectedOption(index);
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[currentIndex] = {
                            choice: index,
                            text: '',
                            isCorrect: isCorrectAnswer,
                          };
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
                  value={shortAnswer}
                  onChange={(event) => {
                    if (showFeedback) return;
                    setShortAnswer(event.target.value);
                  }}
                  placeholder="Type your answer"
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
                {showFeedback ? (
                  <>
                    {currentQuestion.type === 'mc' ? (
                      selectedOption === currentQuestion.correctIndex ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          Incorrect. The answer is {currentCorrectAnswerText}.
                        </span>
                      )
                    ) : isCorrect(questions[currentIndex], answers[currentIndex]) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        Incorrect. The answer is {currentCorrectAnswerText}.
                      </span>
                    )}
                  </>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
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
                    {currentIndex === questions.length - 1 ? 'See Results' : 'Next'}
                  </button>
                ) : currentQuestion.type !== 'mc' ? (
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
                    Check
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Result Summary</h2>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              Out of {totalQuestions} questions: <strong>{correctCount} correct</strong>,{' '}
              <strong>{totalQuestions - correctCount} wrong</strong>
            </p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Score: <strong>{Math.round((correctCount / totalQuestions) * 100)}%</strong>
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
              Restart
            </button>

            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Wrong Answers Review</h3>
            {wrongQuestions.length === 0 ? (
              <p style={{ fontSize: 14 }}>No wrong answers. Perfect score!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrongQuestions.map(({ question, answer }) => {
                  const key = answerKey.find((k) => k.id === question.id);
                  const correctText = getCorrectLabel(question);
                  const selectedText = getSelectedLabel(question, answer);

                  return (
                    <div
                      key={question.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Question {question.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{question.text}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        Your answer: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        Correct answer: <strong>{correctText}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: '#475569' }}>{key?.explanation}</div>
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
